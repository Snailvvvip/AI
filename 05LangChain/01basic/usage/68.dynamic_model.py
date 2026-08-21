# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model

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


@tool
def calculate(a: float, b: float) -> str:
    """计算 a+b。"""
    # 返回字符串，保持工具返回类型一致
    return str(a + b)


# 默认模型
fast_model = init_chat_model(
    "deepseek:deepseek-v4-flash",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
# 更强大的更升级模型
careful_model = init_chat_model(
    "deepseek:deepseek-v4-pro",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)


picked = []


# 用列表记录每次实际选中的模型
@wrap_model_call
def pick_model(request: ModelRequest, handler):
    """当消息变长的时候切换到careful_model"""
    # 获取当前状态中的消息长度
    n = len(request.state.get("messages", []))
    # 判断应该使用哪个模型
    model = careful_model if n > 6 else fast_model
    picked.append((n, getattr(model, "model_name", "?")))  # type: ignore
    return handler(request.override(model=model))


agent = create_agent(
    # 模型标识
    model=fast_model,
    # 注意：这里只有 get_weather；calculate_tip 靠 middleware 动态挂上
    tools=[calculate],
    middleware=[pick_model],
    system_prompt=("你是一个计算助手，加减法请调用calculate工具"),
)

# 场景一：短对话，应留在快模型
result = agent.invoke({"messages": [{"role": "user", "content": "17+25 等于多少？"}]})
print(picked)
print("回答", result["messages"][-1].content)


long_msgs = []
for i in range(4):
    long_msgs.append({"role": "user", "content": f"第{i}个问题"})
    long_msgs.append({"role": "assistant", "content": f"第{i}个问题"})
result = agent.invoke({"messages": long_msgs})
print(picked)
print("回答", result["messages"][-1].content)
