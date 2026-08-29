# 指定 Python 解释器路径
#!/usr/bin/env python3
# 文件文档字符串，说明功能
"""Tool Calls 最小示例：DeepSeek + 天气/时间工具。"""

# 导入 json 模块，用于处理 JSON 数据
import json

# 导入 os 模块，用于操作环境变量和文件
import os

# 导入 sys 模块，用于操作系统交互
import sys

# 导入 datetime、timedelta、timezone 类，用于处理时间和时区
from datetime import datetime, timedelta, timezone

# 从 dotenv 模块导入 load_dotenv，用于加载环境变量
from dotenv import load_dotenv

# 从 openai 模块导入 OpenAI 类
from openai import OpenAI

# 加载 .env 文件中的环境变量（覆盖已有变量）
load_dotenv(override=True)

# 创建 OpenAI 客户端对象，使用环境变量中的 API_KEY 和 BASE_URL
client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
    base_url=os.getenv("OPENAI_BASE_URL"),
)
# 获取模型 ID
MODEL = os.environ["MODEL_ID"]

messages = [
    {"role": "system", "content": "你是一个非常有能力助手"},
    {"role": "user", "content": "北京和上海今天的天气是什么？"},
    {
        "role": "assistant",
        "tool_calls": [
            {"tool_call_id": "1", "content": "调用工具获取北京的天气"},
            {"tool_call_id": "2", "content": "调用工具获取上海的天气"},
        ],
    },
    {"role": "tool", "tool_call_id": "3", "content": "北京今天的天气晴朗"},
    {"role": "tool", "tool_call_id": "4", "content": "上海今天的下雨"},
]

try:
    # 调用 OpenAI 接口获得初步 assistant 消息，可包含 tool_calls
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
    )
except Exception as e:
    print(e)
