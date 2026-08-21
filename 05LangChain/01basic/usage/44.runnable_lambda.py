from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.chat_models import init_chat_model
from langchain_core.runnables import RunnableLambda
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)


# 普通函数，清洗用户的输入，去空白字符，截断过长的文本
def clean_text(data: dict) -> dict:
    text = str(data["text"]).strip()
    data = {**data, "text": text[:200]}
    print(data)
    return data


prompt = ChatPromptTemplate.from_messages(
    [("system", "用一句话总结用户内容，使用中文"), ("human", "{text}")]
)
model = init_chat_model(
    "deepseek:deepseek-v4-flash",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
# chain1 = clean_text | prompt | model | StrOutputParser()
# chain2 = RunnableLambda(clean_text) | prompt | model | StrOutputParser()
# result = chain.invoke({"text": "   LangChain 把组件变成可组件的 Runnable    "})
# print(result)
# 传普通函数的话，内部会自动包装成RunnableLambda
c1 = RunnableLambda(lambda x: x) | (lambda s: f"[{s}]")
print(type(c1).__name__)
print(c1.steps)
print(type(c1.steps[1]).__name__)
print(c1.invoke("hello"))
c2 = (lambda x: x) | RunnableLambda(lambda s: f"[{s}]")
print(type(c2).__name__)
print(c2.steps)
print(type(c2.steps[0]).__name__)
print(c2.invoke("hello"))
