# from langchain_core.prompts import load_prompt
# from langchain_openai import ChatOpenAI

from smartchain.prompts import load_prompt
from smartchain.chat_models import ChatOpenAI

prompt_template = load_prompt("prompt_template.json", encoding="utf-8")

formatted_prompt = prompt_template.format(question="什么是人工智能?")
print(formatted_prompt)
llm = ChatOpenAI()
result = llm.invoke(formatted_prompt)
print(result.content)
