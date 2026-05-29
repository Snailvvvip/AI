# from langchain_core.prompts import PromptTemplate, FewShotPromptTemplate
# from langchain_openai import ChatOpenAI

from smartchain.chat_models import ChatOpenAI
from smartchain.prompts import PromptTemplate, FewShotPromptTemplate

# 1.定义一堆示例的集合
examples = [
    {"question": "1 [烟花] 1 等于多少?", "answer": "答案是2"},
    {"question": "2 [烟花] 2 等于多少?", "answer": "答案是4"},
    {"question": "3 [烟花] 3 等于多少?", "answer": "答案是6"},
    {"question": "4 [烟花] 5 等于多少?", "answer": "答案是9"},
    {"question": "100 [烟花] 100 等于多少?", "answer": "答案是200"},
]
# 每个示例的提示词模板
example_prompt = PromptTemplate.from_template("示例问题:{question},示例回答:{answer}")
fewShotPromptTemplate = FewShotPromptTemplate(
    examples=examples,
    example_prompt=example_prompt,
    prefix="你是一个擅长算术的AI助手，以下是多个示例:",
    suffix="请回答用户的问题:{user_question}\nAI:",
)
print(fewShotPromptTemplate.input_variables)
formatted_prompt = fewShotPromptTemplate.format(user_question="8 [烟花] 7 等于多少?")
print(formatted_prompt)
print("=" * 60)
llm = ChatOpenAI()
result = llm.invoke(formatted_prompt)
print(result.content)
