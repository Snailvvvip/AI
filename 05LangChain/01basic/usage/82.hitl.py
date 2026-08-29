# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent

# 导入人机协同中间件
from langchain.agents.middleware import HumanInTheLoopMiddleware

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool

# HITL 必须配 checkpointer，这里用最简单的内存实现
from langgraph.checkpoint.memory import InMemorySaver

# Command 用于第二跳恢复执行
from langgraph.types import Command
from rich import print

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 加载 .env 中的 API key
load_dotenv(override=True)


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


# 创建 Agent
agent = create_agent(
    # 模型标识
    model="deepseek:deepseek-v4-flash",
    # 一个只读工具 + 一个危险工具
    tools=[lookup_policy, send_email],
    # 暂停期间状态要存下来，否则后面无法resume进行恢复
    checkpointer=InMemorySaver(),
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
config = {"configurable": {"thread_id": "hitl_thread_1"}}

agent_init_state = {
    "messages": [
        {
            "role": "user",
            "content": "给 bob@example.com 发一封主题名为 [周会提醒] 的邮件",  # 用户请求给bob发邮件
        }
    ]
}
# 第一次或者说第一跳 当执行到send_email的时候会暂停pause
paused = agent.invoke(agent_init_state, config=config, version="v2")  # type: ignore
print("是否打断", bool(paused.interrupts))
if paused.interrupts:
    print("待审批:", paused.interrupts[0].value)
# print(paused.interrupts)
# print(paused.value)
# 第二次调用，传递的是控制指令Command ，而不是消息字典
name = paused.interrupts[0].value["action_requests"][0]["name"]
args = paused.interrupts[0].value["action_requests"][0]["args"]
print(args, type(args))
final = agent.invoke(
    # 创建一个控制指令指令 对象实例
    # resume的内容是一个包含decisions列表的的字
    Command(
        resume={
            "decisions": [
                {
                    "type": "edit",
                    "edited_action": {
                        "name": name,
                        "args": {**args, "subject": "[月会提醒]"},
                    },
                }
            ]
        }
    ),
    # 必须与第一次传相同thread_id
    config=config,  # type: ignore
    version="v2",
)  # type: ignore

payload = final.value if hasattr(final, "value") else final
messages = payload["messages"]
print("最终的回复", messages[-1].content)


# 打断和恢复是通过上下文快照实现的 核心步骤

# 1. 暂停 执行到中断的工具，保存完整的状态快照
paused = agent.invoke(init_state, config)  # type: ignore
# 内部在执行到send_email这个工具的时候
#   - 1.保存当前的消息历史，工具参数，执行栈到checkpointer
#   - 2.抛出中断，返回interrupts
# 2.恢复 从快照中恢复 ，注入用户决策
final = agent.invoke(
    Command(resume={}),  # 携带的人工决策
    config,  # 这里会传入相同的thread_id # type: ignore
)
# 3.内部
#  - 从checkpointerr通过thread_id加载状态快照，
#  - 根据决策(approve/reject/edit/response)继续执行

# 4.继续执行 工具执行后，继续Agent循环
#   - approve 执行send_email
#   - edit 修改参数后执行
#   - reject  跳过工具，返回拒绝消息

# 快照里包含什么？
# - 消息历史 messages 恢复对话上下文
# - 当前的状态 channel 用来恢复执行位置
# - 待执行的工具调用 用来知道从哪继续执行工具调用
# -  图节点位置 用来恢复 执行流程

# 总结: 第二跳不是简单重执行，而是从断点位置精确恢复状态机
