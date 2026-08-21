from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.messages import HumanMessage, AIMessage
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)
# 用消息列表创建一个ChatPromptTemplate实例，支持插入历史与前的问题变量
prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", "你是一个简洁助手，结合历史消息回答问题"),  # 系统消息
        MessagesPlaceholder(
            "history"
        ),  # 历史消息占位符，运行时会插入名为history的消息历史对象
        ("human", "{question}"),  # 人类消息
    ]
)
history = [HumanMessage("我叫李雷"), AIMessage("好的，你好李雷")]
messages = prompt_template.format_messages(history=history, question="我叫什么名字?")
print(messages)
model = init_chat_model("deepseek:deepseek-v4-flash", temperature=0.2)
ai = model.invoke(messages)
print(ai.content)
