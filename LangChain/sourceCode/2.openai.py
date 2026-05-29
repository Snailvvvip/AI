# from langchain_openai import ChatOpenAI

from smartchain.chat_models import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()
llm = ChatOpenAI(model="gpt-4o", temperature=0.5)
result = llm.stream("你好，你是谁？", temperature=0.8)
for token in result:
    print(token.content, end="", flush=True)
