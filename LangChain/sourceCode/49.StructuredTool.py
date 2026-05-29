from pydantic import BaseModel, Field

# from langchain_core.tools import StructuredTool
from smartchain.tools import StructuredTool


class AddInput(BaseModel):
    a: int = Field(..., description="被加数")
    b: int = Field(..., description="加数")


def add(a: int, b: int) -> int:
    return a + b


# 通过from_function创建结构化的工具，绑定参数模式
addTool = StructuredTool.from_function(
    func=add, name="add", description="计算两个数的和", args_schema=AddInput
)
print(addTool.name)
print(addTool.description)
print(addTool.args_schema.model_json_schema()["properties"])
result = addTool.invoke({"a": 3, "b": "4"})
print(result)
