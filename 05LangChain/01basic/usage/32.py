import json
from typing import Literal
from pydantic import BaseModel, Field
from rich import print
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv

load_dotenv(override=True)


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
    extra_body={"thinking": {"type": "disabled"}},
)
extractor = model.with_structured_output(Ticket, include_raw=True)
result = extractor.invoke("我的快递三天没有更新了，我很着急")
raw = result["raw"]  # type: ignore
print(f"raw类型", type(raw).__name__)
print(f"raw.content", repr(raw.content))
print(f"tool_calls", raw.tool_calls)
print(f"parsed", result["parsed"])  # type: ignore
