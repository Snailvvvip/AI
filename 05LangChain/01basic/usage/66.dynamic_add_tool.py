# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent
from dataclasses import dataclass

# 导入请求类型与模型调用拦截装饰器
from langchain.agents.middleware import (
    ModelRequest,
    wrap_model_call,
    dynamic_prompt,
    wrap_tool_call,
    ToolCallRequest,
)

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool
from rich import print

# 加载环境变量
load_dotenv(override=True)


# 如何动态增加工具，比如以后我们接入MCP，MCP提供很多动态工具，我们就需要把这些MCP提供的工具添加到工具列表中并且能够调用
@tool
def get_weather(city: str) -> str:
    """查询城市天气。"""
    # 返回模拟天气
    return f"{city} 晴，25°C。"


@tool
def calculate_tip(bill_amount: float, tip_percentage: float = 20.0) -> str:
    """根据账单金额与小费比例计算应付小费与总计。"""
    # 按百分比算出小费
    tip = bill_amount * (tip_percentage / 100)
    # 账单加小费得到总计
    total = bill_amount + tip
    # 保留两位小数返回
    return f"小费 1000元"


# 调用模型前，把动态工具临时加入可见列表中
@wrap_model_call
def expose_dynamic_tools(request: ModelRequest, handler):
    # 用解包的语法把原有的工具和动态添加的工具拼成一个新的列表
    # 添加的工具可以会根的根据不同的角色不同的工具
    updated_request = request.override(tools=[*request.tools, calculate_tip])
    return handler(updated_request)


# 执行工具时，如果是动态工具，指定用哪个tool对象执行
@wrap_tool_call
def execute_dynamic_tools(request: ToolCallRequest, handler):
    # 如果说本次执行工具就是新添加的动态工具
    if request.tool_call.get("name") == "calculate_tip":
        # override重写覆盖要执行工具，明确告诉执行侧该 用哪个工具对象执行
        return handler(request.override(tool=calculate_tip))
    # 其它的工具比如get_weather就走默认逻辑
    return handler(request)


# 创建 Agent
agent = create_agent(
    # 模型标识
    model="deepseek:deepseek-v4-flash",
    # 注意：这里只有 get_weather；calculate_tip 靠 middleware 动态挂上
    tools=[get_weather],
    # 两个钩子必须成对出现，缺一个就会预检失败
    middleware=[
        execute_dynamic_tools,
        expose_dynamic_tools,
    ],
    # 提示里点名两个工具的用途
    system_prompt=(
        "你是助手。查天气用 get_weather；算小费必须使用 calculate_tip工具，如果算小费的时候找不到calculate_tip就说无法计算"
    ),
)
# 在create_agent这后就会在内部维护一个映射关系map= {get_weather:get_weather}
# calculate_tip=None 所以说取不到真正的工具
result = agent.invoke(
    {
        # 输入是带 messages 键的字典
        "messages": [
            # 一句需要算小费的话
            {"role": "user", "content": "账单 85 元，按 20% 算小费和总计。"}
        ]
    }
)
# 遍历轨迹确认动态工具真的被执行了
for i, msg in enumerate(result["messages"]):
    # 打印序号与消息类型
    print(f"\n===== [{i}] {type(msg).__name__} =====")
    # 安全取 content
    content = getattr(msg, "content", None)
    # 非空才打印
    if content:
        print("content:", content)
    # 安全取 tool_calls
    tool_calls = getattr(msg, "tool_calls", None)
    # 有则打印
    if tool_calls:
        print("tool_calls:", tool_calls)
"""
1. 用户提问 账单 85 元，按 20% 算小费和总计
2. AI收到用户提问，就可以看到工具了，准备执行工具，所以就会发起工具调用tool_call
3. agent收到这个tool_call就要真正调用工具了，会走wrap_tool_call，穿上时候request.tool=None,
这个时候就需要用真正工具对象更新None值，让handler真正执行工具


"""
