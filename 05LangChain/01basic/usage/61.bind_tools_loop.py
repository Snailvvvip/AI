# 从 langchain.chat_models 导入统一初始化函数
from langchain.chat_models import init_chat_model

# HumanMessage 表示用户消息，ToolMessage 表示工具执行结果
from langchain.messages import HumanMessage, ToolMessage

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool
from rich import print
from collections.abc import Callable

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain.agents.middleware import wrap_tool_call
from langchain.tools.tool_node import ToolCallRequest

# 加载 .env 中的 API key；override=True 表示覆盖已存在的同名环境变量
load_dotenv(override=True)


# 注册天气工具
@tool
# 只有一个入参 city
def get_weather(city: str) -> str:
    # 描述告诉模型这个工具能干什么
    """获取指定城市的天气信息。"""
    # 模拟返回（真实项目里换成调用天气 API）
    return f"{city} 今天晴，气温 25°C。"


# 初始化模型；temperature=0 让选型行为更稳定可复现
model = init_chat_model("deepseek:deepseek-v4-flash", temperature=0)
"""
# bind_tools 返回一个新对象，原 model 不受影响
model_with_tools = model.bind_tools([get_weather])
# 建立工具名 工具对象映射
toolkit = {get_weather.name: get_weather}
messages = [HumanMessage("北京今天天气怎么样?")]
ai_message = model_with_tools.invoke(messages)
messages.append(ai_message)  # type: ignore

for call in ai_message.tool_calls:
    selected_tool = toolkit[call["name"]]
    observation = selected_tool.invoke(call["args"])
    messages.append(ToolMessage(content=observation, tool_call_id=call["id"]))  # type: ignore

final_message = model_with_tools.invoke(messages)
print(final_message.content)



agent = create_agent(
    model=model,
    tools=[get_weather],
    system_prompt="你是一个中文助手，查天气必须调用get_weather，不要编造",
)
result = agent.invoke(
    {"messages": [{"role": "user", "content": "北京今天天气怎么样？"}]}
)
print(result["messages"][-1].content)



# Agent拿到该工具的执行结果后不再润色，直接结束
@tool(return_direct=True)
def fetch_order_status(order_id: str) -> str:
    ""查询订单物流状态，用户询问订单的时候调度使用""
    return f"订单{order_id}已经发货，预计2 天后送达"


agent = create_agent(
    model=model,
    tools=[fetch_order_status],
    system_prompt="你是一个订单助手，用户询问订单进度时必须调用fetch_order_status ",
)
result = agent.invoke(
    {"messages": [{"role": "user", "content": "帮我查一下A0001订单的物流进度"}]}
)
for i, msg in enumerate(result["messages"]):
    print(f"\n====={i} {type(msg).__name__}=====")
    content = getattr(msg, "content", None)
    if content:
        print(content)
    tool_calls = getattr(msg, "tool_calls", None)
    if tool_calls:
        print("tool_calls", tool_calls)

# 模拟订单数据
ORDERS = {"A001": "已发货", "A002": "运输中"}


@tool
def lookup_order(order_id: str) -> str:
    ""按订单号查询物流状态，订单号的形状如A001""
    key = order_id.strip().upper()
    if key not in ORDERS:
        return f"错误，未找到订单{key}，可用示例为A001、A002"
    return f"订单{key}，状态为{ORDERS[key]}"


agent = create_agent(
    model=model,
    tools=[lookup_order],
    system_prompt="你是一个订单助手，用户询问订单时必须调用lookup_order ",
)
try:
    result = agent.invoke(
        {"messages": [{"role": "user", "content": "帮我查一下A999订单的物流状态"}]}
    )
    print(result["messages"][-1].content)
# 异常直接穿透了整个Agent，agent.invoke直接把错误抛到了你的代码中，也没有生成ToolMessage
# 没有降级回答
except Exception as e:
    print(f"整个Agent崩溃掉了!{type(e).__name__}:{str(e)}")
"""
# 模拟订单数据
ORDERS = {"A001": "已发货", "A002": "运输中"}


@tool(description="按订单号查询物流状态，订单号的形状如A001")
def lookup_order(order_id: str) -> str:
    """按订单号查询物流状态，订单号的形状如A001"""
    key = order_id.strip().upper()
    return f"订单{key}，状态为{ORDERS[key]}"


@wrap_tool_call  # type: ignore
def handle_tool_errors(
    request: ToolCallRequest,  # 本次的工具调用请求，含 工具名，参数，工具调用ID
    # Callable=类型注解，表示这是一个函数或者是可调用对象，[ToolCallRequest]输入参数类型 ToolMessage返回值类型
    handler: Callable[[ToolCallRequest], ToolMessage],  # 真正执行这次工具调用的默认逻辑
) -> ToolMessage:
    """把工具调用异常转换为模型可以消费的ToolMessage"""
    # 正常路径 调用handler执行原始工具
    try:
        # 按原样调用工具，产出对应ToolMessage
        # 如果没有当前这个个中间件，走的就是这个逻辑
        return handler(request)
        # 如果说handler(request)返回是一个字符串的话，其实内部也会自动封装成一个ToolMessage
    except Exception as e:
        return ToolMessage(
            content=f"工具执行错误:{type(e).__name__}:{str(e)},请检查参数后重试",
            tool_call_id=request.tool_call["id"],
        )


agent = create_agent(
    model=model,
    tools=[lookup_order],
    middleware=[handle_tool_errors],  # type: ignore
    system_prompt="你是一个订单助手，用户询问订单时必须调用lookup_order ",
)  # type: ignore
result = agent.invoke(
    {"messages": [{"role": "user", "content": "帮我查一下A999订单的物流状态"}]}
)
for i, msg in enumerate(result["messages"]):
    print(f"\n====={i} {type(msg).__name__}=====")
    content = getattr(msg, "content", None)
    if content:
        print(content)
    tool_calls = getattr(msg, "tool_calls", None)
    if tool_calls:
        print("tool_calls", tool_calls)

# request: ToolCallRequest = {"name": "lookup_order", "args": {"order_id": "A999"}}
#
#
# def handler(request):
#    name = request["name"]
#    args = request["args"]
#    if name == "lookup_order":
#        return lookup_order.invoke(args)
