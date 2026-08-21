from langchain.chat_models import init_chat_model
from dotenv import load_dotenv

# from rich import print
import os

load_dotenv(override=True)
model = init_chat_model("deepseek:deepseek-v4-flash")
texts = [
    "用四个字概括春天",
    "用四个字概括夏天",
    "用四个字概括秋天",
    "用四个字概括冬天",
]
# 批量并发调用模型，同时处理多条提示词并收集响应
# 通过config设置最大并发数为4，加快批量请求速度
responses = model.batch(texts, config={"max_concurrency": 4})  # type: ignore
for r in responses:
    print(r.content)

# 批量并发调用模型，同时处理多条提示词并进行收集响应，，按完成顺序产出，谁先完成谁先返回
# 返回responses是一个元组列表 (索引，消息)
responses = model.batch_as_completed(texts, config={"max_concurrency": 4})
for index, r in responses:
    print(index, r.content)
