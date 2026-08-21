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


# 计时流式输出 对langchain的stream方法逐块计时，记录每个数据块到达的时间戳(相对于起点)
def timed_stream(chain, input, label):
    # 流开始的时间 基准点
    t0 = time.perf_counter()
    times = []
    for chunk in chain.stream(input):
        print(chunk, end="", flush=True)
        # 每次迭代的时候记录当前时间-t0就是每个chunk 累计耗时
        times.append(time.perf_counter() - t0)
    # times列表的长度就等于chunk的数量
    print(f"{label}")
    print(f"chunk数:{len(times)}")
    print(f"首个chunk到达:{times[0]:.2f}s")
    print(f"全部完成:{times[-1]:.2f}s")


# 构建 prompt、model 和 chain
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "用三句话介绍主题，使用中文。"),
        ("human", "{topic}"),
    ]
)
model = init_chat_model("deepseek:deepseek-v4-flash", temperature=0.3)


# 写成一个生成器函数，让函数接受迭代器，逐块yield
def upper_gen(chunks):
    for c in chunks:
        yield c.upper()


def normal_upper(chunks):
    return chunks.upper()


chain = prompt | model | StrOutputParser() | RunnableGenerator(upper_gen)
# normal_upper自动转成 RunnableLambda(normal_upper)
# upper_gen 会自动转成 RunnableGenerator
# for step in chain.steps:  # type: ignore
#    print(step)
# 可以用普通函数，但是没有流式效果
# 可以使用普通生成器函数，有流式效果
# 也可以使用RunnableGenerator包装upper_gen，有流式效果
# 但是不能用RunnableLambda包装upper_gen,没有流式效果的

# timed_stream(chain, {"topic": "LCEL"}, "prompt | model | StrOutputParser")


c4 = RunnableLambda(lambda d: d) | prompt | model | StrOutputParser()
timed_stream(c4, {"topic": "LCEL"}, "RunnableLambda | prompt | model | parser")
