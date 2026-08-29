# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent

# 导入模型调用限额中间件
from langchain.agents.middleware import ToolCallLimitMiddleware

# InMemorySaver 是最简单的 checkpointer 实现
from langgraph.checkpoint.memory import InMemorySaver
from rich import print

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 加载 .env 中的 API key
load_dotenv(override=True)


@tool
def get_weather(city: str) -> str:
    """查询城市天气"""
    return f"{city} 晴，25度"


agent = create_agent(
    model="deepseek:deepseek-v4-flash",
    tools=[get_weather],
    # thread_limit跨多次invoke累计，需要checkpointer+thread_id
    # checkpointer=InMemorySaver(),
    middleware=[
        ToolCallLimitMiddleware(
            # 只允许get_weather被调用1次
            tool_name="get_weather",
            run_limit=1,
        )
    ],
    system_prompt="查询天气必须调用get_weather工具，每个城市单独调一次",
)
# 这个invoke是指的对agent智能体的一次调用，在智能内部有AgentLoop.在AgentLoop内部可能会有多次大模型调用
result = agent.invoke(
    {
        "messages": [
            {"role": "user", "content": "北京和上海和成都和广州今天的天气如何?"}
        ]
    },
)
for i, msg in enumerate(result["messages"]):
    content = getattr(msg, "content", "")
    if content:
        print(msg)
    tool_calls = getattr(msg, "tool_calls", "")
    if tool_calls:
        print(msg)


# 我的邮件是 83687401@qq.com,  redact（脱敏）之后 [EMAIL]
# 我的邮件是 83687401@qq.com, mask（遮罩））之后 8******1@qq.com
# 我的邮件是 83687401@qq.com,  hash（哈希）之后 33feff33rf3
# 我的邮件是 83687401@qq.com,  block拦截就直接报错了
