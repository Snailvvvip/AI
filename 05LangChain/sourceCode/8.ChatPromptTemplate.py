# from langchain_openai import ChatOpenAI
# from langchain_core.prompts import (
#    ChatPromptTemplate,
#    SystemMessagePromptTemplate,
#    HumanMessagePromptTemplate,
#    AIMessagePromptTemplate,
# )

from smartchain.chat_models import ChatOpenAI
from smartchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    AIMessagePromptTemplate,
)

llm = ChatOpenAI()

template = ChatPromptTemplate.from_messages(
    [
        SystemMessagePromptTemplate.from_template(
            "你是一个乐于助人的AI助手，你的名字叫{name}"
        ),
        HumanMessagePromptTemplate.from_template("你好，你最近怎么样?"),
        AIMessagePromptTemplate.from_template("我很好，谢谢你的关心"),
        HumanMessagePromptTemplate.from_template("{user_input}"),
    ]
)
prompt_messages = template.format_messages(name="小助", user_input="你叫什么名字?")
print(prompt_messages)
result = llm.invoke(prompt_messages)
print(result.content)
