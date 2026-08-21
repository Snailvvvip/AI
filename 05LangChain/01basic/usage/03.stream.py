from langchain.agents import create_agent
from langchain.tools import tool
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)


# @tool装饰器，可以把一个普通 函数注册为可供Agent调用的工具
@tool()
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
# 输入的状态字典
state = {
    "messages": [
        {
            "role": "user",
            "content": "北京今天天气怎么样?另外同时帮我计算一下128+12是多少？",
        }
    ]
}
# stream指的是以流式方式运行Agent
# stream_mode=updates指的是按图节点更新推送数据

# stream_mode="updates"按节点更新推送，也可以使用values看完整状态快照
for chunk in agent.stream(state, stream_mode="updates"):  # type: ignore
    # 打印每一个流式块， 可能包含模型节点或工具节点的增量更新
    print(chunk)
