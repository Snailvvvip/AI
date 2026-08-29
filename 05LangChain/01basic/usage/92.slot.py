from typing import NotRequired
from langchain.agents import AgentState
from langchain.agents import create_agent
from langgraph.runtime import Runtime
from langchain.agents.middleware import before_model, dynamic_prompt, ModelRequest
import re
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph.message import REMOVE_ALL_MESSAGES, RemoveMessage

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv
from langchain.tools import ToolRuntime, tool
from langgraph.types import Command
from langchain.messages import ToolMessage

# 加载 .env 中的 API key
load_dotenv(override=True)


# 1.定义槽位，自定义状态
class CustomerState(AgentState):
    # 顾客姓名 会话刚开始的时候还不知道顾客的姓名，所以这个字段是非必填项
    customer_name: NotRequired[str]
    # 订单ID 当前顾客正在咨询的订单号
    order_id: NotRequired[str]
    products: list


# 匹配「我叫」后面 2~4 个汉字
NAME_RE = re.compile(r"我叫([\u4e00-\u9fa5]{2,4})")
# 匹配一个大写字母 + 4 位数字，如 A1002
ORDER_RE = re.compile(r"([A-Z]\d{4})")


@tool
def lookup_order(runtime: ToolRuntime) -> str:
    "查询订单的状态"
    state = runtime.state
    order_id = state.get("order_id")
    return f"订单{order_id}状态为已经发货"


@tool
def remember_order(order_id: str, runtime: ToolRuntime):
    """把用户当前的咨询的订单记入会话槽位，订单号形如A0001"""
    key = order_id.strip().upper()
    # 返回是一个命令Command 能同时更新order_id和工具消息
    return Command(
        update={
            # 把订单号写入槽位
            "order_id": key,
            # 必须补上与此次tool_call配对的ToolMessage
            "messages": [
                # tool_call_id从runtime里取，用来和模型的调用请求配对
                ToolMessage(f"已经记住了订单{key}", tool_call_id=runtime.tool_call_id)
            ],
        }
    )


@before_model
def extract_slots(state: CustomerState, runtime: Runtime):
    """把姓名/订单号抽取进槽位，保证后续即使消息裁剪后也不会丢掉"""
    # 获取最近一条消息(本轮用户的输入)
    last_message = state["messages"][-1]
    # 这是获取此消息对应的文本
    content = last_message.content if isinstance(last_message.content, str) else ""
    # 收集本轮需要更新槽位
    update = {}
    # 姓名只认第一次，避免后面闲聊的时候把姓名改掉
    if not state.get("customer_name"):
        # := 海象运算符，匹配成功就把结果赋值给m
        if m := NAME_RE.search(content):
            update["customer_name"] = m.group(1)
    if m := ORDER_RE.search(content):
        update["order_id"] = m.group(1)
    # 返回None表示这一轮没有更新的槽位
    return update or None


@before_model
def trim_history(state: CustomerState, runtime: Runtime):
    messages = state["messages"]
    if len(messages) <= 2:
        # 如果返回None，表示继续正常调用大模型
        return None
    # 如果消息的数量大于2条的话，清空消息列表后，保留最后的2条消息
    # 返回的是更新内容，是合并进state而不是替换，但要注意合并是浅合并，且数组会覆盖，除非特殊处理
    # 比如messages是特殊处理过，可以实现合并消息列表
    return {"messages": [RemoveMessage(id=REMOVE_ALL_MESSAGES), *messages[-2:]]}


@dynamic_prompt
def prompt_with_slots(request: ModelRequest):
    state = request.state
    lines = ["你是客服助手，回答要简短，如果用户要查订单状态要使用工具 lookup_order"]
    if customer_name := state.get("customer_name"):
        lines.append(f"当前用户姓名是:{customer_name}")
    if order_id := state.get("order_id"):
        lines.append(f"当前的订单号:{order_id}")
    return "\n".join(lines)


# 2.在创建智能体的时候指定state_schema
agent = create_agent(
    # 模型标识
    model="deepseek:deepseek-v4-flash",
    # 工具列表 把写槽位的工具挂上
    tools=[remember_order],
    # 关键： 把默认的AgentState扩展为CustomerState之后，要传给state_schema
    state_schema=CustomerState,
    # 顺序一定要正确，先抽取槽位，再裁剪，再读取槽位位置写入系统提示词
    middleware=[extract_slots, trim_history, prompt_with_slots],  # type: ignore
    # 检查点
    checkpointer=InMemorySaver(),
)  # type: ignore
# 3.写入槽位
config = {"configurable": {"thread_id": "slot-thread-1"}}
# 4.前四轮 姓名在第一轮的时候说出，订单号在第二说出，之后聊一些别的内容把这些消息挤出窗口之外，最后再问一下姓名和订单号
for text in ["我叫小陈", "帮我看看订单A1002", "今天天气不错", "顺便问一下退货的政策"]:
    agent.invoke({"messages": [{"role": "user", "content": text}]}, config=config)  # type: ignore

result = agent.invoke(
    {"messages": [{"role": "user", "content": "查一下我的订单现在状态是什么？"}]},
    config=config,  # type: ignore
)
print("最终回答", result["messages"][-1].content)
snapshot = agent.get_state(config)  # type: ignore
print(snapshot.values, type(snapshot.values))
print("最终的message条数", len(snapshot.values["messages"]))
print("槽位里的顾客姓名", snapshot.values.get("customer_name"))  # type: ignore
print("槽位里的订单号", snapshot.values.get("order_id"))  # type: ignore
