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
config1 = {"configurable": {"thread_id": "hitl_thread_1"}}

agent_init_state = {
    "messages": [
        {
            "role": "user",
            "content": "给 bob@example.com 发一封主题名为 [周会提醒] 的邮件",  # 用户请求给bob发邮件
        }
    ]
}
# 第一次或者说第一跳 当执行到send_email的时候会暂停pause
paused = agent.invoke(agent_init_state, config=config1, version="v2")  # type: ignore
print("是否打断", bool(paused.interrupts))
if paused.interrupts:
    print("待审批:", paused.interrupts[0].value)
# print(paused.interrupts)
# print(paused.value)
# 第二次调用，传递的是控制指令Command ，而不是消息字典
name = paused.interrupts[0].value["action_requests"][0]["name"]
original_args = paused.interrupts[0].value["action_requests"][0]["args"]
print("original_args ", original_args)
# 基于原参数复制一份再改，保证字段完整（** 展开原字典，后面的键覆盖同名项）
# edited_args = {**original_args, "to": "dave@example.com"}
# RuntimeError: Cannot use Command(resume=...) without checkpointer
config2 = {"configurable": {"thread_id": "hitl_thread_2"}}
# 恢复之前，先确认这人hitl_thread_2上有没有待审批的动作
snapshot = agent.get_state(config2)  # type: ignore
# 如果next非空说明图确实停在了某个节点上等待恢复
if not snapshot.next:
    raise RuntimeError(
        f"thread {config2["configurable"]["thread_id"]} 没有待恢复的中断，拒绝resume"
    )

final = agent.invoke(
    # 创建一个控制指令指令 对象实例
    # resume的内容是一个包含decisions列表的的字
    Command(
        resume={
            "decisions": [
                {
                    "type": "approve",
                    # "edited_action": {
                    #    "name": name,
                    #    "args": edited_args,
                    # },
                }
            ]
        }
    ),
    # 必须与第一次传相同thread_id
    config=config2,  # type: ignore
    version="v2",
)  # type: ignore

payload = final.value if hasattr(final, "value") else final
messages = payload["messages"]
print("最终的回复", messages[-1].content)
