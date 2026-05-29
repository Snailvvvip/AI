# from langchain_openai import ChatOpenAI
# from langchain.messages import AIMessage, HumanMessage, SystemMessage

from smartchain.chat_models import ChatOpenAI
from smartchain.messages import AIMessage, HumanMessage, SystemMessage

llm = ChatOpenAI()
# message里每条消息有四种类型 可以是字符串，Message实例，字典，元组
messages = [
    SystemMessage(content="你是一个AI助手，请回答用户的问题"),
    "你好，我叫张三，你是谁？",
    AIMessage(content="我是GPT4o,一个AI助手"),
    {"role": "user", "content": "你知道我叫什么吗?"},
    ("assistant", "你的名字叫张三"),
]
result = llm.invoke(messages)
print(result.content)  # AIMessage(content=content)

# messages = [
#    SystemMessage(content="你是一个AI助手，请回答用户的问题"),
#    "你好，我叫张三，你是谁？",
# ]
# result = llm.invoke(messages)
# print(result.content)  # AIMessage(content=content)
#
#
# messages.append(result)  # AIMessage(content=content)
# messages.append(HumanMessage(content="很高兴认识你"))
# result = llm.invoke(messages)
# print(result.content)
