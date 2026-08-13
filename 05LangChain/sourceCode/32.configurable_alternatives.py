# from langchain_openai import ChatOpenAI
# from langchain_deepseek import ChatDeepSeek
# from langchain_core.runnables import ConfigurableField

from smartchain.chat_models import ChatOpenAI, ChatDeepSeek
from smartchain.runnables import ConfigurableField

llm = ChatOpenAI(model="gpt-4o", temperature=0).configurable_alternatives(
    ConfigurableField(
        id="provider", name="LLM提供商", description="在OpenAI和DeepSeek之间进行切换"
    ),
    default_key="openai",
    openai=ChatOpenAI(model="gpt-4o", temperature=0),
    deepseek=ChatDeepSeek(
        model="deepseek-chat",
        temperature=0,
        api_key="sk-bb99cf132b184a169b5e053b346a7c25",
    ),
)
result1 = llm.invoke("你是哪个公司开发的?")
print(result1)

result2 = llm.invoke(
    "你是哪个公司开发的?", config={"configurable": {"provider": "deepseek"}}
)
print(result2)
