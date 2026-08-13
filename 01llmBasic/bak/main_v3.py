import os
from openai_lite_5 import OpenAI

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY", "sk-f8c888be90e0461f8a08496f45d952b4"),
    base_url=os.getenv("OPENAI_BASE_URL", "https://api.deepseek.com"),
)
stream = client.chat.completions.create(
    model=os.getenv("OPENAI_MODEL", "deepseek-v4-pro"),
    messages=[{"role": "user", "content": "9.11和9.8哪个更大？请简要说明."}],
    stream=True,
)
phase = None  # reasoning content
for chunk in stream:
    delta = (
        getattr(chunk.choices[0], "delta", None) if getattr(chunk, "choices") else None
    )
    if not delta:
        continue
    reasoning = getattr(delta, "reasoning_content", None)
    content = getattr(delta, "content", None)
    if reasoning:
        if phase != "reasoning":
            print(f"[思考过程]", flush=True)
            phase = "reasoning"
        print(reasoning, end="", flush=True)
    elif content:
        if phase != "content":
            print()
            print("[回答]", flush=True)
            phase = "content"
        print(content, end="", flush=True)
print()
