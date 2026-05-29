# from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from smartchain.runnables import RunnableLambda, RunnablePassthrough


def process_text(text):
    return text.upper()


process_runnable = RunnableLambda(process_text)
runnablePassthrough = RunnablePassthrough()
result = runnablePassthrough.invoke("test")
print(f"输出:{result}")
result = runnablePassthrough.batch(["a", "b", "c"])
print(f"输出:{result}")
for chunk in runnablePassthrough.stream("stream"):
    print(chunk)
chain = runnablePassthrough | process_runnable
result = chain.invoke("hello")
print(f"输出:{result}")
