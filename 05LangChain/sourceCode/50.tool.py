from pydantic import BaseModel, Field

# from langchain_core.tools import tool

from smartchain.tools import tool


class AddInput(BaseModel):
    a: int = Field(..., description="被加数")
    b: int = Field(..., description="加数")


# 1. @tool()
# 2. @tool
# 3. @tool("我新传的工具名称")
# @tool("我新传的工具名称", args_schema=AddInput, description="计算两个数的和")
@tool()
def add(a: int, b: int) -> int:
    return a + b


print(add.name)
print(add.description)
print(add.args_schema.model_json_schema()["properties"])
result = add.invoke({"a": 3, "b": "4"})
print(result)
