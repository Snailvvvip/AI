from langchain_core.prompts import ChatPromptTemplate
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)
# 用消息列表创建聊天提示词模板，每条消息可包含待填充的变量
chat_prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", "把句子翻译成{target_lang},只输出译文"),
        ("human", "{text}"),
    ]
)
model = init_chat_model("deepseek:deepseek-v4-flash", temperature=0.2)
# 用LCEL管道把 先填模板，再调模型串成一条链
chain = chat_prompt_template | model
# 传入目标语言和原文，调用键条得到模型回复
ai = chain.invoke({"target_lang": "英文", "text": "生活不只是眼前的代码"})
print(ai.content)


prompt = chat_prompt_template.format(target_lang="英文", text="生活不只是眼前的代码")
ai = model.invoke(prompt)
print(ai.content)

# LCEL管道是Langchain声明式编程语法，用|符号将组件串联为处理管道，数据像流水线一样依次流过每个环节
# chain = prompt | model |output_parser
# 本质上是把复杂流程拆成可组合的组件，每个组件接收上一个的输出，处理后传入下一个
