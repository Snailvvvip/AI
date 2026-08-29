# 从 langchain.agents 导入创建 Agent 的工厂函数
from langchain.agents import create_agent

# 内存版 checkpointer
from langgraph.checkpoint.memory import InMemorySaver
from rich import print
from langchain_core.messages.ai import AIMessage

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 加载 .env 中的 API key
load_dotenv(override=True)

# 创建带记忆的 Agent
agent = create_agent(
    # 模型标识
    model="deepseek:deepseek-v4-flash",
    # 不需要工具
    tools=[],
    # 让模型配合记数字
    system_prompt="你是助手。用户说秘密数字时记住，被问到就回答。",
    # 记忆开关
    checkpointer=InMemorySaver(),
)

# thread_id 标识一条会话线，两轮共用同一个 config 才能接上历史
config = {"configurable": {"thread_id": "demo-001"}}

# 第一轮：把秘密数字告诉它
agent.invoke(
    {"messages": [{"role": "user", "content": "我的秘密数字是 42，记住它。"}]},
    config=config,  # type: ignore
)
snapshot = agent.get_state(config)  # type: ignore
messages = snapshot.values["messages"]
print("---手工修改前---")
for i, msg in enumerate(messages):
    print(f"[{i}] {type(msg).__name__}:{getattr(msg,'content','')}")
# 假设要手动修复上一个AI的回复，改为你的密码数字为100
messages = list(snapshot.values["messages"])
# 找到最后一条AI回复，将其内容修改掉
# 从后向前遍历列表 起始索引 结束索引，步长  最后一个元素到0，每次递减1
for i in range(len(messages) - 1, -1, -1):
    if isinstance(messages[i], AIMessage):
        new_message = AIMessage(
            content="你的密码数字是100", id=getattr(messages[i], "id", None)
        )
        messages[i] = new_message
        break
# 用update_state覆盖写回去，只传要更改的字段就可以
agent.update_state(config, {"messages": messages})  # type: ignore
print("---手工修改后---")
for i, msg in enumerate(messages):
    print(f"[{i}] {type(msg).__name__}:{getattr(msg,'content','')}")
