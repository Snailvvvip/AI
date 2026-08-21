from typing import Literal
from typing_extensions import Annotated, TypedDict
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, ToolMessage
from dotenv import load_dotenv
from rich import print
from pydantic import BaseModel, Field
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy, ProviderStrategy

load_dotenv(override=True)
# TypedDict  是python 3.8+ 提供的类型注解工具，用于定义 字典的结构 (键名+值类型)


class Ticket(BaseModel):
    "客服工具单摘要"

    category: Literal["退款", "物流", "咨询", "其它"] = Field(description="问题类别")
    urgency: Literal["高", "中", "低"] = Field(
        description="紧急程序，用户表达着急，投诉时升级偏高"
    )
    summary: str = Field(description="一句话摘要，不超过30个字")


model = init_chat_model(
    "deepseek:deepseek-v4-flash",
    temperature=0,
    # Thinking mode does not support this tool_choice
    extra_body={"thinking": {"type": "disabled"}},
)
agent = create_agent(
    model=model,
    tools=[],
    # 因为Deepseek不支持原生的response_format,必须显式使用ToolStrategy，
    # handle_errors=True表示解析失败时把错误反馈给模型重试
    response_format=ToolStrategy(Ticket, handle_errors=True),
    # This response_format type is unavailable now
    # response_format=Ticket,
    system_prompt="根据用户原话抽取工单，不要编造",
)
result = agent.invoke(
    {"messages": [{"role": "user", "content": "付款了两天还没发货，比较着急"}]}
)
# print(result)
# Agent返回的结果在structured_response字段里
# print(result["structured_response"])


from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "用三句话介绍主题，使用中文。"),
        ("human", "{topic}"),
    ]
)
model = init_chat_model("deepseek:deepseek-v4-flash", temperature=0.3)
chain = prompt | model

# 链的 stream：末端是 StrOutputParser 时，chunk 直接是字符串增量
# 链的 stream：末端是model，chunk是AIMessageChunk
for chunk in chain.stream({"topic": "LCEL"}):
    if not chunk.content:
        continue
    print(chunk.content, end="", flush=True)
