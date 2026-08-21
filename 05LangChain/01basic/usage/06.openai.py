from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from rich import print
import os

load_dotenv(override=True)
# 有些大模型 langchain根本不认,使用ChatOpenAI兼容接口创建指向大模型的聊天模型实例
model = ChatOpenAI(
    base_url="https://api.deepseek.com",
    api_key=os.getenv("DEEPSEEK_API_KEY"),  # type: ignore
    model="deepseek-v4-flash",
    temperature=0.2,
)
result = model.invoke("一句话介绍一下langchain")
print(result.content)
