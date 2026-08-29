# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent
import time

# 从 middleware 导入模型重试中间件
from langchain.agents.middleware import ModelRetryMiddleware, ToolRetryMiddleware

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
def search_order(order_id: str) -> str:
    """查询订单状态"""
    raise TimeoutError("连接下游超时")


t0 = time.time()
agent = create_agent(
    model="deepseek:deepseek-v4-flash",
    tools=[search_order],
    middleware=[
        ToolRetryMiddleware(
            max_retries=3,  # 初始调用失败后再重试的次数默认是2
            tools=[
                search_order
            ],  # 只针对列表中的工具进行重试，写None的话表示针对每次的工具进行重试
            on_failure="error",  # 重试耗尽后，continue就是把错误信息灌回消息列表，交给后续的处理，error是抛出异常，让应用失败
        )
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
