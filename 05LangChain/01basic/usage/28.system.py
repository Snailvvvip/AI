# 从 langchain_core.prompts 导入 ChatPromptTemplate，用于创建多角色对话提示词模板
from langchain_core.prompts import ChatPromptTemplate

# 从 langchain.chat_models 导入 init_chat_model，用于按名称初始化聊天模型
from langchain.chat_models import init_chat_model

# 从 dotenv 导入 load_dotenv，用于从 .env 文件加载环境变量
from dotenv import load_dotenv

# 加载 .env 中的环境变量；override=True 表示覆盖已存在的同名变量
load_dotenv(override=True)

# 定义系统提示词：设定电商售后助手角色、目标、边界与输出格式，并用 strip 去掉首尾空白
SYSTEM = """
你是电商售后助手。

目标：用最短步骤帮用户解决问题。

边界：
- 不承诺未核实的退款时效
- 不知道物流状态时，请用户提供订单号

输出：
- 先给结论（1 句）
- 再给 1～3 条可执行步骤
- 使用中文
""".strip()

# 用消息列表创建 ChatPromptTemplate，串联系统提示与用户问题
prompt = ChatPromptTemplate.from_messages(
    # 消息模板列表：按 system / human 顺序组织对话
    [
        # 系统消息：使用上方定义的 SYSTEM 提示词
        ("system", SYSTEM),
        # 人类消息：用户当前问题，{question} 为运行时填充的变量
        ("human", "{question}"),
        # 结束消息模板列表
    ]
    # 结束 ChatPromptTemplate.from_messages 调用
)

# 初始化 DeepSeek 聊天模型，temperature=0 使输出更稳定、更少随机性
model = init_chat_model("deepseek:deepseek-v4-flash", temperature=0)
# 打印模型对用户问题的回复文本内容
print(
    # 用管道将提示词模板与模型串联成可调用链
    (prompt | model)
    # 传入用户问题调用链，询问快递长时间显示运输中的情况
    .invoke({"question": "我的快递一直显示运输中，已经五天了。"})
    # 取出返回消息的文本内容
    .content
)

# prompt | model 是后续 LCEL 的起点。
# LCEL= LangChain Expression Language
# 声明式编程语言，用|管道符将组件串联成可执行链，数据像流水一样从上游流向下流
