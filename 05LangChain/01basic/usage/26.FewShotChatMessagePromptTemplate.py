from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
from langchain.messages import HumanMessage, AIMessage
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)
# 定义少样本示例列表，每项包含输入算式与期望的输出
examples = [
    {"input": "2+2", "output": "8"},
    {"input": "3+3", "output": "12"},
    {"input": "4+4", "output": "16"},
]
# 用消息列表创建单条示例的ChatPromptTemplate,规定human/ai消息对格式
example_prompt = ChatPromptTemplate.from_messages(
    [("human", "{input}"), ("ai", "{output}")]
)
# 用示例列表和单例模板组装 FewShotChatMessagePromptTemplate
few_shot_prompt = FewShotChatMessagePromptTemplate(
    examples=examples, example_prompt=example_prompt
)
# 用消息列表创建最终的ChatPromptTemplate，串联起系统指令 ，少样式和用户输入
prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "你是算术助手，只输出最终的数字，注意要学习案例的输入输出，按照其规律计算",
        ),
        few_shot_prompt,
        ("human", "{input}"),
    ]
)
text = prompt_template.format(input="5+5")
print(text)
model = init_chat_model("deepseek:deepseek-v4-flash", temperature=0.2)
ai = model.invoke(text)
print(ai.content)
