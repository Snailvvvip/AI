# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent
from dataclasses import dataclass

# 导入请求类型与模型调用拦截装饰器
from langchain.agents.middleware import ModelRequest, wrap_model_call, dynamic_prompt

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool
from rich import print

# 加载环境变量
load_dotenv(override=True)


@dataclass
class OfficeContext:
    """每次agent invoke调用的时候传入的上下文字段"""

    # 角色 默认是普通员工
    role: str = "employee"


@tool
def lookup_policy(topic: str) -> str:
    """查询公司制度摘要。"""
    return "差旅报销需在返程 7 日内提交。"


@tool
def get_weather(city: str) -> str:
    """查询城市天气。"""
    return f"{city} 晴，25°C。"


ORDERS = {
    # 已发货订单
    "A1001": {"status": "已发货", "eta_days": 2},
    # 运输中订单
    "A1002": {"status": "运输中", "eta_days": 1},
    # 已签收订单
    "A1003": {"status": "已签收", "eta_days": 0},
}


@tool
# 入参为订单号
def lookup_order(order_id: str) -> str:
    # 描述里说明订单号格式
    """这是一个查询订单的工具，可以用此工具来查询订单的状态"""
    return f"订单 已发货"


@wrap_model_call
def filter_tools_by_role(request: ModelRequest, handler):
    # 从运行时的上下文中读取角色
    role = getattr(request.runtime.context, "role", "employee")
    # 复制当前的工具列表 避免直接修改原始工具列表
    tools = list(request.tools)
    if role != "support":
        tools = [tool for tool in tools if getattr(tool, "name") != "lookup_order"]
    print(f"[中间件] role={role},可见工具={[getattr(tool,'name') for tool in tools]}")
    # 用覆盖后的工具列表继续交给后续的handler进行处理
    return handler(request.override(tools=tools))


agent = create_agent(
    model="deepseek:deepseek-v4-flash",
    # 预注册全部的工具，可见性由middleware控制
    tools=[get_weather, lookup_policy, lookup_order],
    middleware=[filter_tools_by_role],  # type: ignore
    system_prompt="你是办公助手，只用当前可用的工具回答，没有查询订单工具lookup_order的时候，请说明需要客服权限，不要编造订单状态",  # 静态提示
    context_schema=OfficeContext,
)

# 员工角色，应该没有权限查询订单
result1 = agent.invoke(
    {"messages": [{"role": "user", "content": "帮我查订单A1001"}]},
    context=OfficeContext(role="employee"),
)
print("员工", result1["messages"][-1].content)
print("======================================")
# 客服的角色，是可以查询订单的
result2 = agent.invoke(
    {"messages": [{"role": "user", "content": "帮我查订单A1001"}]},
    context=OfficeContext(role="support"),
)
print("客服", result2["messages"][-1].content)
