import json
from typing import Literal
from pydantic import BaseModel, Field
from rich import print
from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv(override=True)


class Ticket(BaseModel):
    "客服工具单摘要"

    category: Literal["退款", "物流", "咨询", "其它"] = Field(description="问题类别")
    urgency: Literal["高", "中", "低"] = Field(
        description="紧急程序，用户表达着急，投诉时升级偏高"
    )
    summary: str = Field(description="一句话摘要，不超过30个字")


prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "你是客服质检员。根据用户原话抽取工单字段。"
            "只能依据原文判断；信息不足时 urgency 用「低」，summary 如实说明缺什么。"
            "不要编造订单号或物流单号。",
        ),
        ("human", "{complaint}"),
    ]
)

model = init_chat_model(
    "deepseek:deepseek-v4-flash",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
# 链条 填模板 再结构化输出
# chain = prompt | model.with_structured_output(Ticket)
# ticket = chain.invoke({"complaint": "我想问问会员积分怎么查，不着急"})
# print(ticket)


messages = prompt.format_messages(complaint="我想问问会员积分怎么查，不着急")
print(messages)
result = model.with_structured_output(Ticket).invoke(messages)
print(result)
