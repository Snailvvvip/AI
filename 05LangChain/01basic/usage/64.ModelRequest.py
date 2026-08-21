# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent

# 导入请求类型与模型调用拦截装饰器
from langchain.agents.middleware import ModelRequest, wrap_model_call

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool
from rich import print

# 加载环境变量
load_dotenv(override=True)


@tool
def lookup_policy(topic: str) -> str:
    """查询公司制度摘要。"""
    return "差旅报销需在返程 7 日内提交。"


@wrap_model_call
def inspect_request(request: ModelRequest, handler):
    print("request字段:", [a for a in dir(request) if not a.startswith("_")])
    print("state类型:", type(request.state).__name__)
    print("state 键:", list(request.state.keys()))

    return handler(request)


# 创建 Agent 并挂上观察器
agent = create_agent(
    model="deepseek:deepseek-v4-flash",
    tools=[lookup_policy],
    middleware=[inspect_request],
    system_prompt="你是办公助手。",
)
# 触发一次调用
agent.invoke({"messages": [{"role": "user", "content": "报销流程？"}]})

"""
request字段:
[
    'messages',
    'model',
    'model_settings',
    'override',
    'response_format',
    'runtime',
    'state',
    'system_message',
    'system_prompt',
    'tool_choice',
    'tools'
]
state类型: dict
state 键:
['messages']
"""
