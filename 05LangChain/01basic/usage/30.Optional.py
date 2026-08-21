import json
from typing import Literal, Optional
from pydantic import BaseModel, Field


class A(BaseModel):
    "带default=None"

    # 表示order_id有默认值None,它就是不是必填项
    order_id: str | None = Field(default=None, description="订单号")


class B(BaseModel):
    "只写|None,不给default"

    # 表示order_id是必填项
    order_id: str | None = Field(description="订单号")


class C(BaseModel):
    "使用Optinal 但给了default"

    # 表示order_id是非必填项
    order_id: Optional[str] = Field(default=None, description="订单号")


for cls in (A, B, C):
    s = cls.model_json_schema()
    print(f"{cls.__name__}:required={s.get('required',[])}")
