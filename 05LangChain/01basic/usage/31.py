from langchain.chat_models import init_chat_model
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv(override=True)

model = init_chat_model(
    "deepseek:deepseek-v4-flash",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)


class Strict(BaseModel):
    "严格订单"

    order_id: str | None = Field(default="", description="订单号,必填项")
    amount: float | None = Field(default=None, description="金额，必填项")


extrator = model.with_structured_output(Strict)
print(extrator.invoke("我想问一下退货的政策"))
