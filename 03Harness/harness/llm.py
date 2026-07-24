from config import client
from tools.schema import TOOLS


# 定义调用大模型的函数
# system 系统提示词 messages消息列表，里面现在只有用户消息 max_tokens最大token数 model模型名称
def call_llm(system: str, messages: list, max_tokens: int, model: str):
    return client.chat.completions.create(
        model=model,
        # 将系统提示消息和原来的消息列表组成messages
        messages=[{"role": "system", "content": system}, *messages],
        tools=TOOLS,  # type: ignore
        max_tokens=max_tokens,
    )


def is_prompt_too_long_error(e: Exception):
    msg = str(e).lower()
    return (
        ("prompt" in msg and "long" in msg)
        or "prompt_is_too_long" in msg
        or "context_length_exceeded" in msg
        or "max_context_window" in msg
        or "contxt_length" in msg
        or "maximum content" in msg
    )
