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
translate_chain = (
    ChatPromptTemplate.from_messages(
        [
            ("system", "翻译成英文，只输出译文"),
            ("human", "{text}"),
        ]
    )
    | model
    | StrOutputParser()
)
summarize_chain = (
    ChatPromptTemplate.from_messages(
        [
            ("system", "用一句话进行总结"),
            ("human", "{text}"),
        ]
    )
    | model
    | StrOutputParser()
)
default_chain = (
    ChatPromptTemplate.from_messages(
        [
            ("system", "你是一个有用的助手，直接回答用户提问"),
            ("human", "{text}"),
        ]
    )
    | model
    | StrOutputParser()
)


def intent_is(name: str):
    # 返回判定函数，输入字典里intent是否等于指定的值
    return lambda x: x.get("intent") == name


# 按输入字典中的intent进行路由，最后一项是默认链
router = RunnableBranch(
    (intent_is("translate"), translate_chain),
    (intent_is("summarize"), summarize_chain),
    # TypeError: RunnableBranch default must be Runnable, callable or mapping.
    default_chain,
)
print(router.invoke({"intent": "translate", "text": "统一接口让组合更简单"}))
print(router.invoke({"intent": "summarize", "text": "统一接口让组合更简单"}))
print(router.invoke({"intent": "chat", "text": "统一接口让组合更简单"}))


def route(x):
    intent = x.get("intent")
    if intent == "translate":
        return translate_chain
    elif intent == "summarize":
        return summarize_chain
    else:
        return default_chain


router = RunnableLambda(route)
print(router.invoke({"intent": "translate", "text": "统一接口让组合更简单"}))
print(router.invoke({"intent": "summarize", "text": "统一接口让组合更简单"}))
print(router.invoke({"intent": "chat", "text": "统一接口让组合更简单"}))
