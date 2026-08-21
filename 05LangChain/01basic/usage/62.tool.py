# 从 typing 导入 Literal，用于把参数取值限制在固定选项内
from typing import Literal

# 从 pydantic 导入 BaseModel 与 Field，用于声明入参 schema
from pydantic import BaseModel, Field

# 从 langchain.agents 导入 create_agent 工厂函数
from langchain.agents import create_agent

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 加载 .env 中的 API key
load_dotenv(override=True)


# ---------- 模拟数据 ----------
# 订单库：键为订单号，值含状态与预计天数
ORDERS = {
    # 已发货订单
    "A1001": {"status": "已发货", "eta_days": 2},
    # 运输中订单
    "A1002": {"status": "运输中", "eta_days": 1},
    # 已签收订单
    "A1003": {"status": "已签收", "eta_days": 0},
}

# 制度库：键为主题关键词，值为条文摘要
POLICIES = {
    # 报销制度
    "报销": "差旅报销需在返程 7 日内提交，单笔超 1000 元需主管审批。",
    # 请假制度
    "请假": "年假提前 3 天申请；病假需当日同步直属上级。",
    # 加班制度
    "加班": "加班需事先在系统提交，月末统一调休或结算。",
}


# ---------- 工具定义 ----------
# 用 Pydantic 声明天气工具的入参（对应 §5.2 的做法）
class WeatherInput(BaseModel):
    # 类 docstring 成为 schema 的顶层描述
    """天气查询入参。"""

    # 必填字段：城市名，description 帮助模型正确填写
    city: str = Field(description="城市名，如北京、上海")
    # 枚举字段：只能填两种单位之一，默认摄氏
    units: Literal["C", "F"] = Field(
        # 有默认值 → 模型可以不填
        default="C",
        # 字段说明
        description="温度单位",
    )


# 挂上 Pydantic schema
@tool(args_schema=WeatherInput)
# 参数名必须与 WeatherInput 的字段一一对应
def get_weather(city: str, units: str = "C") -> str:
    # docstring 成为工具描述，写明「何时必须调用」
    """查询城市当前天气。用户问天气时必须调用，不要编造。"""
    # 根据单位选择模拟温度值
    temp = 26 if units == "C" else 79
    # 返回简洁字符串
    return f"{city} 当前约 {temp}°（{units}），晴间多云。"


# 用 description 覆盖描述，写成带指令性的选型说明
@tool(
    description="计算两个数的加减乘除。任何算术都请调用，不要心算。",
)
# op 用 Literal 限定为四个运算符，从结构上避免了 §4.3 的 eval 隐患
def calculate(a: float, b: float, op: Literal["+", "-", "*", "/"]) -> str:
    # 已传 description，这句 docstring 对模型不可见
    """对 a、b 做四则运算。"""
    # 加法
    if op == "+":
        # 结果转字符串返回
        return str(a + b)
    # 减法
    if op == "-":
        # 结果转字符串返回
        return str(a - b)
    # 乘法
    if op == "*":
        # 结果转字符串返回
        return str(a * b)
    # 走到这里说明是除法，先挡住除零，返回错误说明而不是 raise
    if b == 0:
        # 错误文案让模型知道该换参数
        return "错误：除数不能为 0。"
    # 除法
    return str(a / b)


# 查单工具
@tool
# 入参为订单号
def lookup_order(order_id: str) -> str:
    # 描述里说明订单号格式
    """按订单号查询物流状态。订单号形如 A1001。"""
    # 规范化输入：容忍空格和小写（§9.2 验证过模型真会填小写）
    key = order_id.strip().upper()
    # 用 .get() 而不是 []，查不到返回 None 而不抛 KeyError
    row = ORDERS.get(key)
    # 未命中时返回错误说明，并给出可用示例便于模型自纠
    if not row:
        # 错误文案带上可用订单号，模型能据此追问用户
        return f"错误：未找到订单 {order_id}。可用示例：A1001、A1002、A1003。"
    # 命中时拼装状态文本
    return f"订单 {key}：{row['status']}，预计 {row['eta_days']} 天后相关节点完成。"


# 制度查询工具
@tool
# 入参为制度主题
def lookup_policy(topic: str) -> str:
    # 描述里列出可选主题，帮助模型填参
    """查询公司制度摘要。topic 可为：报销、请假、加班。"""
    # 遍历制度库，用「关键词包含」做模糊匹配
    for key, text in POLICIES.items():
        # 只要主题里含有关键词就算命中，能容忍「报销流程」这类问法
        if key in topic:
            # 命中即返回条文
            return text
    # 全部未命中时返回错误说明与可选项
    return "错误：未匹配到制度。请尝试：报销 / 请假 / 加班。"


# 导出工具包列表，供 Agent 或其他模块复用
BUSINESS_TOOLS = [get_weather, calculate, lookup_order, lookup_policy]


def build_office_agent():
    # 函数说明
    """组装多工具办公助理。"""
    # 返回配置好的 Agent
    return create_agent(
        # 模型标识
        model="deepseek:deepseek-v4-flash",
        # 一次挂载全部四个工具
        tools=BUSINESS_TOOLS,
        # 系统提示里逐一点明「什么问题用哪个工具」，帮助选型
        system_prompt=(
            "你是公司办公助手，回答简洁可靠。"
            "查天气用 get_weather；算术用 calculate；"
            "查订单用 lookup_order；问制度用 lookup_policy。"
            "禁止编造订单状态与制度条文。"
        ),
    )


agent = build_office_agent()
# 一句话里塞三个不同类型的问题，观察模型如何选型
result = agent.invoke(
    {
        # 输入是带 messages 键的字典
        "messages": [
            {
                # 角色为用户
                "role": "user",
                # 同时涉及天气、订单、算术
                "content": "上海天气怎么样？订单 A1001 到哪了？另外 128+256 等于多少？",
            }
        ]
    }
)
# 打印最终回答
print(result["messages"][-1].content)
