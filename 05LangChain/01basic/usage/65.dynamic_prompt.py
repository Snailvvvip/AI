# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent
from dataclasses import dataclass

# 导入请求类型与模型调用拦截装饰器
from langchain.agents.middleware import ModelRequest, wrap_model_call, dynamic_prompt

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool
from rich import print

# 加载环境变量
load_dotenv(override=True)


# 核心目标是根据用户不同，角色不同，定制当前的系统提示词


@dataclass
class OfficeContext:
    """每次agent invoke调用的时候传入的上下文字段"""

    user_name: str = "同事"
    dept: str = "综合办"


@tool
def lookup_policy(topic: str) -> str:
    """查询公司制度摘要。"""
    return "差旅报销需在返程 7 日内提交。"


@dynamic_prompt
def office_prompt(request: ModelRequest) -> str:
    """根据当前的context上下文生成系统提示词"""
    # 从运行时句柄中取出本次传入的上下文对象 可能是None
    ctx = request.runtime.context
    user_name = getattr(ctx, "user_name", "同事")
    dept = getattr(ctx, "dept", "综合办")
    # 返回一个新的系统提示词并返回
    return (
        f"[动态系统提示词]"
        f"你是{dept}的办公助手，正在帮助{user_name}."
        f"回答简洁，问制度时调用lookup_policy工具，不要编造条文"
    )


@wrap_model_call
def capture_final(request: ModelRequest, handler):
    print(f"最终的系统提示词：{request.system_prompt}")
    return handler(request)


# 创建 Agent 并挂上观察器
agent = create_agent(
    model="deepseek:deepseek-v4-flash",
    tools=[lookup_policy],
    middleware=[office_prompt, capture_final],  # type: ignore
    system_prompt="[静态系统提示词]你是静态助手",  # 静态提示
    context_schema=OfficeContext,
)  # type: ignore
# 触发一次调用
result = agent.invoke(
    {"messages": [{"role": "user", "content": "报销流程是什么？"}]},
    contxt=OfficeContext(user_name="王敏", dept="财务部"),
)

messages = result["messages"]
for message in messages:
    pass
    # print(message)
