# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent

# 一次性导入本章用到的全部内置护栏中间件
from langchain.agents.middleware import (
    # 危险工具人工审批
    HumanInTheLoopMiddleware,
    # 模型调用限额
    ModelCallLimitMiddleware,
    # 模型调用重试
    ModelRetryMiddleware,
    # 敏感信息处理
    PIIMiddleware,
    # 工具调用限额
    ToolCallLimitMiddleware,
    # 工具调用重试
    ToolRetryMiddleware,
)

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool

# HITL 与 thread 累计限额都需要 checkpointer
from langgraph.checkpoint.memory import InMemorySaver

# Command 用于审批后恢复执行
from langgraph.types import Command

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 加载 .env 中的 API key
load_dotenv(override=True)


# 用字典模拟订单数据库
ORDERS = {
    # 订单号 -> 状态
    "A1001": "已发货",
    "A1002": "运输中",
}


# 只读工具一：查订单
@tool
def lookup_order(order_id: str) -> str:
    """按订单号查询状态。订单号形如 A1001。"""
    # 归一化输入，容忍空格与小写
    key = order_id.strip().upper()
    # 查表，查不到返回 None
    status = ORDERS.get(key)
    # 业务可知失败：返回字符串说明，不抛异常（不会触发 Retry）
    if not status:
        return f"错误：未找到订单 {order_id}。"
    # 正常返回状态
    return f"订单 {key} 状态：{status}。"


# 只读工具二：查制度
@tool
def lookup_policy(topic: str) -> str:
    """查询公司制度摘要。"""
    # 简单关键词匹配
    if "报销" in topic:
        return "差旅报销需在返程 7 日内提交。"
    # 未命中同样返回说明，并提示可用取值
    return "错误：未匹配制度。可尝试：报销。"


# 危险工具：有不可逆副作用
@tool
def send_email(to: str, subject: str, body: str) -> str:
    """发送工作邮件（有副作用，必须人工审批后才执行）。"""
    # 真实场景这里会调用邮件服务；正文只回摘要避免日志过长
    return f"已发送至 {to}｜主题：{subject}｜正文摘要：{body[:40]}。"


# 用函数封装构造过程，方便测试里反复创建
def build_guarded_agent():
    # 返回配置好全套护栏的 Agent
    return create_agent(
        # 模型标识
        model="deepseek:deepseek-v4-flash",
        # 两个只读工具 + 一个危险工具
        tools=[lookup_order, lookup_policy, send_email],
        # HITL 暂停需要持久化状态；生产请换 Postgres
        checkpointer=InMemorySaver(),
        # 顺序：先清洗与限流，再重试，最后 HITL
        middleware=[
            # 1) 输入侧 PII
            # 只 mask 卡号：没有任何工具需要卡号，脱敏是纯收益
            # 刻意不对 email 脱敏——send_email 需要真实地址，详见 §6.4
            PIIMiddleware("credit_card", strategy="mask", apply_to_input=True),
            # 2) 限流（单轮）
            # 模型最多调 10 次，防死循环
            ModelCallLimitMiddleware(run_limit=10, exit_behavior="end"),
            # 所有工具合计最多 12 次
            ToolCallLimitMiddleware(run_limit=12),
            # 发信单独收紧到 2 次，物理上防止重复副作用（见 §7.4）
            ToolCallLimitMiddleware(tool_name="send_email", run_limit=2),
            # 3) 重试
            # 模型偶发失败重试 2 次
            ModelRetryMiddleware(max_retries=2, initial_delay=0.5),
            # 只对两个只读工具重试；发信绝不自动重试，避免重复投递
            ToolRetryMiddleware(
                # 再试 2 次
                max_retries=2,
                # 白名单：不含 send_email
                tools=["lookup_order", "lookup_policy"],
                # 首次重试等 0.3 秒
                initial_delay=0.3,
                # 耗尽后转成 ToolMessage，让对话继续
                on_failure="continue",
            ),
            # 4) HITL：只拦发信
            HumanInTheLoopMiddleware(
                # 逐个工具声明策略
                interrupt_on={
                    # 危险工具：打断并允许三种决策
                    "send_email": {
                        "allowed_decisions": ["approve", "edit", "reject"],
                    },
                    # 只读工具明确不打断，避免人审疲劳
                    "lookup_order": False,
                    "lookup_policy": False,
                },
                # 中文前缀，审批界面更友好
                description_prefix="生产护栏：待审批",
            ),
        ],  # type: ignore
        # 提示层约束：工具选择 + 禁止编造 + 禁止假装已发信
        system_prompt=(
            "你是带护栏的办公助手。"
            "查单用 lookup_order；制度用 lookup_policy；发信必须调用 send_email。"
            "禁止编造订单与制度；禁止声称已发信除非工具已执行。"
        ),
    )  # type: ignore


# 作为脚本直接运行时演示两条路径
if __name__ == "__main__":
    # 构造 Agent
    agent = build_guarded_agent()
    # 只读路径用独立 thread，避免与发信状态缠在一起
    config = {"configurable": {"thread_id": "prod-guard-demo"}}

    # A. 只读路径：不应打断
    r1 = agent.invoke(
        # 一句话同时问订单和制度，观察并行工具调用
        {"messages": [{"role": "user", "content": "订单 A1001 到哪了？报销怎么走？"}]},
        # 带上 thread_id
        config=config,
        # v2 形态便于判断是否打断
        version="v2",
    )
    # 只读工具设了 False，这里出现打断就说明配错了
    if r1.interrupts:
        print("意外打断:", r1.interrupts)
    else:
        # 正常结束时从 .value 取状态
        print("只读回复:", r1.value["messages"][-1].content)

    # B. 发信路径：应打断 → 批准
    # 换一个 thread_id，让演示轨迹更干净
    config2 = {"configurable": {"thread_id": "prod-guard-mail"}}
    # 第一跳：跑到 send_email 前暂停
    paused = agent.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": "给 team@example.com 发邮件，主题「值班提醒」，正文写明天值班表已更新。",
                }
            ]
        },
        # 使用发信专用 thread
        config=config2,
        # 保持 v2
        version="v2",
    )
    # 这里应为 True
    print("发信打断:", bool(paused.interrupts))
    # 有待审动作则展示并批准
    if paused.interrupts:
        # 真实场景这里渲染审批界面
        print(paused.interrupts[0].value)
        # 第二跳：同一 thread_id 提交 approve
        done = agent.invoke(
            # 一个待审动作对应一条决策
            Command(resume={"decisions": [{"type": "approve"}]}),
            # 必须与第一跳一致
            config=config2,
            # 保持 v2
            version="v2",
        )
        # 批准后取最终回复
        print("批准后:", done.value["messages"][-1].content)
