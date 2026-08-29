# 从 langchain.agents 导入创建 Agent 的工厂函数
from langchain.agents import create_agent

# 内存版 checkpointer
from langgraph.checkpoint.memory import InMemorySaver
from rich import print

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

# 第二轮：只发新问题，历史由 checkpointer 自动合并
result = agent.invoke(
    {"messages": [{"role": "user", "content": "我的秘密数字是多少？"}]},
    config=config,  # type: ignore
)
# 这是给用户看的那一句
print("最后一条回复：", result["messages"][-1].content)


snapshot = agent.get_state(config)  # type: ignore
# print(snapshot)
messages = snapshot.values["messages"]
# print("messages", len(messages))
# next非空立明图没有跑完，比如说HITL停在了interrupt,此时不能当最终结果进行验收
# 如果正常跑完，next就是空元组
# print("next", snapshot.next)
# 取得该thread_id对应的历史快照(每步一个state)，通常只有最近的几步
state_history = agent.get_state_history(config)  # type: ignore
print("state_history", state_history)
history = list(reversed(list(state_history)))  # type: ignore
print(f"历史快照的数量：{len(history)}")

for idx, snapshot in enumerate(history, start=1):
    print(f"===Step {idx}===")
    messages = snapshot.values["messages"]  # type: ignore
    for i, msg in enumerate(messages):
        print(f"[{i}] {type(msg).__name__}:{getattr(msg,'content','')}")
