from typing import Literal

from pydantic import BaseModel, Field
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, ToolMessage
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)


class Ticket(BaseModel):
    """客服工单摘要。"""

    category: Literal["退款", "物流", "咨询", "其他"] = Field(description="问题类别")
    urgency: Literal["低", "中", "高"] = Field(description="紧急程度")
    summary: str = Field(description="摘要")


model = init_chat_model(
    "deepseek:deepseek-v4-flash",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
# include_raw=True 才能拿到 parsing_error 而不是直接抛异常
extractor = model.with_structured_output(Ticket, include_raw=True)

user_text = "我的快递三天没更新了，很着急。"
messages = [
    HumanMessage(
        "请抽取工单字段。 category只能是：退款/物流/咨询/其他"
        f"urgency 只能是 低/中/高。\n用户原话是:{user_text}"
    )
]
# 最大重试次数
MAX_ATTEMPTS = 3
ticket = None
for attempt in range(1, MAX_ATTEMPTS + 1):
    result = extractor.invoke(messages)
    if result["parsing_error"] is None and result["parsed"] is not None:  # type: ignore
        ticket = result["parsed"]  # type: ignore
        print(f"第{attempt}次成功")
        break
    raw = result["raw"]  # type: ignore
    err = result["parsing_error"]  # type: ignore
    messages.append(raw)
    # 给每一个tool_call补一条应答消息，满足协议要求
    for tc in raw.tool_calls:
        messages.append(
            ToolMessage(
                content=f"上次输出未通过校验,出错原因:{err}", tool_call_id=tc["id"]
            )  # type: ignore
        )
    print(f"第{attempt}次失败")
    messages.append(
        HumanMessage(f"上次输出无法通过校验:{err},请严格按照Schema重新抽取")
    )
if ticket is None:
    print(f"重试{MAX_ATTEMPTS}次仍然失败，转人工处理")
else:
    print(f"最终结果", ticket)

print(messages)
