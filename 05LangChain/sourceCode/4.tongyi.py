from langchain_community.chat_models.tongyi import ChatTongyi

# from smartchain.chat_models import ChatTongyi

llm = ChatTongyi(model="qwen-max", api_key="sk-cc2054c29cf54fec92503bf7016cf383")
result = llm.invoke("你好，你是谁？", temperature=0.8)
# <class 'langchain_core.messages.ai.AIMessage'>
print(result, type(result))
print(result.content)
