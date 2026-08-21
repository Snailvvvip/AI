from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
from langchain.messages import HumanMessage, AIMessage
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)

base_template = ChatPromptTemplate.from_messages(
    [("system", "你是{role},面向用户{user_name},回答要短"), ("human", "{question}")]
)
# 预填入角色和用户名，只剩下question需要提供了
prompt_template = base_template.partial(role="售后顾问", user_name="王先生")
prompt = prompt_template.format(question="订单两天了还没有发货，怎么办?")
print(prompt)
model = init_chat_model("deepseek:deepseek-v4-flash", temperature=0.2)
ai = model.invoke(prompt)
print(ai.content)
