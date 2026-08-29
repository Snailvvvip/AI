# Any 用于标注返回的 dict 值类型
from typing import Any

# create_agent 与 AgentState（state 的类型标注）
from langchain.agents import create_agent, AgentState

# before_model 装饰器：把普通函数变成「调模型前执行」的中间件
from langchain.agents.middleware import before_model

# RemoveMessage 用于从 state 里删消息
from langchain.messages import RemoveMessage

# 内存版 checkpointer
from langgraph.checkpoint.memory import InMemorySaver

# REMOVE_ALL_MESSAGES 是一个特殊常量，表示「清空全部」
from langgraph.graph.message import REMOVE_ALL_MESSAGES

# Runtime 是中间件第二个参数的类型
from langgraph.runtime import Runtime

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 加载 .env 中的 API key
load_dotenv(override=True)


# 装饰器把函数注册成 每次模型调用前执行的中间件
@before_model
def trim_messages(state: AgentState, runtime: Runtime):
    """保留首条+最近的4条消息，防止上下文过长"""
    # 从状态中取出完整的消息列表
    messages = state["messages"]
    print("trim_messages", len(messages))
    # 如果消息少于等于5条，什么都不做
    if len(messages) <= 5:
        return None
    # 第一条
    first_message = messages[0]
    # 最近的4条
    recent_messages = messages[-4:]
    return {
        "messages": [
            # 放一个命令清空所有的消息
            RemoveMessage(id=REMOVE_ALL_MESSAGES),
            first_message,
            *recent_messages,
        ]
    }


# 创建 Agent 并挂上裁剪中间件
agent = create_agent(
    # 模型标识
    model="deepseek:deepseek-v4-flash",
    # 不需要工具，避免裁剪时切断 tool_calls 配对（见 §7.2）
    tools=[],
    # 系统提示
    system_prompt="你是客服助手，回答尽量简短。",
    # 把上面的中间件挂上
    middleware=[trim_messages],
    # 记忆开关
    checkpointer=InMemorySaver(),
)
config = {"configurable": {"thread_id": "trim-1"}}
for user in ("我叫小陈", "帮我查订单 A1001", "再查A1002", "我叫什么"):
    agent.invoke({"messages": [{"role": "user", "content": user}]}, config=config)  # type: ignore

result = agent.invoke({"messages": [{"role": "user", "content": "总结一下我们聊过的内容"}]}, config=config)  # type: ignore
print("len", len(result["messages"]))
print(result["messages"][-1].content)
