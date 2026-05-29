# from langchain_core.prompts import PromptTemplate
# from langchain_openai import ChatOpenAI

from smartchain.prompts import PromptTemplate
from smartchain.chat_models import ChatOpenAI

prompts = {
    "a": PromptTemplate.from_template("hello\n"),
    "b": PromptTemplate.from_template("给我讲一个关于{topic}的{adj}笑话\n"),
    "c": PromptTemplate.from_template("bye"),
}
input_dict = {"topic": "秦始皇", "adj": "冷"}
for key, prompt in prompts.items():
    input_dict[key] = prompt.format(**input_dict)
for key, value in input_dict.items():
    print(f"{key}:{value}")
print("=" * 60)
final_prompt = PromptTemplate.from_template("{a} {b}#44 {c}")
formatted_prompt = final_prompt.format(**input_dict)
print(formatted_prompt)
print("=" * 60)
llm = ChatOpenAI()
result = llm.invoke(formatted_prompt)
print(result.content)
