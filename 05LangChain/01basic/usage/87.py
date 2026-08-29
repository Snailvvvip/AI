# 从 langchain.agents 导入创建 Agent 的工厂函数
from langchain.agents import create_agent

# 内存版 checkpointer
from langgraph.checkpoint.memory import InMemorySaver

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 加载 .env 中的 API key
load_dotenv(override=True)

# 注意：只创建了一个 Agent 实例，两个线程共用它
agent = create_agent(
    # 模型标识
    model="deepseek:deepseek-v4-flash",
    # 不需要工具
    tools=[],
    # 提示模型记住用户说的数字
    system_prompt="你是助手。用户说秘密数字时记住，被问到就回答。",
    # 记忆的开关
    checkpointer=InMemorySaver(),
)

# 线程 1：秘密 42
agent.invoke(
    # 告诉它一个数字
    {"messages": [{"role": "user", "content": "记住，我的秘密数字是 42。"}]},
    # 写入 thread-alice 这条线
    config={"configurable": {"thread_id": "thread-alice"}},
)
# 在同一个线上追问，应该可以答上来
r1 = agent.invoke(
    # 告诉它一个数字
    {"messages": [{"role": "user", "content": "我的秘密数字是多少？"}]},
    # 写入 thread-alice 这条线
    config={"configurable": {"thread_id": "thread-alice"}},
)
print("Alice", r1["messages"][-1].content)
r2 = agent.invoke(
    # 告诉它一个数字
    {"messages": [{"role": "user", "content": "我的秘密数字是多少？"}]},
    # 写入 thread-alice 这条线
    config={"configurable": {"thread_id": "thread-alice"}},
)
print("Bob", r2["messages"][-1].content)
