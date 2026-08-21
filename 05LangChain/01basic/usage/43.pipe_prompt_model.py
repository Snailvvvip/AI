from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)

prompt = ChatPromptTemplate.from_messages(
    [("system", "把用户句子翻译成{target_lang},只输出译文"), ("human", "{text}")]
)
model = init_chat_model(
    "deepseek:deepseek-v4-flash",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
chain = prompt | model | StrOutputParser()
# print(chain)
# result = chain.invoke({"target_lang": "英文", "text": "生活不止眼前的代码"})
# print(result)
# 把AIMessage当成字符串使用
bad = prompt | model
result = bad.invoke({"text": "生活不止眼前的代码"})
#Input to ChatPromptTemplate is missing variables {'target_lang'}.
print(result)  # AIMessage
