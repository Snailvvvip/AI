# from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# from langchain_openai import ChatOpenAI
# from langchain_core.messages import HumanMessage, AIMessage

from smartchain.chat_models import ChatOpenAI
from smartchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from smartchain.messages import HumanMessage, AIMessage


class CustomMessage:
    def __init__(self):
        self.type = "human"
        self.content = "CustomMessage"


customMessage = CustomMessage()
# 构建历史消息列表，模拟对话历史
history = [
    HumanMessage(content="你好"),
    customMessage,
    {"type": "role", "content": "你好"},
]
template = ChatPromptTemplate(
    [
        ("system", "你是一个乐于助人的AI助手"),
        # 消息占位符，将填充历史会话
        MessagesPlaceholder("history"),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI()
prompt_messages = template.format_messages(history=history, question="请介绍一下你自己")
for msg in prompt_messages:
    print(msg)
result = llm.invoke(prompt_messages)
print(result.content)
