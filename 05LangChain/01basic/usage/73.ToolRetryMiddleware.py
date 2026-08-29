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


@tool
def flaky_order(order_id: str) -> str:
    """查询订单状态(模拟偶发超时)"""
    # 1.先让计数加1
    attemps["n"] += 1
    # 2.记录本次调用时刻
    stamps.append(time.time())
    # 前二次抛超时异常，触发重试
    if attemps["n"] < 3:
        raise TimeoutError(f"第{attemps["n"]}次调用超时失败")
    return f"订单{order_id}：运输中(第{attemps["n"]}次尝试成功)"


t0 = time.time()
agent = create_agent(
    model="deepseek:deepseek-v4-flash",
    tools=[flaky_order],
    middleware=[
        ToolRetryMiddleware(
            max_retries=3,  # 初始调用失败后再重试的次数默认是2
            tools=[
                flaky_order
            ],  # 只针对列表中的工具进行重试，写None的话表示针对每次的工具进行重试
            initial_delay=1.0,  # 首次重试前的等待秒数
            backoff_factor=2.0,  # 退避倍数，每次等待时间乘以它
            jitter=False,  # 关闭随地抖动，这是为了让间隔更好的预测(如果是在生产环境要还是打开的)
            on_failure="continue",  # 重试耗尽后，continue就是把错误信息灌回消息列表，交给后续的处理，error是抛出异常，让应用失败
        )
    ],
    system_prompt="查订单时必须使用工具flaky_order",
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "查一下A1001订单的状态"}]}
)
# 打印工具实际被调用的次数
print(f"工具实际被调用的{attemps["n"]}次")
gaps = [round(stamps[i + 1] - stamps[i], 2) for i in range(len(stamps) - 1)]
print(f"两次尝试之间间隔(秒):{gaps}")
print(f"最终的回答:{result['messages'][-1].content}")
