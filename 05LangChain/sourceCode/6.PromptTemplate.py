# from langchain_core.prompts import PromptTemplate
# from langchain_openai import ChatOpenAI
from smartchain.prompts import PromptTemplate
from smartchain.chat_models import ChatOpenAI

# prompt_template=PromptTemplate("你好，我叫{name},你是谁？")
prompt_template = PromptTemplate.from_template("你好，我叫{name},你是谁？")
# <class 'langchain_core.prompts.prompt.PromptTemplate'>
print(prompt_template, type(prompt_template))

llm = ChatOpenAI()
formatted_prompt = prompt_template.format(name="张三")
print(formatted_prompt)
result = llm.invoke(formatted_prompt)
print(result.content)
