# 从 langchain.agents 导入创建 Agent 的工厂函数
from langchain.agents import create_agent

# InMemorySaver 是最简单的 checkpointer 实现（存在进程内存里）
from langgraph.checkpoint.memory import InMemorySaver
from rich import print

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 加载 .env 中的 API key
load_dotenv(override=True)

# 创建 Agent，关键是把 checkpointer 传进去
agent = create_agent(
    # 模型标识
    model="deepseek:deepseek-v4-flash",
    # 本示例不需要工具
    tools=[],
    # 系统提示，设定角色
    system_prompt="你是简洁的中文客服助手。",
    # 有了它，多轮状态才会被存下来
    checkpointer=InMemorySaver(),
)
# thread_id 标识一条会话线；两轮用同一个 config 才能接上历史
config = {"configurable": {"thread_id": "customer-001"}}
# 第一轮：用户自报家门
result = agent.invoke(
    # 只传本轮这一句
    {
        "messages": [
            {"role": "user", "content": "你好，我是小王，订单 A1002 查过了吗？"}
        ]
    },
    # 带上 thread_id
    config=config,  # type: ignore
)
last_messages = result["messages"]
for i, msg in enumerate(last_messages):
    id = getattr(msg, "id", "")
    content = getattr(msg, "content", "")
    msg_type = type(msg).__name__
    print(f"[{i}]{msg_type} {id}:{repr(content)}")
print("=" * 50)
# 特别强调 只发新的问题，不要手动拼history
result = agent.invoke(
    # 只传本轮这一句
    {
        "messages": [
            *last_messages,
            {"role": "user", "content": "我刚才说我是谁？我说的订单号是多少？"},
        ]
    },
    # 带上 thread_id
    config=config,  # type: ignore
)
for i, msg in enumerate(result["messages"]):
    id = getattr(msg, "id", "")
    content = getattr(msg, "content", "")
    msg_type = type(msg).__name__
    print(f"[{i}]{msg_type} {id}:{repr(content)}")
# 读取该thread的checkpoint快照，
# snapshot = agent.get_state(config)  # type: ignore
# snapshot.values是一个字典，键就是state中的字段，至少会有messages
# for i, msg in enumerate(snapshot.values["messages"]):
#    content = getattr(msg, "content", "")
#    msg_type = type(msg).__name__
#    print(f"[{i}]{msg_type} :{repr(content)}")
