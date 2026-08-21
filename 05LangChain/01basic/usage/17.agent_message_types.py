from langchain.agents import create_agent
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)


def get_weather(city: str) -> str:
    """获取指定城市的天气信息"""
    return f"{city} 今天晴，气温25度"


agent = create_agent(
    name="langchain_agent",
    model="deepseek:deepseek-v4-flash",  # 指定使用的模型 用冒号分割，左边是供应商，右而是模型名
    tools=[get_weather],
    system_prompt="你是一个简洁的可靠的中文助手，需要天气信息的时候可以调用工具，不要编造结果",  # 系统指令或者说系统提示词
)
result = agent.invoke(
    {"messages": [{"role": "user", "content": "上海今天天气怎么样?"}]}
)
for i, msg in enumerate(result["messages"]):
    print(f"{type(msg).__name__}")
    if getattr(msg, "tool_calls", None):
        print(f"{msg.tool_calls} ")
    print(f"{msg.content}")
