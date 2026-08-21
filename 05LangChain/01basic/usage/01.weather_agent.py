from langchain.agents import create_agent
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)

# 工具函数
# 函数名+文档字符串是Agent决定何时调用的依据
# 参数city会从用户的问题是进行提取

def get_weather(city: str) -> str:
    """获取指定城市的天气信息"""
    return f"{city} 今天晴，气温25度"


#

# 创建智能体
agent = create_agent(
    name="langchain_agent",
    model="deepseek:deepseek-v4-flash",  # 指定使用的模型 用冒号分割，左边是供应商，右而是模型名
    tools=[
        get_weather
    ],  # 工具可以是普通函数，langchain内部会自动解析函数的签名和文档字符串把它变成工具
    system_prompt="你是一个简洁的可靠的中文助手，需要天气信息的时候可以调用工具，不要编造结果",  # 系统指令或者说系统提示词
)
# agent内部如果遇到了deepseek,会使用langchain-deepseek与deepseek进行交互
# langchain-deepseek内部会自动读取 env中的DEEPSEEK_API_KEY获取密钥
# invoke指的是让智能体执行对话
# 消息列表的格式是符合OpenAI消息规范的
# Agent内部会执行思考 调用工具 观察结果 最终回答
result = agent.invoke(
    {"messages": [{"role": "user", "content": "北京今天天气怎么样?"}]}
)

print(result["messages"][-1].content)
# result里面会包含完整的对话历史(用户消息，工具调用，工具返回结果，最终回答)
# -1是取最后一条消息，即Agent最终返回的结果

for i, msg in enumerate(result["messages"]):
    print(f"\n=====[{i}] {type(msg).__name__}")
    content = getattr(msg, "content", None)
    if content:
        print(f"content:", content)
    tool_calls = getattr(msg, "tool_calls", None)
    if tool_calls:
        print(tool_calls)


"""
1. 用户提问 北京今天天气怎么样?
2. Agent收到这个消息
   判断：需要天气信息，自动调用工具 get_weather('北京")
3.工具返回结果  北京 今天晴，气温25度
4. Agent重新组织语言   北京今天天气晴朗，气温25度。祝您有愉快的一天！
5 输出最终回答



"""
