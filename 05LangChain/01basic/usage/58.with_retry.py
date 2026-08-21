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

calls = {"n": 0}


def flaky(x):
    """模拟前两次失败，第三次成功的不稳定服务"""
    calls["n"] += 1
    if calls["n"] < 3:
        raise ValueError(f"第{calls["n"]}次失败")
    return f"第{calls["n"]}次成功"


# stop_after_attempt=4 表示最多尝试4次(包含第一次)
# robust = RunnableLambda(flaky).with_retry(
#    stop_after_attempt=4,
#    retry_if_exception_type=(TimeoutError,),
#    wait_exponential_jitter=True,
# )
# print(robust.invoke("x"))
# 主链，故意抛异常模拟服务不可用
# primary = RunnableLambda(lambda x: (_ for _ in ()).throw(ValueError("主链挂了")))
# backup = RunnableLambda(lambda x: f"备用链处理了{x}")
# chain = primary.with_fallbacks([backup])
# print(chain.invoke("订单查询"))
#
"""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "你是专业的知识问答助手"),
        ("human", "{question}"),
    ]
)

strong = init_chat_model(
    "deepseek:deepseek-v4-pro1",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
cheap = init_chat_model(
    "deepseek:deepseek-v4-flash2",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
chain = (
    (prompt | strong | StrOutputParser())
    .with_retry(stop_after_attempt=3)
    .with_fallbacks(
        [
            (prompt | cheap | StrOutputParser()).with_retry(stop_after_attempt=3),
            (RunnableLambda(lambda x: f"系统繁忙，请稍后再试")),
        ]
    )
)

print(chain.invoke({"question": "什么是Runnable?"}))
"""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "你是专业的知识问答助手"),
        ("human", "{topic}"),
    ]
)
model = init_chat_model(
    "deepseek:deepseek-v4-pro",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
chain = prompt | model | StrOutputParser()
# named = chain.with_config({"run_name": "翻译链", "tags": ["prod", "v1"]})
# print(type(named).__name__)  # RunnableBinding
# print(named.config)  # type: ignore
# print(named.invoke({"topic": "LCEL是什么？"}))


print(
    chain.invoke(
        {"topic": "LCEL是什么？"}, config={"run_name": "翻译链", "tags": ["prod", "v1"]}
    )
)
# 实一多租户 多用户
# metadata tennant_id user_id    debug.session_id debug.trace_id
# 实现  多租户 计费  用户级权限 个性化