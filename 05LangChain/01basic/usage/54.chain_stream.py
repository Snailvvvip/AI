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
)
from dotenv import load_dotenv
from rich import print
from langchain_core.runnables import chain

load_dotenv(override=True)
model = init_chat_model(
    "deepseek:deepseek-v4-flash",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
prompt = ChatPromptTemplate.from_messages(
    [("system", "用三句话介绍主题"), ("user", "{topic}")]
)
chain = prompt | model | StrOutputParser()
# 流式输出最终是由链条最右边的的Runnable决定的
# StrOutputParser是末端的Runnable,，chunk就是字符串增量
# for chunk in chain.stream({"topic": "Runnable"}):
#    print(chunk, end="", flush=True)

# model流式输出的是AIMessageChunk
# AIMessageChunk(content='可以',
for chunk in model.stream("介绍一下Runnable"):
    # print(chunk)
    print(chunk.content, end="", flush=True)
