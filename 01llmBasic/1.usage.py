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
        "content": "我想明年春天去北京旅游，有什么推荐的景点吗",
    },
]


def ask_chat(messages):
    data = {"model": model_name, "messages": messages}
    response = requests.post(api_url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()

response1 = ask_chat(messages)
answer1 = response1["choices"][0]["message"]["content"]

messages.append({"role": "assistant", "content": answer1})
messages.append(
    {
        "role": "user",
        "content": "我比较喜欢自然风光和安静的地方，可以推荐一些特色小众目的地吗？",
    }
)
response2 = ask_chat(messages)
answer2 = response2["choices"][0]["message"]["content"]
print(answer2)

"""
data = {
    "model": model_name,
    "messages": [{"role": "user", "content": "一句话介绍自己"}],
}
response = requests.post(api_url, headers=headers, json=data)
if response.status_code != 200:
    print(f"请求失败", response.status_code, response.text)
    raise SystemExit(1)
result = response.json()
answer = result["choices"][0]["message"]["content"]
print("大模型回复:", answer)
"""
