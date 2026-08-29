# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent
import time

# 从 middleware 导入模型重试中间件
from langchain.agents.middleware import (
    ModelRetryMiddleware,
    ToolRetryMiddleware,
    ToolErrorMiddleware,
)

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 加载 .env 中的 API key
load_dotenv(override=True)
# 用字典记录工具被真实调用了几次
attemps = {"n": 0}
# 记录每次调用发生的时间戳，用来反推退避间隔
stamps = []


# 工具 无论调用多少次都会超时异常
@tool
def value_error_tool(order_id: str) -> str:
    """查询订单状态"""
    print("value_error_tool")
    raise ValueError("参数不合法(不该重试)")


t0 = time.time()
# 工具执行失败的错误护栏
error_guard = ToolErrorMiddleware(
    tools=["value_error_tool"],  # 只针对这些工具进行兜底
    # on_error 可以是一个字符串，也可以是一个接收异常，并返回字符串的函数
    on_error=lambda exc, request: f"工具执行失败:{type(exc).__name__}。请向用户说明并建议稍后再试",
)
agent = create_agent(
    model="deepseek:deepseek-v4-flash",
    tools=[value_error_tool],
    middleware=[
        error_guard,
        ToolRetryMiddleware(
            max_retries=3,  # 初始调用失败后再重试的次数默认是2
            tools=[
                value_error_tool
            ],  # 只针对列表中的工具进行重试，写None的话表示针对每次的工具进行重试
            on_failure="error",  # 重试耗尽后，continue就是把错误信息灌回消息列表，交给后续的处理，error是抛出异常，让应用失败
            retry_on=(
                TimeoutError,
            ),  # 只针对超时的异常进行重试，针对ValueError错误不重试
        ),
    ],
)
messages = [{"role": "user", "content": "查一下A1001订单的状态"}]
try:
    result = agent.invoke({"messages": messages})  # type: ignore
    for i, msg in enumerate(result["messages"]):
        content = getattr(msg, "content", "")
        tool_calls = getattr(msg, "tool_calls", "")
        msg_type = type(msg).__name__
        print(f"[{i}] {msg_type}:{repr(content)} {repr(tool_calls)}")
except Exception as e:
    print(f"{type(e).__name__},耗时{time.time()-t0:.2f}")
# ToolMessage:"Tool 'search_order' failed after 4 attempts with TimeoutError: 连接下游超时. Please try again." ''
