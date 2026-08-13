import json
import os
import requests

api_key = os.getenv("OPENAI_API_KEY", "sk-f8c888be90e0461f8a08496f45d952b4")
if not api_key:
    print(f"请先设置环境变量 OPENAI_API_KEY")
    raise SystemExit(1)

base_url = os.getenv("OPENAI_BASE_URL", "https://api.deepseek.com")
api_url = f"{base_url.rstrip('/')}/v1/chat/completions"
headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
model_name = os.getenv("OPENAI_MODEL", "deepseek-v4-pro")
messages = [
    {
        "role": "system",
        "content": "你是一位资深的旅游顾问，擅长为不同的需求的客户规划个性化的行程",
    },
    {
        "role": "user",
        "content": "你是一名资深健身教练（角色），为办公室人群制定一套居家减脂锻炼计划（任务），要求输出为 7 天锻炼表，每天 30 分钟，适合零基础（要求），需注明每个动作的名字和建议次数（细节）。",
    },
]


def ask_chat(messages):
    data = {"model": "deepseek-v4-flash", "messages": messages}
    response = requests.post(api_url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()


response = ask_chat(messages)
answer = response["choices"][0]["message"]["content"]
print(answer)
"""
few_shot_prompt = ""你是一位情感分析助手。
请判断下列句子的情感（积极/消极/中性），只输出情感类别。

示例：
输入：这个产品非常好用！
输出：积极

输入：客服回应很慢。
输出：消极

输入：天气还行。
输出：中性

请判断：
输入：今天工作顺利完成了。
输出：
""

# 链式思考（CoT）提示示例 —— 让模型逐步解题
cot_prompt = ""你是一个善于逻辑推理的助手。
请认真分析并逐步解决下面的问题，最后明确写出答案：

问题：小明有 12 个苹果，分给 3 个同学，每人分得多少个？请逐步思考，最后给出答案。
""


def ask_chat(messages):
    data = {"model": model_name, "messages": messages}
    response = requests.post(api_url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()


messages = [
    {
        "role": "user",
        "content": cot_prompt,
    },
]
response = ask_chat(messages)
answer = response["choices"][0]["message"]["content"]
print(answer)



role = "你是一位资深的旅游顾问"
task = "为一位带6岁小孩的家庭设计西安两天的旅游行程"
requirements = "输出markdown表格，每天分上午、下午。行程宽松，适合亲子"
details = "必去景点：钟楼、大雁塔、兵马俑；孩子6岁，不爱走路太久"

prompt = f""{role}
【任务】{task}
【要求】{requirements}
【细节】{details}
""
print(prompt)

system_msg = {
    "role": "system",
    "content": "你是一名专业的旅行规划专家，擅长为用户定制旅行路线和建议",
}

user_msg = {
    "role": "user",
    "content": "请帮我规划一次去北京的五日自由行路线",
}
mesasges = [system_msg, user_msg]
for msg in mesasges:
    print(f"[{msg['role']}] {msg['content']}")
"""
