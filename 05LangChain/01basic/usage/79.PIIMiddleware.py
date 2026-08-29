# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent

# 导入 PII 处理中间件
from langchain.agents.middleware import PIIMiddleware

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv
from langchain.agents.middleware import PIIDetectionError

# 加载 .env 中的 API key
load_dotenv(override=True)


# 一个只读工具
@tool
def lookup_policy(topic: str) -> str:
    """查询制度摘要。"""
    return "咨询类问题请联系 HR 邮箱（制度原文不含个人邮箱）。"


# 创建 Agent 并挂上两种 PII 处理
agent = create_agent(
    # 模型标识
    model="deepseek:deepseek-v4-flash",
    # 工具列表
    tools=[lookup_policy],
    # 一种类型一个实例；两种类型 name 不同所以能共存
    middleware=[
        # 是如何识别出邮箱，卡号的？是正则匹配，还是大模型识别出来的。
        # 可以通过正则匹配，也可以通过大模型来判断
        # 内置类型 email/credit_card/ip/mac_address/url
        # 我的邮箱是 [REDACTED_EMAIL]，卡号 **** **** **** 1111，IP 是 <ip_hash:4247288e>，报销流程是什么？
        # PIIDetectionError: Detected 1 instance(s) of email in text content
        PIIMiddleware("email", strategy="block", apply_to_input=True),
        PIIMiddleware("credit_card", strategy="mask", apply_to_input=True),
        PIIMiddleware("ip", strategy="hash", apply_to_input=True),
    ],
    # 提示层再加一句软约束
    system_prompt="你是办公助手。不要主动索要银行卡号；问制度用 lookup_policy。",
)
try:
    result = agent.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": "我的邮箱是 alice@example.com，卡号 4111 1111 1111 1111，IP 是 192.168.1.7，报销流程是什么？",
                }
            ]
        },
    )
    for i, msg in enumerate(result["messages"]):
        content = getattr(msg, "content", "")
        msg_type = type(msg).__name__
        print(f"[{i} {msg_type}] :{repr(content)}")
# 捕获 PII 拦截异常
except PIIDetectionError as e:
    # 给用户一句友好提示，同时把细节记进日志而不是抛给前端
    print("为保护隐私，请不要在对话中提供邮箱、银行卡号等个人信息。")
