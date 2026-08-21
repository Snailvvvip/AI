from langchain_core.runnables import RunnableConfig
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.chat_models import init_chat_model
from langchain_core.runnables import RunnableLambda
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)


# 参数名叫config,lagnchain会依靠函数签名判断要不要注入
def clean_with_log(data: dict, config: RunnableConfig) -> dict:
    # 从config里读出调用方法传进来的标签
    tags = config.get("tags", [])
    print(f"[清洗]当前标签:{tags}")
    return {**data, "text": str(data["text"]).strip()[:200]}


prompt = ChatPromptTemplate.from_messages(
    [("system", "用一句话总结用户内容，使用中文"), ("human", "{text}")]
)
model = init_chat_model(
    "deepseek:deepseek-v4-flash",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
chain = RunnableLambda(clean_with_log) | prompt | model | StrOutputParser()
chain.invoke({"text": "一些文本"}, config={"tags": ["debug"]})
