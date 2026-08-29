# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent
import time

# 从 middleware 导入模型重试中间件
from langchain.agents.middleware import ModelRetryMiddleware

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 加载 .env 中的 API key
load_dotenv(override=True)


# 一个普通只读工具，用来构造一次正常调用
@tool
def lookup_policy(topic: str) -> str:
    """查询公司制度摘要。"""
    return f"{topic}： 差旅报销需在返程 7 日内提交。"


t0 = time.time()
agent = create_agent(
    model="deepseek:deepseek-v4-flash",
    tools=[lookup_policy],
    middleware=[
        ModelRetryMiddleware(
            initial_delay=1.0,  # 首次重试前的等待秒数
            backoff_factor=2.0,  # 退避倍数，每次等待时间乘以它
            max_retries=2,  # 初始调用失败后再重试的次数默认是2
            on_failure="error",  # 重试耗尽后，continue就是把错误信息灌回消息列表，交给后续的处理，error是抛出异常，让应用失败
        )
    ],
    system_prompt="问制度时调用lookup_policy，不要编造",
)
try:
    # 调一次失败 1秒后重试 再调一次又失败了 2笔后再重试
    result = agent.invoke({"messages": [{"role": "user", "content": "报销怎么走?"}]})
    print(result["messages"][-1].content)
except Exception as e:
    print(f"{type(e).__name__},耗时{time.time()-t0:.2f}")
