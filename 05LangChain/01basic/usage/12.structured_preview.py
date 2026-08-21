from langchain.chat_models import init_chat_model
from langchain.tools import tool
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import Literal  # Literal用于将字段的值限制为字面量

from rich import print
import os

load_dotenv(override=True)


# 定义客服工单摘要 Pydantic模型类
class Ticket(BaseModel):
    category: Literal["退款", "物流", "咨询", "其它"] = Field(description="问题类别")
    urgency: Literal["低", "中", "高"] = Field(description="紧急程度")
    summary: str = Field(description="一句话摘要")


model = init_chat_model(
    "deepseek:deepseek-v4-flash",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
# 基于Ticket模型创建结构化输出的提取器，强制模型按该schema返回
extractor = model.with_structured_output(Ticket)
# 调用提取器，将用户投诉文本解析为Ticket结构化对象
# Thinking mode does not support this tool_choice
ticket = extractor.invoke("我的快递三天没更新了，很着急")
print(ticket)
