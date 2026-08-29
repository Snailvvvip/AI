# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent

# 导入人机协同中间件
from langchain.agents.middleware import HumanInTheLoopMiddleware

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool

# HITL 必须配 checkpointer，这里用最简单的内存实现
from langgraph.checkpoint.memory import InMemorySaver

# 导入基于 PostgreSQL 的检查点存储实现
from langgraph.checkpoint.postgres import PostgresSaver

# Command 用于第二跳恢复执行
from langgraph.types import Command
from rich import print

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv
import os

# 加载 .env 中的 API key
load_dotenv(override=True)

# 数据库连接串，优先读取 .env 里的 POSTGRES_URI
# sslmode=disable 表示本机连接不启用 SSL
# connect_timeout=5 表示 5 秒连不上就报错，避免无响应
DB_URI = os.getenv(
    "POSTGRES_URI",
    "postgresql://postgres:postgres@localhost:5432/langrag"
    "?sslmode=disable&connect_timeout=5",
)


# 只读工具：不需要审批
@tool
def lookup_policy(topic: str) -> str:
    """查询制度（只读，可自动执行）。"""
    return "对外发信需主管审批。"


# 有副作用的工具：必须审批
@tool
def send_email(to: str, subject: str) -> str:
    """发送电子邮件（有副作用，需人工审批）。"""
    print("真正执行send_email")
    print(f"已发送至 {to}，主题：{subject}。")
    # 真实场景这里会调用邮件服务
    return f"已发送至 {to}，主题：{subject}。"


# PostgresSaver是上下文管理器，with块结束的时候会自动归还数据库连接
with PostgresSaver.from_conn_string(DB_URI) as checkpointer:
    # 首次运行时会在数据里创建checkpointer相关的表
    # 这个方法可以重复调用，已经存在的表不会被重复创建
    checkpointer.setup()
    # 创建 Agent
    agent = create_agent(
        # 模型标识
        model="deepseek:deepseek-v4-flash",
        # 一个只读工具 + 一个危险工具
        tools=[lookup_policy, send_email],
        # 暂停期间状态要存下来，否则后面无法resume进行恢复
        checkpointer=checkpointer,
        middleware=[
            HumanInTheLoopMiddleware(
                interrupt_on={
                    # 配置发邮件的工具，打断，并且声明允许哪些地决策
                    "send_email": {
                        "allowed_decisions": ["approve", "edit", "reject", "respond"]
                    },
                    # 如果给工具配置False，则意味着不打断，不需要审核，自动执行
                    "lookup_policy": False,
                },
                # 审批说明的前缀，一般要改为中文方便用户或者说人类审核
                description_prefix="工具执行待审批:",
            )
        ],
        system_prompt="你是办公助手，问制度用lookup_policy,发邮件必须调用send_email，不要假装已经发送",
    )
    # 配置字典，通过thread_id固定这段会话
    config = {"configurable": {"thread_id": "hitl_thread_2"}}

    agent_init_state = {
        "messages": [
            {
                "role": "user",
                "content": "给 bob@example.com 发一封主题名为 [周会提醒] 的邮件",  # 用户请求给bob发邮件
            }
        ]
    }
    paused = agent.invoke(agent_init_state, config=config, version="v2")  # type: ignore
    print("是否打断", bool(paused.interrupts))
    if paused.interrupts:
        print("待审批:", paused.interrupts[0].value)
