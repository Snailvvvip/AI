# from langchain_deepseek import ChatDeepSeek
from dotenv import load_dotenv
from smartchain.chat_models import ChatDeepSeek

load_dotenv()
llm = ChatDeepSeek(model="deepseek-chat")
result = llm.invoke("你好，你是谁？", temperature=0.8)
# <class 'langchain_core.messages.ai.AIMessage'>
print(result, type(result))
print(result.content)
