from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from rich import print
from langchain.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
import os

load_dotenv(override=True)
model = init_chat_model("deepseek:deepseek-v4-flash")
messages = [
    SystemMessage("你是一个简洁助手"),
    HumanMessage("我叫张三"),
    # AI消息，假装模型之前说过的回复，表示已经记住了张三这个名字
    AIMessage("好的，张三，我记住你了"),
    HumanMessage("我叫什么什么名字?"),
]
response = model.invoke(messages)
print(response.content)
