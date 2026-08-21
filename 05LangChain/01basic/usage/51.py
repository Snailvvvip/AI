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


def count_length(text):
    time.sleep(0.1)
    return len(text)


def summary(d):
    raise RuntimeError("模拟失败")
    return d["text"][:20] if "text" in d else ""


summary_chain = RunnableLambda(summary)

parallel = RunnableParallel(
    summary=summary_chain, length=RunnableLambda(lambda d: d["text"]) | count_length  # type: ignore
)
result = parallel.invoke({"text": "Runnable"})
print(result)
