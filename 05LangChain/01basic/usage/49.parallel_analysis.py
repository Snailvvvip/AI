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
model = init_chat_model(
    "deepseek:deepseek-v4-flash",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
# 支路 1：摘要
summary_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "用一句话总结，不要举例。"),
        ("human", "{text}"),
    ]
)
summary_chain = summary_prompt | model | StrOutputParser()

# 支路 2：关键词
keywords_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "提取 3 个中文关键词，用逗号分隔，不要其它文字。"),
        ("human", "{text}"),
    ]
)
keywords_chain = keywords_prompt | model | StrOutputParser()

parallel = RunnableParallel(summary=summary_chain, keywords=keywords_chain)
result = parallel.invoke(
    {
        "text": "Runnable让提示词、模型、解析器可以以管道的方式组合，并统一支持流式与批量调用"
    }
)
print(result)
