from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from langchain.tools import tool
from rich import print
from langchain.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
import os

load_dotenv(override=True)

model = init_chat_model("deepseek:deepseek-v4-flash")
# 创建对话历史列表并加入系统提示词
history = [SystemMessage("你是一个简洁助手，用尽量短的句子回答")]
turns = ["我喜欢猫", "根据刚才信息，我喜欢什么动物?"]
for user_text in turns:
    history.append(HumanMessage(user_text))  # type: ignore
    ai = model.invoke(history)
    history.append(ai)  # type: ignore
    print(f"用户:{user_text}")
    print(f"助手:{ai.content}\n")
