# 从 langchain.agents 导入创建 Agent 的工厂函数
from langchain.agents import create_agent

# 内置摘要中间件，用于长会话控长
from langchain.agents.middleware import SummarizationMiddleware

# tool 装饰器，把普通函数变成工具
from langchain.tools import tool

# 内存版 checkpointer（生产请换 Postgres，见 §3.4）
from langgraph.checkpoint.memory import InMemorySaver

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 加载 .env 中的 API key
load_dotenv(override=True)

# 用字典模拟订单数据库
ORDERS = {
    # 订单号 -> 物流状态
    "A1001": "已发货，预计明天送达",
    "A1002": "运输中，预计后天送达",
}


# 注册为工具：查订单
@tool
def lookup_order(order_id: str) -> str:
    """按订单号查询物流状态。订单号形如 A1001。"""
    # 归一化：去空格并转大写，容忍用户输入 a1002
    key = order_id.strip().upper()
    # 查字典
    status = ORDERS.get(key)
    # 查不到就返回明确的错误文本，让模型知道该追问
    if not status:
        return f"错误：未找到订单 {order_id}。"
    # 查到则返回结构清晰的一句话
    return f"订单 {key}：{status}。"


# 注册为工具：查政策
@tool
def lookup_policy(topic: str) -> str:
    """查询退换货与售后政策摘要。"""
    # 演示用固定文案；真实项目这里应接 RAG（第 12 章起）
    return (
        "退换货：签收 7 日内可无理由退货；"
        "质量问题 15 日内可换货；"
        "跨境订单以页面公示为准。"
    )


# 工厂函数：把摘要做成开关，方便 A/B 对照
def build_customer_agent(*, enable_summary: bool = True):
    # 中间件列表，默认为空
    middleware = []
    # 只有开启摘要时才挂 SummarizationMiddleware
    if enable_summary:
        middleware.append(
            SummarizationMiddleware(
                # 摘要模型，可换更便宜的
                model="deepseek:deepseek-v4-flash",
                # messages 到 12 条就压缩
                trigger=("messages", 12),
                # 压缩后保留最近 8 条原文
                keep=("messages", 8),
            )
        )

    # 返回组装好的 Agent
    return create_agent(
        # 主对话模型
        model="deepseek:deepseek-v4-flash",
        # 两个业务工具
        tools=[lookup_order, lookup_policy],
        # 记忆开关：没有它就没有多轮
        checkpointer=InMemorySaver(),
        # 上面按开关拼出来的中间件
        middleware=middleware,
        system_prompt=(
            # 角色设定
            "你是电商客服助手。"
            # 工具选择规则
            "查订单用 lookup_order；问政策用 lookup_policy。"
            # 防幻觉约束
            "依据工具返回回答，不要编造物流状态。"
            # 显式鼓励利用历史，这是多轮指代能work的关键
            "用户提到过的订单号，后续轮次可主动关联。"
        ),
    )


# 只有直接运行本文件时才执行下面的演示
if __name__ == "__main__":
    # 构建 Agent（默认开启摘要）
    agent = build_customer_agent()
    # 固定一条会话线
    config = {"configurable": {"thread_id": "cs-demo-001"}}

    # 三轮对话，第三轮故意用「刚才那个订单」考验记忆
    turns = [
        "你好，我订单 A1002 到哪了？",
        "退换货几天内可以退？",
        "刚才那个订单，大概哪天到？",
    ]
    # 逐轮对话
    for text in turns:
        # 打印用户输入
        print(f"\n用户: {text}")
        # 每轮只传新消息，历史由 checkpointer 合并
        result = agent.invoke(
            {"messages": [{"role": "user", "content": text}]},
            config=config,
        )
        # 打印助手回答
        print(f"助手: {result['messages'][-1].content}")

    # 调试：查看 thread 内消息条数
    snap = agent.get_state(config)
    # 条数应随轮次增长（未触发摘要时）
    print(f"\n[debug] thread 内 messages 条数: {len(snap.values['messages'])}")
