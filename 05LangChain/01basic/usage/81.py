# 从 re 导入正则模块
import re

# 从 langchain.agents.middleware 导入 PII 中间件
from langchain.agents.middleware import PIIMiddleware
from langchain.agents import create_agent
from langchain.tools import tool
from dotenv import load_dotenv

load_dotenv(override=True)


@tool
def lookup_policy(name: str) -> str:
    """查找策略。"""
    return f"策略 {name} 的描述。"


# 写法一 ，直接写正则表达式
guard_a = PIIMiddleware(
    "staff_id",  # 自定义类型名，会出现在占位符里(REDACTED_STAFF_ID)
    # 检测器量个正则表达式 我是号码是 E000001 号
    detector=r"\bE\d{6}\b",
    strategy="redact",
)

_STAFF_ID_PATTERN = re.compile(r"\bE\d{6}\b")


def detect_staff_id(content: str):
    """自定义detector探测器函数，返回PIIMiddleware可识别的match字典列表"""
    return [
        {"text": m.group(), "start": m.start(), "end": m.end()}
        for m in _STAFF_ID_PATTERN.finditer(content)
    ]


guard_b = PIIMiddleware("staff_id", detector=detect_staff_id, strategy="redact")  # type: ignore

# 挂上 PII 与观察器；PII 在前，所以它先改写再被 spy 看到
agent = create_agent(
    # 模型标识
    model="deepseek:deepseek-v4-flash",
    # 一个只读工具
    tools=[lookup_policy],
    # 顺序：先脱敏，后观察
    middleware=[guard_b],
    # 简单提示
    system_prompt="你是办公助手。",
)
result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "我的工号是 E000001，报销流程是什么？",
            }
        ]
    },
)
for i, msg in enumerate(result["messages"]):
    content = getattr(msg, "content", "")
    msg_type = type(msg).__name__
    print(f"[{i} {msg_type}] :{repr(content)}")
