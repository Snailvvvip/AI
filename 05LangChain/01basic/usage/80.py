# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent

# 导入 PII 处理中间件
from langchain.agents.middleware import PIIMiddleware

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv
from langchain.agents.middleware import ModelRequest, PIIMiddleware, wrap_model_call

# 加载 .env 中的 API key
load_dotenv(override=True)


# 一个只读工具
@tool
def lookup_policy(topic: str) -> str:
    """查询制度摘要。"""
    return "咨询类问题请联系 HR 邮箱（制度原文不含个人邮箱）。"


@wrap_model_call
def spy(request: ModelRequest, handler):
    print("模型收到", [str(m.content) for m in request.messages])
    return handler(request)


# 创建 Agent 并挂上两种 PII 处理
agent = create_agent(
    # 模型标识
    model="deepseek:deepseek-v4-flash",
    # 工具列表
    tools=[lookup_policy],
    # 一种类型一个实例；两种类型 name 不同所以能共存
    middleware=[
        PIIMiddleware("email", strategy="redact", apply_to_tool_results=True),
        spy,
    ],
    # 提示层再加一句软约束
    system_prompt="你是办公助手。",
)
result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "我的邮箱是 alice@example.com，报销流程是什么？",
            }
        ]
    },
)
for i, msg in enumerate(result["messages"]):
    content = getattr(msg, "content", "")
    msg_type = type(msg).__name__
    print(f"[{i} {msg_type}] :{repr(content)}")
