# from langchain_openai import ChatOpenAI

from smartchain.chat_models import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()
llm = ChatOpenAI(model="gpt-4o", temperature=0.5)
result = llm.invoke("你好，你是谁？", temperature=0.8)
# <class 'langchain_core.messages.ai.AIMessage'>
print(result, type(result))
print(result.content)
