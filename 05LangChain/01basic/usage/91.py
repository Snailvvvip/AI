# Any 用于标注返回的 dict 值类型
from typing import Any

# create_agent 与 AgentState（state 的类型标注）
from langchain.agents import create_agent, AgentState

# before_model 装饰器：把普通函数变成「调模型前执行」的中间件
from langchain.agents.middleware import before_model, SummarizationMiddleware

# RemoveMessage 用于从 state 里删消息
from langchain.messages import RemoveMessage

# 内存版 checkpointer
from langgraph.checkpoint.memory import InMemorySaver

# REMOVE_ALL_MESSAGES 是一个特殊常量，表示「清空全部」
from langgraph.graph.message import REMOVE_ALL_MESSAGES
from rich import print

# Runtime 是中间件第二个参数的类型
from langgraph.runtime import Runtime

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 加载 .env 中的 API key
load_dotenv(override=True)


@before_model
def trim_messages(state: AgentState, runtime: Runtime):
    """保留首条+最近4条消息，防止上下文过长"""
    messages = state["messages"]
    if len(messages) <= 5:
        # 如果返回None，表示继续正常调用大模型
        return None
    first_msg = messages[0]
    recent_messages = messages[-4:]
    # 如果返回安典，表示直接跳过LLM调用，不再调用大模型，直接用提供的字典作为响应
    return {
        "messages": [RemoveMessage(id=REMOVE_ALL_MESSAGES), first_msg, *recent_messages]
    }
    # 返回命令，跳转到指定的节点
    # return Command(goto="auth_node")


# 自定义中文摘要提示词，{messages} 是必须保留的占位符
CN_SUMMARY_PROMPT = """请把下面的客服对话历史压缩成中文要点，供后续对话继续使用。

要求：
1. 只输出要点，不要寒暄，不要解释你在做什么。
2. 必须保留：用户姓名、订单号、地址、电话、已确认的金额与承诺。
3. 用简短条目列出用户诉求与已完成的处理。
4. 无法确定的信息不要猜测，直接省略。

对话历史：
{messages}
"""

# 反例：装了 SummarizationMiddleware，但根本不会触发
agent = create_agent(
    # 主对话模型
    model="deepseek:deepseek-v4-flash",
    # 不需要工具
    tools=[],
    middleware=[
        # 摘要中间件
        SummarizationMiddleware(
            # 生成摘要时调用的模型
            model="deepseek:deepseek-v4-flash",
            # 当达到4000和token上限的时候就会触发这个中间件执行
            # 当消息的数量达到6条的时候触发压缩摘要
            trigger=("messages", 6),
            # 保留最近的2条消息
            keep=("messages", 2),
            # 替换掉默认的英文提示词
            summary_prompt=CN_SUMMARY_PROMPT,
        )
    ],
    # 记忆开关
    checkpointer=InMemorySaver(),
    # 系统提示
    system_prompt="你是客服助手。",
)


# 固定一条会话线
config = {"configurable": {"thread_id": "summary-demo"}}
for content in ["我叫小周", "我喜欢猫", "我住在杭州", "我的订单是A1002"]:
    agent.invoke({"messages": [{"role": "user", "content": content}]}, config=config)  # type: ignore
    print(f"说完{content}后条数:{len(agent.get_state(config).values['messages'])}")  # type: ignore

messages = agent.get_state(config).values["messages"]  # type: ignore
for message in messages:
    print(message)
