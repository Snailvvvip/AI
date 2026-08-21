from langchain_core.prompts import PromptTemplate, FewShotPromptTemplate
from langchain.messages import HumanMessage, AIMessage
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)
# 定义少样本示例列表，每项包含原词语和其反义词
examples = [
    {"word": "开心", "antonym": "难过"},
    {"word": "高", "antonym": "矮"},
    {"word": "热", "antonym": "冷"},
]
# 用字符串模板创建单条示例的PromptTemplate实例，规定展示格式为 词语/反义词的格式
example_prompt = PromptTemplate.from_template("词语:{word}\n反义词:{antonym}")
few_shot = FewShotPromptTemplate(
    # 传入少样本示例列表，供模板逐条条式化后拼入提示词
    examples=examples,
    # 传入单条示例的格式化模板
    example_prompt=example_prompt,
    # 前缀 说明任务目标，并要求参照示例格式作答
    prefix="给出词语的反义词，参照示例格式作答。\n",
    # 后缀，放置真正待求反的输入占位，并以反义词：引导模板续写
    suffix="\n词语：{input}\n反义词:",
    # 声明运行时需要填充的变量为input
    input_variables=["input"],
)

text = few_shot.format(input="大")
print(text)
model = init_chat_model("deepseek:deepseek-v4-flash", temperature=0.2)
ai = model.invoke(text)
print(ai.content)

# FewShotPromptTemplate用于少样本学习提示模板
# 通过在prompt中嵌入几个示例，让大模型模仿示例的格式和逻辑来进回答新的问题
# FewShotPromptTemplate像一个示例包装器，把几个输入输出按格式塞进prompt,让模型模仿示例来回答问题
# 比零样式效果更好，比微调成本更低
