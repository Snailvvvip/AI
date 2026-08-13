import os
from openai_lite_5 import OpenAI

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY", "sk-f8c888be90e0461f8a08496f45d952b4"),
    base_url=os.getenv("OPENAI_BASE_URL", "https://api.deepseek.com"),
)
result = client.chat.completions.create(
    model=os.getenv("OPENAI_MODEL", "deepseek-v4-pro"),
    messages=[{"role": "user", "content": "你是谁?"}],
)
answer = result.choices[0].message.content
print("answer", answer)
