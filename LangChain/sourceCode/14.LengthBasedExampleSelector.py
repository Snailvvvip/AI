# from langchain_core.prompts import PromptTemplate, FewShotPromptTemplate
# from langchain_core.example_selectors import LengthBasedExampleSelector
# from langchain_openai import ChatOpenAI

from smartchain.prompts import PromptTemplate, FewShotPromptTemplate
from smartchain.example_selectors import LengthBasedExampleSelector
from smartchain.chat_models import ChatOpenAI

# 定义一个包含多个问答对的列表，每个元素是一个字典，表示一个示例
examples = [
    {"question": "1 plus 1等于多少？", "answer": "答案是2"},
    {"question": "2 plus 2等于多少？", "answer": "答案是4"},
    {"question": "3 plus 3等于多少？", "answer": "答案是6"},
    {"question": "4 plus 4等于多少？", "answer": "答案是8"},
    {"question": "5 plus 5等于多少？", "answer": "答案是10"},
]
# 定义示例展示的格式模板，通过 from_template 方法快速构建
example_prompt = PromptTemplate.from_template("问题：{question}\n答案：{answer}")
lengthBasedExampleSelector = LengthBasedExampleSelector(
    examples=examples, example_prompt=example_prompt, max_length=50
)
fewShotPromptTemplate = FewShotPromptTemplate(
    example_selector=lengthBasedExampleSelector,
    examples=examples,
    example_prompt=example_prompt,
    prefix="你是一个擅长算术的AI助手，以下是多个示例:",
    suffix="请回答用户的问题:{user_question}\nAI:",
)
formatted_prompt = fewShotPromptTemplate.format(user_question="8 plus 7 等于多少?")
print(formatted_prompt)
print("=" * 60)
llm = ChatOpenAI()
result = llm.invoke(formatted_prompt)
print(result.content)

# Q查询节点
# 已选节点=[e]
# 候选节点=[a,b,c,d,f,g]
# λ=0.5
# 遍历 [a,b,c,d,f,g]候选节点，计算MMR = λ × 相关性 - (1-λ) × 相似度
# a = 0.5*0.34-0.5*0.3= a的mmr
# ..
# g =0.16
#已选节点变多了，候选节点是和已选节点的最后一个比么？
#不是的，是全部比一遍选最大的值作为相似度