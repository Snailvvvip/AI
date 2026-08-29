import os
import logging
import sys
import asyncio
from openai import AuthenticationError
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from mcp.server.fastmcp import FastMCP
from openai import AsyncOpenAI
import json
from dotenv import load_dotenv

load_dotenv(override=True)


class Config:
    def __init__(self) -> None:
        self.log_level = os.environ.get("LOG_LEVEL", "INFO")
        self.mcp_command = os.environ.get("MCP_COMMAND", "python")
        self.llm_api_key = os.environ.get(
            "LLM_API_KEY", "sk-ae8009b3b2f540d99f1cfa6ba7b3bd4d"
        )
        self.llm_base_url = os.environ.get("LLM_BASE_URL", "https://api.deepseek.com")
        self.llm_model = os.environ.get("LLM_MODEL", "deepseek-v4-pro")

    # 获取MCP服务器的启动参数
    def get_mcp_server_params(self):
        # 构建MCP服务器启动参数
        args = [__file__, "serve"]
        # 返回MCP服务器启动参数 python  main.py serve
        return StdioServerParameters(command=self.mcp_command, args=args)


logger = logging.getLogger(__name__)


def setup_logging(level="INFO"):
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),  # 设置日志级别
        format="%(asctime)s [%(levelname)s] %(message)s",  # 设置日志输出的格式
        datefmt="%H:%M:%S",  # 设置日志时期时间和显示格式
    )


# 将MCP 工具转成OpenAI的function calling格式
def mcp_tools_to_openai_format(mcp_tools):
    # 定义保存转换后的工具列表
    result = []
    # 遍历每个MCP工具
    for tool in mcp_tools:
        # 获取工具的输入schema(参数说明)
        schema = (
            getattr(tool, "inputSchema", None)
            or getattr(tool, "input_schema", None)
            or {}
        )
        if not schema:
            schema = {"type": "object", "properties": {}, "required": []}
        # 将工具转为openai的function call 格式并添加到结果中
        result.append(
            {
                "name": tool.name,
                "description": tool.description or f"调用工具: {tool.name}",
                "parameters": schema,
            }
        )
    return result


# 辅助函数把message(ChatCompletionMessage实例)转成字典
def message_to_dict(message):
    # 初始化字典，角色写死为assistant ，内容取自message中的content
    d = {"role": "assistant", "content": message.content or None}
    # 如果message中包含工具调用的话
    if message.tool_calls:
        # 如果有工具调用的话，把content设置为None
        d["content"] = None
        # 把tool_calls从ChatCompletionMessageFunctionToolCall实例列表变成字典列表，里面的字段名和结构并没有变化
        d["tool_calls"] = [
            {
                "id": tc.id,  # 工具调用ID，每一个工具调用都有一个唯一的ID，这个ID是大模型内部生成并返回的
                "type": "function",  # 类型
                "function": {
                    "name": tc.function.name,  # 函数的名字
                    "arguments": tc.function.arguments or "{}",  # 函数的参数
                },
            }
            for tc in message.tool_calls
        ]
    return d


def send_msg(to, content):
    return f"已发送短信给{to},内容 {content}"


class MCPBridge:
    def __init__(self, config) -> None:
        self.config = config
        self._llm_client = AsyncOpenAI(
            api_key=self.config.llm_api_key, base_url=self.config.llm_base_url
        )

    # 异步单轮和多轮对话，实现桥接逻辑
    async def chat(self, user_message, session):
        # 获取MCP工具列表
        mcp_tools = list((await session.list_tools()).tools)
        # 把MCP工具列表转成OPENAI Function Calling格式列表
        function_defs = mcp_tools_to_openai_format(mcp_tools)
        # 构造tools参数
        tools = [{"type": "function", "function": f} for f in function_defs]
        # 添加了一个自定义工具，此工具并非来自于MCP服务器
        tools.append(
            {
                "type": "function",
                "function": {
                    "name": "send_msg",
                    "description": "给某人发送短信",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "to": {"type": "string"},
                            "content": {"type": "string"},
                        },
                        "required": ["to", "content"],
                    },
                },
            }
        )
        logger.info("tools:%s", tools)
        # 构建会话历史
        messages = [
            {
                "role": "system",
                "content": "你是一个有帮助的助手，当用户需要查天气、发邮件、计算的时候，能调用相应的工具完成任务",
            },
            {"role": "user", "content": user_message},
        ]
        # 设置最多工具调用的轮数，防止死循环
        max_tool_rounds = 5
        # 轮数计数器
        round_count = 0
        # 循环进行多轮调用，最多5轮
        while round_count < max_tool_rounds:
            round_count += 1
            response = await self._llm_client.chat.completions.create(
                model=self.config.llm_model,  # 模型
                messages=messages,  # 消息列表对话历史消息
                tools=tools,  # 传递工具定义，用于function calling
                tool_choice="auto",  # 让模型自己决定是否调用工具，调用哪个工具
            )
            # 获取模型回复的message
            message = response.choices[0].message
            # Messages with role 'tool' must be a response to a preceding message with 'tool_calls'
            # 拥有角色tool的消息必须是前面一个有tool_calls消息的响应
            # 把服务器返回的message转换成为openai api需的字典格式并添加到消息历史中
            # messages.append(message_to_dict(message))
            # 如果不需要调用，说明任务执行结束，直接返回答案
            if not message.tool_calls:
                return (message.content or "").strip()
            # 按模型的要求进行工具调用
            for tool_call in message.tool_calls:
                # 获取要调用的工具的名称
                name = tool_call.function.name
                # 获取工具调用的参数字符串
                args_str = tool_call.function.arguments or "{}"
                try:
                    arguments = json.loads(args_str)
                except json.JSONDecodeError:
                    arguments = {}
                logger.info("执行工具:%s", name)
                # 调用MCP工具
                result = await session.call_tool(name, arguments=arguments)
                # 提取MCP工具调用的结果的文本内容
                text = result.content[0].text if result.content else ""
                # 如果结果出错了
                if result.isError:
                    text = f"工具执行错误: {result.content}"
                # 将工具调用的结果添加到历史消息中
                messages.append(
                    {"role": "tool", "tool_call_id": tool_call.id, "content": text}
                )
        return "工具调用次数过多，已终止"


# 异步函数 桥接的入口 ：调用MCP子进程并与大模型对话
async def run_bridge(user_message, config):
    # 获取MCP服务器启动参数 python  main.py serve
    server_params = config.get_mcp_server_params()
    bridge = MCPBridge(config)
    # 使用stdio_client启动MCP服务器并建立通信流
    async with stdio_client(server_params) as (read_stream, write_stream):
        # 建立MCP会话
        async with ClientSession(read_stream, write_stream) as session:
            # 初始化会话
            await session.initialize()
            # 获取已经注册的MCP工具列表
            tools = await session.list_tools()
            logger.info("工具发现:%s", [tool.name for tool in tools.tools])
            # 调用桥接的逻辑
            return await bridge.chat(user_message, session)


# 创建并注册工具的MCP服务器
def create_mcp_server():
    mcp = FastMCP(name="MCP-Bridge")

    @mcp.tool()
    def get_weather(city):
        return f"{city}今天晴，气温  25度"

    @mcp.tool()
    def send_email(to, subject, body):
        return f"已发送邮件给{to},主题 {subject},正文:{body}"

    @mcp.tool()
    def add(a, b):
        return a + b

    return mcp


mcp = create_mcp_server()


# 以stdio模式运行MCP服务器，供MCP客户端访问
def run_server():
    logger.info("MCP服务器已经启动(stdio模式)")
    # 运行MCP服务器 以stdio模式
    mcp.run(transport="stdio")


if __name__ == "__main__":
    config = Config()
    setup_logging()
    # 如果参数是否以serve启动服务器
    if len(sys.argv) >= 2 and sys.argv[1] == "serve":
        run_server()
    else:  # 否则当作命令行问答客户端
        question = "北京今天的天气怎么样？"
        try:
            reply = asyncio.run(run_bridge(question, config))
            print(f"{question}:{reply}")
        except AuthenticationError:
            logger.error(f"API认证失败，请检查 API KEY是否正确配置")
            sys.exit(1)
