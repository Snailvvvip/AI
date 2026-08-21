from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.messages import HumanMessage, AIMessage
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)
prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", "将情感分类为：正面/负面/中性。只输出标签"),
        ("human", "今天天气真好，心情不错"),
        ("ai", "正面"),
        ("human", "快递又丢了，太糟心了"),
        ("ai", "负面"),
        ("human", "{text}"),
    ]
)
# prompt = prompt_template.format(text="这部电影不好不坏，一般般")
# print(prompt)
model = init_chat_model("deepseek:deepseek-v4-flash", temperature=0.2)
# ai = model.invoke(prompt)
# print(ai.content)

chain = prompt_template | model
ai = chain.invoke({"text": "这部电影不好不坏，一般般"})
print(ai.content)
