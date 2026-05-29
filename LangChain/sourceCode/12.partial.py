# from langchain_core.prompts import PromptTemplate
# from langchain_openai import ChatOpenAI

from smartchain.prompts import PromptTemplate
from smartchain.chat_models import ChatOpenAI

template = PromptTemplate.from_template(
    "你是一个{role},用户{username}问:{question},请回答"
)
print("原始模板的输入变量", template.input_variables)

partial_template = template.partial(role="AI助手")
print("部分填充的变量", partial_template.partial_variables)
print("部分填充后的输入变量", partial_template.input_variables)

partial_template = partial_template.partial(username="张三")
print("部分填充的变量", partial_template.partial_variables)
print("部分填充后的输入变量", partial_template.input_variables)


formatted_prompt = partial_template.format(username="李四", question="什么是人工智能?")
print(formatted_prompt)
llm = ChatOpenAI()
result = llm.invoke(formatted_prompt)
print(result.content)
