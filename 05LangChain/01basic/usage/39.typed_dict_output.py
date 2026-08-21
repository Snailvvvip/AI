from typing import Literal
from typing_extensions import Annotated, TypedDict
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, ToolMessage
from dotenv import load_dotenv
from rich import print
from pydantic import BaseModel, Field

load_dotenv(override=True)
# TypedDict  是python 3.8+ 提供的类型注解工具，用于定义 字典的结构 (键名+值类型)


class Ticket(BaseModel):
    "客服工具单摘要"

    category: Literal["退款", "物流", "咨询", "其它"] = Field(description="问题类别")
    urgency: Literal["高", "中", "低"] = Field(
        description="紧急程序，用户表达着急，投诉时升级偏高"
    )
    summary: str = Field(description="一句话摘要，不超过30个字")


class TicketDict(TypedDict):
    """客服工单摘要。"""

    category: Annotated[Literal["退款", "物流", "咨询", "其他"], ..., "问题类别"]
    urgency: Annotated[Literal["低", "中", "高"], ..., "紧急程度"]
    summary: Annotated[str, ..., "一句话摘要"]


model = init_chat_model(
    "deepseek:deepseek-v4-flash",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
extractor = model.with_structured_output(TicketDict)
# result = extractor.invoke("想退货，订单还没有发货")
# print(type(result), result)
# for i, chunk in enumerate(extractor.stream("快递三天没更新，很着急。")):
#    print(f"chunk {i}: {chunk}")


# for mode in ["function_calling", "json_schema", "json_mode"]:
#    try:
#        extractor = model.with_structured_output(TicketDict, method=mode)
#        result = extractor.invoke("想退货，订单还没有发货。请用 json 返回。")
#        print(result)
#    except Exception as e:
#        print(f"{type(e).__name__}: {str(e)}")
runnable = model.with_structured_output(Ticket, method="json_mode")
for step in runnable.steps:  # type: ignore
    print(step)
result = extractor.invoke(
    '请帮我返回一个 json ,内容为 {"category":"物流"}。请用 json 返回。'
)

print(result)
