import time
from langchain_core.runnables import RunnableConfig
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.chat_models import init_chat_model
import time
from langchain_core.runnables import (
    RunnableLambda,
    RunnablePassthrough,
    RunnableParallel,
    RunnableBranch,
    RunnableGenerator,
)
from dotenv import load_dotenv
from rich import print
from langchain_core.runnables import chain

load_dotenv(override=True)


prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "用四个字概括，不要标点以外的解释。"),
        ("human", "{text}"),
    ]
)
model = init_chat_model("deepseek:deepseek-v4-flash", temperature=0)
chain = prompt | model | StrOutputParser()
# t0 = time.perf_counter()
# outputs = chain.batch(
#    [
#        {"text": "春天播种希望"},
#        {"text": "夏天热情似火"},
#        {"text": "秋天收获满满"},
#    ],
#    config={"max_concurrency": 3},
# )
# for o in outputs:
#    print(o)
# print(time.perf_counter() - t0)


import time

from langchain_core.runnables import RunnableLambda

# def slow_fn(x):
#    time.sleep(1)
#    return x
#
#
# r = RunnableLambda(slow_fn)
# for mc in [1, 5]:
#    t0 = time.perf_counter()
#    r.batch(list(range(5)), config={"max_concurrency": mc})
#    print(f"max_concurrency={mc}: 耗时 {time.perf_counter() - t0:.2f}s")


def maybe_fail(x):
    if x == "bad":
        raise ValueError(f"处理 {x} 失败")
    return f"ok-{x}"


r = RunnableLambda(maybe_fail)
# ValueError: 处理 bad 失败
# 批处理中只有要有一个失败，整体就失败了，这个特性和RunnableParallel是一样Promise.all
# return_exceptions参数的作用是让异常作为失败的结果放在对应的位置
print(r.batch(["a", "bad", "c"], return_exceptions=True))
