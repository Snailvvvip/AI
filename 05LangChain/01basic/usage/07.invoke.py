from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from rich import print
import os

load_dotenv(override=True)

model = init_chat_model("deepseek:deepseek-v4-flash")
print(model.invoke("1+1=?").content)

# 构造多轮对话
conversation = [
    {"role": "system", "content": "你是一个中文助手，回答要简洁明了"},
    {"role": "user", "content": "1+1=?"},
]
message = model.invoke(conversation)
print(message)
