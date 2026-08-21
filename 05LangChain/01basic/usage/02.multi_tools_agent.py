from langchain.agents import create_agent
from langchain.tools import tool
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)


# @tool装饰器，可以把一个普通 函数注册为可供Agent调用的工具
@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气信息"""
    return f"{city} 今天晴，气温25度"


@tool
def add(a: int, b: int) -> int:
    """计算两个整数之和"""
    return a + b


agent = create_agent(
    name="multi_tools_agent",
    model="deepseek:deepseek-v4-flash",  # 指定使用的模型 用冒号分割，左边是供应商，右而是模型名
    tools=[
        get_weather,
        add,
    ],
    system_prompt="你是一个办公助手，查天气调用get_weather，做整数加法时调用add，不要心算",  # 系统指令或者说系统提示词
)
result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "北京今天天气怎么样?另外同时帮我计算一下128+12是多少？",
            }
        ]
    }
)
print(result["messages"][-1].content)
