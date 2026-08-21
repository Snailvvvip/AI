from langchain.chat_models import init_chat_model
from langchain.agents import create_agent
from dotenv import load_dotenv

from rich import print
import os

load_dotenv(override=True)
model = init_chat_model("deepseek:deepseek-v4-flash")


def get_weather(city: str) -> str:
    """获取指定城市的天气信息"""
    return f"{city} 今天晴，气温25度"


# 创建智能体
agent = create_agent(
    name="langchain_agent",
    model=model,  # 传入已经初始化的模型实例，而不是模型字符串
    tools=[
        get_weather
    ],  # 工具可以是普通函数，langchain内部会自动解析函数的签名和文档字符串把它变成工具
    system_prompt="你是一个简洁的可靠的中文助手，需要天气信息的时候可以调用工具，不要编造结果",  # 系统指令或者说系统提示词
)
result = agent.invoke(
    {"messages": [{"role": "user", "content": "北京今天天气怎么样?"}]}
)

print(result["messages"])

