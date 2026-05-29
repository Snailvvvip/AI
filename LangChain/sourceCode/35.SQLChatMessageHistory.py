# from langchain_deepseek import ChatDeepSeek
# from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# from langchain_core.chat_history import InMemoryChatMessageHistory
# from langchain_core.runnables import RunnableWithMessageHistory, RunnableLambda
# from langchain_community.chat_message_histories import SQLChatMessageHistory


from smartchain.chat_models import ChatDeepSeek
from smartchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from smartchain.chat_history import SQLChatMessageHistory
from smartchain.runnables import RunnableWithMessageHistory, RunnableLambda


def get_session_history(session_id: str):
    return SQLChatMessageHistory(session_id=session_id, db_path="chat_history.db")


# 构建提示词模板
promptTemplate = ChatPromptTemplate.from_messages(
    [
        ("system", "你是一个友好的AI助手"),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)
llm = ChatDeepSeek(model="deepseek-chat", temperature=0.7)


# 创建一个链 prompt => llm
def chain_func(input_dict):
    # 先格式化此模板提示词
    prompt_value = promptTemplate.invoke(input_dict)
    # 调用大模型生成回答
    return llm.invoke(prompt_value.messages)


chain = RunnableLambda(chain_func)
# 创建一个带自动化管理聊天历史的链条
chain_with_history = RunnableWithMessageHistory(
    chain,  # 链式函数
    get_session_history=get_session_history,  # 获取会话历史
    input_messages_key="question",  # 输入消息键
    history_messages_key="history",  # 历史消息键
)
print(repr(chain_with_history))
print(f"第一轮")
response1 = chain_with_history.invoke(
    {"question": "我叫小明"}, config={"configurable": {"session_id": "session-1"}}
)
print(f"用户：我叫小明")
print(f"AI:{response1.content}")


print(f"第二轮")
response2 = chain_with_history.invoke(
    {"question": "我叫什么名字?"}, config={"configurable": {"session_id": "session-1"}}
)
print(f"我叫什么名字")
print(f"AI:{response2.content}")
