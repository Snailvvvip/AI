# 从 dataclasses 导入 dataclass 装饰器
from dataclasses import dataclass

# 从 typing 导入 Literal，用于锁定枚举取值
from typing import Literal

# 从 pydantic 导入 BaseModel、Field，用于声明工具入参
from pydantic import BaseModel, Field

# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent

# 一次导入动态提示、模型调用拦截器与请求类型
from langchain.agents.middleware import dynamic_prompt, wrap_model_call, ModelRequest

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 加载 .env 中的 API key
load_dotenv(override=True)


# ---------- 上下文 ----------
# 用 dataclass 定义每次调用传入的上下文结构
@dataclass
class OfficeContext:
    # 类说明
    """办公助理运行时上下文。"""

    # 用户姓名，用于动态提示
    user_name: str = "同事"
    # 部门，用于动态提示
    dept: str = "综合办"
    # employee：普通员工；support：客服（可查单）
    role: str = "employee"


# ---------- 模拟数据 ----------
# 模拟订单库
ORDERS = {
    # 已发货
    "A1001": {"status": "已发货", "eta_days": 2},
    # 运输中
    "A1002": {"status": "运输中", "eta_days": 1},
    # 已签收
    "A1003": {"status": "已签收", "eta_days": 0},
}

# 模拟制度库
POLICIES = {
    # 报销制度
    "报销": "差旅报销需在返程 7 日内提交，单笔超 1000 元需主管审批。",
    # 请假制度
    "请假": "年假提前 3 天申请；病假需当日同步直属上级。",
    # 加班制度
    "加班": "加班需事先在系统提交，月末统一调休或结算。",
}


# ---------- 工具 ----------
# 用 Pydantic 声明天气工具入参
class WeatherInput(BaseModel):
    # 类 docstring 成为 schema 描述
    """天气查询入参。"""

    # 必填字段：城市名
    city: str = Field(description="城市名，如北京、上海")
    # 选填字段：温度单位，用 Literal 限制取值并给默认值
    units: Literal["celsius", "fahrenheit"] = Field(
        # 默认摄氏度
        default="celsius",
        # 字段说明
        description="温度单位",
    )


# 挂上 Pydantic schema
@tool(args_schema=WeatherInput)
# 函数参数名要与 schema 字段一致
def get_weather(city: str, units: str = "celsius") -> str:
    # 描述里写明必须调用，压制模型凭常识编造
    """查询城市当前天气。用户问天气时必须调用，不要编造。"""
    # 按单位给出模拟温度
    temp = 26 if units == "celsius" else 79
    # 拼装返回文本
    return f"{city} 当前约 {temp}°（{units}），晴间多云。"


# 用 description 覆盖描述，明确禁止心算
@tool(description="计算两个数的加减乘除。任何算术都请调用，不要心算。")
# op 用 Literal 锁定四个运算符，从结构上排除非法输入
def calculate(a: float, b: float, op: Literal["+", "-", "*", "/"]) -> str:
    # 已传 description，这句 docstring 对模型不可见
    """对 a、b 做四则运算。"""
    # 加法
    if op == "+":
        return str(a + b)
    # 减法
    if op == "-":
        return str(a - b)
    # 乘法
    if op == "*":
        return str(a * b)
    # 走到这里是除法，先挡住除零
    if b == 0:
        return "错误：除数不能为 0。"
    # 除法
    return str(a / b)


# 查单工具，仅客服角色可见
@tool
def lookup_order(order_id: str) -> str:
    # 描述里说明格式与适用角色
    """按订单号查询物流状态。订单号形如 A1001。客服角色可用。"""
    # 规范化输入，容忍大小写和空格
    key = order_id.strip().upper()
    # 用 .get() 避免 KeyError
    row = ORDERS.get(key)
    # 未命中时返回错误说明并给出可用示例，方便模型改口
    if not row:
        return f"错误：未找到订单 {order_id}。可用示例：A1001、A1002、A1003。"
    # 命中则拼装状态文本
    return f"订单 {key}：{row['status']}，预计 {row['eta_days']} 天后相关节点完成。"


# 制度查询工具
@tool
def lookup_policy(topic: str) -> str:
    # 描述里列出可选主题
    """查询公司制度摘要。topic 可为：报销、请假、加班。"""
    # 遍历制度库做关键词包含匹配
    for key, text in POLICIES.items():
        # 主题含关键词即命中，能容忍「报销流程」这类问法
        if key in topic:
            return text
    # 全部未命中时返回错误说明与可选项
    return "错误：未匹配到制度。请尝试：报销 / 请假 / 加班。"


# 把全部工具预注册到一个列表，可见性交给 middleware 控制
ALL_TOOLS = [get_weather, calculate, lookup_order, lookup_policy]


# ---------- 动态策略 ----------
# 按上下文生成系统提示
@dynamic_prompt
def office_prompt(request: ModelRequest) -> str:
    # 取出本次上下文，可能为 None
    ctx = request.runtime.context
    # 安全读取姓名
    name = getattr(ctx, "user_name", "同事")
    # 安全读取部门
    dept = getattr(ctx, "dept", "综合办")
    # 安全读取角色
    role = getattr(ctx, "role", "employee")
    # 按角色给出不同的权限说明句（软约束，配合下面的硬过滤）
    role_line = (
        # 客服文案
        "你当前具备客服权限，可以查询订单。"
        # 三元表达式的条件
        if role == "support"
        # 员工文案：明确要求说明权限而不是编造
        else "你当前是员工助手：若用户要查订单，请说明需客服权限，不要编造状态。"
    )
    # 返回完整提示：人设 + 权限说明 + 路由表 + 禁令
    return f"""你是 {dept} 的办公助手，正在帮助 {name}。
{role_line}

工具策略：
- 天气 → get_weather
- 算术 → calculate（禁止心算）
- 制度 → lookup_policy
- 订单 → lookup_order（仅当该工具可用）

禁止编造天气、订单与制度。多项问题都要处理，最后统一简洁回答。"""


# 按角色硬过滤工具
@wrap_model_call
def filter_tools_by_role(request: ModelRequest, handler):
    # 安全读取角色
    role = getattr(request.runtime.context, "role", "employee")
    # 复制列表，不改动原对象
    tools = list(request.tools)
    # 非客服则移除查单工具
    if role != "support":
        # 按 name 过滤
        tools = [t for t in tools if getattr(t, "name", None) != "lookup_order"]
    # 用覆盖后的请求继续往内层走
    return handler(request.override(tools=tools))


# 用工厂函数封装组装过程，便于测试里复用
def build_office_assistant():
    # 函数说明
    """组装多工具办公助理。"""
    # 返回创建好的 Agent
    return create_agent(
        # 模型标识
        model="deepseek:deepseek-v4-flash",
        # 预注册全部工具
        tools=ALL_TOOLS,
        # 顺序说明见下文：过滤器在内层，动态提示在外层
        middleware=[office_prompt, filter_tools_by_role],
        # 声明上下文类型
        context_schema=OfficeContext,
    )


# 打印完整轨迹的小工具，本章反复用到
def print_trajectory(result) -> None:
    # 逐条遍历消息
    for i, msg in enumerate(result["messages"]):
        # 打印序号与类型
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


# 只在直接运行本文件时执行演示
if __name__ == "__main__":
    # 组装助理
    agent = build_office_assistant()

    # 场景一：员工提组合问题，其中含一项越权请求
    print("======= 员工：组合问题（含越权查单）=======")
    r_emp = agent.invoke(
        {
            # 一句话涉及天气、制度、算术、查单四个意图
            "messages": [
                {
                    # 角色为用户
                    "role": "user",
                    # 最后那个「查下 A1001」是员工无权的
                    "content": "上海天气怎么样？报销怎么走？128+256等于多少？顺便查下 A1001。",
                }
            ]
        },
        # 传入员工上下文
        context=OfficeContext(user_name="周杰", dept="市场部", role="employee"),
    )
    # 打印员工轨迹
    print_trajectory(r_emp)

    # 场景二：客服查单，应能成功
    print("\n======= 客服：查单 ======")
    r_sup = agent.invoke(
        {
            # 只问查单
            "messages": [{"role": "user", "content": "帮我查订单 A1001 现在到哪了？"}]
        },
        # 传入客服上下文
        context=OfficeContext(user_name="坐席小陈", dept="客服中心", role="support"),
    )
    # 打印客服轨迹
    print_trajectory(r_sup)
