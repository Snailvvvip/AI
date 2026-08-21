# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent

# ModelRequest 是请求对象类型，wrap_model_call 是模型调用拦截装饰器
from langchain.agents.middleware import ModelRequest, wrap_model_call

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool

# 加载 .env 中的 API key
load_dotenv(override=True)

"""
# 注册一个天气工具，确保模型会发起工具调用
@tool
def get_weather(city: str) -> str:
    ""查询城市天气。""
    return f"{city} 晴，25°C。"


# 用列表记录每次进入middleware时看到的消息条数
calls = []


# 一旦一个普通的函数用装饰器装饰之后，它就会成为一个中间件
# 把中间件配置在create_agent之后，这个中间件函数就会在agent运行到指定步骤的时候执行
# middleware 每次「调模型」跑一遍，不是每次 invoke 跑一遍
# 注册模型调用拦截器
@wrap_model_call
# 签名固定为 request,handler  request模型调用请求  handler处理模型调用请求
def count_calls(request: ModelRequest, handler):
    # 每次被 调用就记录一下当前状态里的消息条数
    # create_agent内langgraph图，图里面会维护一个状态，状态里最重要的一个属性就是messages消息列表
    calls.append(len(request.state["messages"]))
    # 必须把控制权交还给链路
    result = handler(request)
    return result


# 创建 Agent 并挂上计数器
agent = create_agent(
    # 模型标识
    model="deepseek:deepseek-v4-flash",
    # 一个工具
    tools=[get_weather],
    # middleware 接收列表
    middleware=[count_calls],
    # 引导模型调用工具
    system_prompt="查天气必须调用 get_weather。",
)


# 只调用一次 invoke
res = agent.invoke({"messages": [{"role": "user", "content": "北京天气怎么样？"}]})

# 观察 middleware 实际被触发了几次
print(f"middleware 被调用 {len(calls)} 次，每次看到的消息条数: {calls}")
# 对比最终状态里的消息总数
print(f"最终 messages 条数: {len(res['messages'])}")
# Human北京天气怎么样？
# AI 要调get_weather
# ToolMessage 晴，25°C。
# AI 最后进行润色


# wrap_model_call这钩子对应的中间件会在每次模型调有的时候执行一次
# 挂载点是靠注解的对吧

# 用列表记录按时间顺序记录进出
log = []


@tool
def get_weather(city: str) -> str:
    ""查询城市天气。""
    return f"{city} 晴，25°C。"


@wrap_model_call
def layer_one(request: ModelRequest, handler):
    log.append("第1个进入")#compose_two
    result = handler(request)
    log.append("第1个退出")
    return result


@wrap_model_call
def layer_two(request: ModelRequest, handler):
    log.append("第2个进入")#compose_two
    result = handler(request)
    log.append("第2个退出")
    return result


@wrap_model_call
def layer_three(request: ModelRequest, handler):
    log.append("第3个进入")#_execute_model_sync 
    result = handler(request)
    log.append("第3个退出")
    return result


agent = create_agent(
    # 模型标识
    model="deepseek:deepseek-v4-flash",
    # 一个工具
    tools=[get_weather],
    # middleware 接收列表
    middleware=[layer_one, layer_two, layer_three],
    # 引导模型调用工具
    system_prompt="查天气必须调用 get_weather。",
)
res = agent.invoke({"messages": [{"role": "user", "content": "1+1=?"}]})
for line in log:
    print(line)



# 注册查单工具
@tool
# 入参为订单号
def lookup_order(order_id: str) -> str:
    # 描述里说明订单号格式，帮助模型正确填参
    ""按订单号查询物流状态。订单号形如 A1001。""
    # 模拟订单库
    catalog = {"A1001": "已发货", "A1002": "运输中"}
    # 规范化输入：去空格并转大写，容忍模型的格式偏差
    key = order_id.strip().upper()
    # 查不到时返回错误说明而不是抛异常（第 8 章 §9 的做法）
    if key not in catalog:
        return f"错误：未找到订单 {order_id}。"
    # 查到则返回状态
    return f"订单 {key} 状态：{catalog[key]}。"


# 注册制度查询工具
@tool
# 入参为制度主题
def lookup_policy(topic: str) -> str:
    # 描述里列出可选主题
    ""查询公司制度摘要。topic 可为报销、请假、加班。""
    # 模拟制度库
    policies = {
        # 报销制度
        "报销": "差旅报销需在返程 7 日内提交。",
        # 请假制度
        "请假": "年假提前 3 天申请。",
    }
    # 遍历制度库做「关键词包含」的模糊匹配
    for k, v in policies.items():
        # 主题里含关键词就算命中，能容忍「报销流程」这类问法
        if k in topic:
            return v
    # 全部未命中时返回错误说明与可选项
    return "错误：未匹配到制度。请尝试：报销 / 请假"


# 把系统提示抽成常量，便于单独维护与版本对比
SYSTEM_PROMPT = ""你是公司办公助手，回答简洁、有依据。

工具策略：
- 查订单进度 → lookup_order
- 问制度规章 → lookup_policy
- 信息不足时先追问关键字段（如订单号），不要猜测

禁止：
- 编造订单状态或制度条文
- 在工具返回「错误：」时假装查到了结果

输出：先给结论，必要时再补一句依据。""


# 创建 Agent，三件套齐全
agent = create_agent(
    # 模型标识
    model="deepseek:deepseek-v4-flash",
    # 两个工具
    tools=[lookup_order, lookup_policy],
    # 把上面那段提示传进去
    system_prompt=SYSTEM_PROMPT,
)

# 一句话里问两件事，观察模型是否都处理
result = agent.invoke(
    {"messages": [{"role": "user", "content": "A1001 到哪了？报销怎么走？"}]}
)
# 打印最终回答
print(result["messages"][-1].content)
"""
