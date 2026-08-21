from typing import Literal

from pydantic import BaseModel, Field, ValidationError
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv

load_dotenv(override=True)


class ProductRating(BaseModel):
    """商品评分抽取结果。"""

    # ge / le：评分必须在 1～5
    rating: int = Field(description="评分，只能是 1 到 5 的整数", ge=1, le=5)
    sentiment: Literal["正面", "负面", "中性"] = Field(description="情感倾向")
    comment: str = Field(description="简短评论原文摘要")


model = init_chat_model(
    "deepseek:deepseek-v4-flash",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
extractor = model.with_structured_output(ProductRating)

# 原文写「10 分」时，合格模型应收敛到 5；若仍越界，Pydantic 会校验失败
try:
    rating = extractor.invoke("这东西绝了，必须打 10 分！物流也快。")
    print(rating)
except ValidationError as e:
    print("校验失败：", e)
except Exception as e:
    # 也可能是供应商侧错误或其它解析异常
    print("调用/解析失败：", type(e).__name__, e)
