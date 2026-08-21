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


def slow(name, sec):
    """构建一个耗时的sec秒的runnable"""

    def f(x):
        time.sleep(sec)
        return f"{name}-done"

    return RunnableLambda(f)


parallel = RunnableLambda(lambda x: x) | {
    "a": slow("a", 1),
    "b": slow("b", 1),
    "c": slow("c", 1),
}
parallel = (lambda x: x) | RunnableParallel(
    a=slow("a", 1),
    b=slow("b", 1),
    c=slow("c", 1),
)
parallel = (
    (lambda x: x)
    | RunnableLambda(lambda x: x)
    | {
        "a": slow("a", 1),
        "b": slow("b", 1),
        "c": slow("c", 1),
    }
)
print(parallel)
print(parallel.steps)
t0 = time.perf_counter()
print(parallel.invoke("x"))
# 最终的完成时间由耗时最长的分支决定 ，工作方式等同于Promise.all
print(f"并行耗时:{time.perf_counter()-t0:.2f}")
