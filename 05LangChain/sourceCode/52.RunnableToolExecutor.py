from pydantic import BaseModel, Field
from smartchain.tools import tool
from smartchain.chat_models import ChatOpenAI
from smartchain.messages import ToolMessage
from smartchain.runnables import RunnableToolExecutor


@tool
def add(a: int, b: int) -> int:
    print("执行工具计算结果=============================")
    return a + b


@tool
def get_weather(city: str) -> str:
    """获取城市的天气"""
    weather_data = {"北京": "晴，25度", "上海": "多云，18度", "广州": "雨，5度"}
    return weather_data.get(city, "未知天气 ")


llm = ChatOpenAI(model="gpt-4o")
tools = [add, get_weather]
runnableToolExecutor = RunnableToolExecutor(llm=llm, tools=tools)
result1 = runnableToolExecutor.invoke("请计算15加25的结果")
print(result1)
result2 = runnableToolExecutor.invoke("北京今天的天气怎么样?")
print(result2)
result3 = runnableToolExecutor.invoke("先查询北京的天气，然后再计算100加200的和")
print(result3)
