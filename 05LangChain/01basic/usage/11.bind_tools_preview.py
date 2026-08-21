from langchain.chat_models import init_chat_model
from langchain.tools import tool
from dotenv import load_dotenv

from rich import print
import os

load_dotenv(override=True)


@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气信息"""
    return f"{city} 今天晴，气温25度"


model = init_chat_model("deepseek:deepseek-v4-flash")
# 将天气工具绑定到模型上，让模型能够发起工具调用
model_with_tools = model.bind_tools([get_weather])
result = model_with_tools.invoke("北京今天的天气如何？")
print(result.content)
print(result.tool_calls)
