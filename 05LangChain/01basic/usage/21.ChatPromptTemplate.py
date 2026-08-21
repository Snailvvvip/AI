from langchain_core.prompts import ChatPromptTemplate
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)
# 用消息列表创建聊天提示词模板，每条消息可包含待填充的变量
chat_prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", "你一个乐于助人的助手，名字叫{name},回答要简短"),
        ("human", "你好"),
        ("ai", "你好，我是{name},有什么可以帮助你"),
        ("human", "{user_input}"),
    ]
)
# 将name与user_input填入模板，得到完整的消息列表对象
messages = chat_prompt_template.format_messages(name="小助", user_input="你叫什么名字?")
print(messages)
model = init_chat_model("deepseek:deepseek-v4-flash", temperature=0.2)
result = model.invoke(messages)
print(result.content)
