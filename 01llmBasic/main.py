import os
import json
import sys
from openai_lite_5 import OpenAI

# 工具描述
TOOLS = [
    {
        "type": "function",  # 工具类型为函数
        "function": {  # 此工具详细信息
            "name": "get_weather",  # 函数的名称
            "description": "获取指定城市的当前天气",  # 函数的描述
            "parameters": {  # 函数接收的参数
                "type": "object",  # 参数是一个JSON对象
                "properties": {  # 参数的属性 属性名称city,类型是字符串，描述是指需名称
                    "city": {"type": "string", "description": "城市名称，如北京、上海"}
                },
                "required": ["city"],  # 必给的参数字段
            },
        },
    }
]


# 定义获取天气的函数
# 工具函数的实现是自己定义和提供的
def get_weather(city: str) -> str:
    return f"{city}:晴，25度，微风"


# 定义工具处理器的映射，将工具的名称映射为对应的实现函数
TOOL_HANDLERS = {"get_weather": get_weather}


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY", "sk-f8c888be90e0461f8a08496f45d952b4"),
    base_url=os.getenv("OPENAI_BASE_URL", "https://api.deepseek.com"),
)
messages = [
    {
        "role": "user",
        "content": "北京、上海和南京今天的天气如何？",
    }
]
# 发给大模型的tools(工具函数定义)会消耗Token
response = client.chat.completions.create(
    model=os.getenv("OPENAI_MODEL", "deepseek-v4-pro"), messages=messages, tools=TOOLS
)
assistant_message = response.choices[0].message
# 如果助手消息中tool_calls字段有值，说明模型想请求调用工具
if assistant_message.tool_calls:
    # 将助手消息转成字典并添加到消息列表中
    messages.append(assistant_message.model_dump())
    # 遍历所有的要调用的工具
    for tool_call in assistant_message.tool_calls:
        # 获取函数的名称
        func_name = tool_call.function.name
        # 获取函数的参数字符串，并且转为python字典
        func_args = json.loads(tool_call.function.arguments)
        print(f"[工具调用]：{func_name}({func_args})")
        # 通过函数名去TOOL_HANDLERS注册表里找到应的实际处理函数
        handler = TOOL_HANDLERS[func_name]
        # 调用实现函数获取结果
        result = handler(**func_args)
        print(f"[工具调用结果] {result}")
        # 将工具调用的结果以工具角色的消息追加到消息列表
        messages.append(
            {"role": "tool", "tool_call_id": tool_call.id, "content": result}
        )

response = client.chat.completions.create(
    model=os.getenv("OPENAI_MODEL", "deepseek-v4-pro"), messages=messages, tools=TOOLS
)
print("最终的回答：", response.choices[0].message.content)
