from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from rich import print
from langchain.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
import os

load_dotenv(override=True)
model = init_chat_model("deepseek:deepseek-v4-flash")
# 第一种情况--------------------  给invoke传递一个字符串，本质同上传递了一个用户消息
# response = model.invoke("写一首关于春天的诗")
# print(response.content)
# 第二种传参方式------------------ 使用 消息对象 最推荐的
# messages = [
#    SystemMessage("你是一个简洁的中文助手，回答不要超过两句话"),
#    HumanMessage("什么是langchain?"),
# ]
# response = model.invoke(messages)
# print(response.content)

# 第三种传参方式 ------------------- OpenAI风格
messages = [
    {"role": "system", "content": "你是一个简洁的中文助手，回答不要超过两句话"},
    {"role": "user", "content": "什么是langchain?"},
]
print(model.invoke(messages).content)
