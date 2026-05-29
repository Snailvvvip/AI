import os

# from langchain_deepseek import ChatDeepSeek
# from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# from langchain_core.chat_history import InMemoryChatMessageHistory
# from langchain_core.messages import HumanMessage
from datetime import timedelta
from smartchain.chat_models import ChatDeepSeek
from smartchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from smartchain.chat_history import InMemoryChatMessageHistory

# 内存版本的对话历史对象
history = InMemoryChatMessageHistory()
# 构建提示词
template = ChatPromptTemplate(
    [
        ("system", "你是一个友好的AI助手"),
        MessagesPlaceholder("history"),
        ("human", "{question}"),
    ]
)
llm = ChatDeepSeek(model="deepseek-chat", temperature=0.7)


# 定义一个对话函数，输入为用户的问题，输出为AI的回复
def chat(question: str):
    # 获取历史消息列表的副本
    history_messages = history.messages
    print(history_messages)
    # 使用模板格式化所有的输入(包括历史和本次的问题)
    prompt_messages = template.format_messages(
        history=history_messages, question=question
    )
    print(prompt_messages)
    # 调用大模型得到响应
    response = llm.invoke(prompt_messages)
    # 把最新的用户消息加入历史
    history.add_user_message(question)
    # 再次添加AI的回答
    history.add_ai_message(response.content, expires_in=timedelta(minutes=5))
    return response.content


#  第一轮
print(f"AI:{chat('我叫小明，请你记住')}")
#  第二轮
print(f"AI:{chat('你知道我叫什么吗?')}")
