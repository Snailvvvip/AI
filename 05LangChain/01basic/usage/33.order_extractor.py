import json
from typing import Literal
from pydantic import BaseModel, Field, field_validator
from rich import print
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv

load_dotenv(override=True)


# 订单行项目 一个订单可以包含多个商品
class OrderItem(BaseModel):
    "订单中的单个商品行"

    product_name: str = Field(description="商品名称")
    quantity: int = Field(description="购买数量", ge=1)
    unit_price: float | None = Field(
        default=None, description="单价(元),原文未提及时填null,不要编造"
    )


# 模型常用来表示「没有」的各种写法，按需扩充
BLANKS = {"", "null", "none", "n/a", "na", "未提及", "无", "未知", "不详", "-"}


class Order(BaseModel):
    "从用户的描述中抽取的订单信息"

    # 因为不同的大模型多次调用填的值可能是不一样的，"null" "" None
    order_id: str | None = Field(default=None, description="订单号，未提及时填null")
    customer_name: str | None = Field(
        default=None, description="客户姓名，未提及时填null"
    )
    status: Literal["待付款", "待发货", "运输中", "已完成", "未知"] = Field(
        description="订单状态；无法判断时用「未知」"
    )
    items: list[OrderItem] = Field(description="商品明细列表；没有商品时为空列表")
    notes: str = Field(description="需要人工关注的补充说明；没有则写空字符串")

    @field_validator("order_id", "customer_name", mode="before")
    @classmethod
    def bank_to_none(cls, v):
        """模型可能把 没有 写成 'null'/'无','' 全部归一化成None"""
        if isinstance(v, str) and v.strip().lower() in BLANKS:
            return None
        return v


model = init_chat_model(
    "deepseek:deepseek-v4-flash",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
# extractor = model.with_structured_output(Order)
# text = (
#    "帮我记一下：张三的订单 A20260328001，"
#    "买了 2 件机械键盘，单价 399；还买了 1 个2块钱的鼠标垫。"
#    "已经付款，等着发货。"
# )
# order = extractor.invoke(text)
# print(order)
# print(order.model_dump_json(indent=2))

# print(json.dumps(Order.model_json_schema(), ensure_ascii=False, indent=2))


extractor = model.with_structured_output(Order, include_raw=True)
r = extractor.invoke("买了三个杯子，还没付钱")

args = r["raw"].tool_calls[0]["args"]  # type: ignore
print("模型返回的参数:", args)
print("parsed.order_id:", repr(r["parsed"].order_id))  # type: ignore
print("是 None 吗:", r["parsed"].order_id is None)  # type: ignore
