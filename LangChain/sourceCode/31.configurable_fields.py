# from langchain_openai import ChatOpenAI
# from langchain_core.runnables import ConfigurableField

from smartchain.chat_models import ChatOpenAI
from smartchain.runnables import ConfigurableField

llm = ChatOpenAI(model="gpt-4o", temperature=0).configurable_fields(
    temperature=ConfigurableField(
        id="temperature", name="温度值", description="LLM的温度参数，控制输出的多样性"
    )
)
# RunnableLambda().configurable_fields()

result = llm.invoke("你好，你怎么样?", config={"configurable": {"temperature": 1.0}})
print(result)
