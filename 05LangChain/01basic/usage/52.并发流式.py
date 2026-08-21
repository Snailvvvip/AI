from langchain_core.runnables import RunnableConfig
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.chat_models import init_chat_model
import time
from langchain_core.runnables import (
    RunnableLambda,
    RunnablePassthrough,
    RunnableParallel,
)
from dotenv import load_dotenv
from rich import print
from langchain_core.runnables import chain

load_dotenv(override=True)


def slow_char_stream(input_data):
    text = input_data["text"]
    acc = ""
    for c in text:
        time.sleep(0.5)
        acc += c
        yield acc


# 并行分支，a 和b 都处理同一个输入，但结果叠加交错
runnable_a = RunnableLambda(slow_char_stream)
runnable_b = RunnableLambda(slow_char_stream)
parallel = RunnableParallel({"a": runnable_a, "b": runnable_b})
result_acc = {"a": "", "b": ""}
# 在消费端要注意，每个chunk只带一部分数据，而不是完整并行结果
for chunk in parallel.stream({"text": "hello"}):
    # print(chunk)
    result_acc = {**result_acc, **chunk}
print(result_acc)
