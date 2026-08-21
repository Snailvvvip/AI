from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from langchain.tools import tool
from rich import print
from langchain.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
import os

load_dotenv(override=True)


@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气信息"""
    return f"{city} 今天晴，气温25度"


model = init_chat_model("deepseek:deepseek-v4-flash")
model_with_tools = model.bind_tools([get_weather])
messages = [HumanMessage("北京今天的天气怎么样？")]
# 1.调用绑定工具的模型，模型可能会返回tool_calls
ai = model_with_tools.invoke(messages)
# 将模型的回复(可能包含工具调用请求)追加到消息列表中
messages.append(ai)  # type: ignore
print(ai.tool_calls)
for call in ai.tool_calls:
    # 使用工具调用中携带的参数执行 get_weather工具
    result = get_weather.invoke(call["args"])
    # 创建工具消息对象，用于把工具执行结果回传给模型
    messages.append(
        ToolMessage(content=str(result), tool_call_id=call["id"], name=call["name"])  # type: ignore
    )
final = model_with_tools.invoke(messages)
print(final.content)
