# 从 typing 导入 Literal，用于把状态限制为固定枚举
from typing import Literal

# 从 pydantic 导入 BaseModel 与 Field
from pydantic import BaseModel, Field

# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent

# ToolStrategy 让结构化输出走 tool calling 通道
from langchain.agents.structured_output import ToolStrategy

# init_chat_model 用于传 extra_body 关闭 thinking
from langchain.chat_models import init_chat_model

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 加载 .env 中的 API key
load_dotenv(override=True)


# 定义最终产出的结构，供程序直接消费
class OrderBrief(BaseModel):
    # 类 docstring 会成为 schema 描述，模型能看到
    """订单查询结果摘要，供程序消费。"""

    # 订单号，必填
    order_id: str = Field(description="订单号")
    # 状态用 Literal 锁定取值，避免模型自由发挥
    status: Literal["待发货", "已发货", "已完成", "未知"] = Field(description="状态")
    # 给人看的一句话，这才是真正的「自然语言回答」
    one_line: str = Field(description="给用户看的一句话说明")


# 查单工具
@tool
def lookup_order(order_id: str) -> str:
    """查询订单状态（演示用固定数据）。"""
    # 演示用固定返回
    return f"订单 {order_id}：已发货，预计明天送达。"


# 显式构造模型实例，以便传 extra_body
model = init_chat_model(
    # 模型标识
    "deepseek:deepseek-v4-flash",
    # 结构化输出要稳定，温度设 0
    temperature=0,
    # 关键：关闭 thinking 模式，否则和 tool_choice 冲突
    extra_body={"thinking": {"type": "disabled"}},
)

# 创建带结构化终态的 Agent
agent = create_agent(
    # 传入上面构造好的模型实例
    model=model,
    # 工具照常挂载，工具循环仍然工作
    tools=[lookup_order],
    # response_format 指定最终产出的 schema；handle_errors 让校验失败可重试
    response_format=ToolStrategy(OrderBrief, handle_errors=True),
    # 提示里强调字段必须来自工具返回
    system_prompt="先查订单再摘要；字段只依据工具返回，不要编造。",
)

# 正常调用
result = agent.invoke(
    {"messages": [{"role": "user", "content": "帮我查 A1002 并给个摘要。"}]}
)
# 结构化结果在 structured_response 键里，是一个 OrderBrief 实例
print(result["structured_response"])
# 给人看的文案应从结构化字段里取，而不是取 messages[-1]
print(result["structured_response"].one_line)
# 在生产环境相同的业务一般会创建一个Agent
# 也会讲A2A，Agent2Agent 创建Agent，然后让它进行协作
