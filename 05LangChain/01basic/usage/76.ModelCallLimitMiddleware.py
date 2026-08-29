# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent

# 导入模型调用限额中间件
from langchain.agents.middleware import ModelCallLimitMiddleware

# InMemorySaver 是最简单的 checkpointer 实现
from langgraph.checkpoint.memory import InMemorySaver

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 加载 .env 中的 API key
load_dotenv(override=True)


@tool
def get_weather(city: str) -> str:
    """查询城市天气"""
    return f"{city} 晴，25度"


agent = create_agent(
    model="deepseek:deepseek-v4-flash",
    tools=[get_weather],
    # thread_limit跨多次invoke累计，需要checkpointer+thread_id
    # checkpointer=InMemorySaver(),
    middleware=[
        # 配置模型调用限额
        ModelCallLimitMiddleware(
            # 单次invoke(一轮用户请求)最多能执行多少次大模型调用
            run_limit=1,
            # 触顶退出的行为如果配置为end,则表示正常收尾 ，但模型消息是一个英文提示， 配置为error就抛出异常
            exit_behavior="error",
        )
    ],
    system_prompt="查天气必须调用get_weather",
)
try:
    result = agent.invoke(
        {"messages": [{"role": "user", "content": "北京今天天气怎么样?"}]},
    )
    for i, msg in enumerate(result["messages"]):
        content = getattr(msg, "content", "")
        tool_calls = getattr(msg, "tool_calls", "")
        msg_type = type(msg).__name__
        print(f"[{i}] {msg_type}:{repr(content)} {repr(tool_calls)}")

    last = str(result["messages"][-1].content)
    if last.startswith("Model call limits exceeded"):
        print("这个问题比较复杂，我暂时没有办法处理完成，可以拆成几个小问题再问我一次")
    else:
        print(last)
except Exception as e:
    print("这个问题比较复杂，我暂时没有办法处理完成，可以拆成几个小问题再问我一次")
