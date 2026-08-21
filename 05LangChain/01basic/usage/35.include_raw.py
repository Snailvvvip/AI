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


model = init_chat_model(
    "deepseek:deepseek-v4-flash",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
extractor = model.with_structured_output(Ticket, include_raw=True)

result = extractor.invoke("我的快递三天没有更新了，很着急 。")
print(result["raw"].usage_metadata)  # type: ignore
# print("parsed", result["parsed"])  # type: ignore
# print("parsing_error", result["parsing_error"])  # type: ignore
# print("raw type", type(result["raw"]).__name__)  # type: ignore

# if result["parsing_error"] is not None:  # type: ignore
#    print("解析失败", result["parsing_error"])  # type: ignore
# else:
#    ticket = result["parsed"]  # type: ignore

# TypeError: 'Ticket' object is not subscriptable 如果Ticket不是字典的话，还要用[]取值的话就会报这个错
#
