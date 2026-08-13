from pydantic import BaseModel, Field

# from langchain_core.tools import BaseTool
from smartchain.tools import BaseTool


class AddInput(BaseModel):
    a: int = Field(..., description="被加数")
    b: int = Field(..., description="加数")


# 定义加法工具类
class AddTool(BaseTool):
    name: str = "add"  # 工具名称
    description: str = "计算两个数的和"  # 工具描述
    args_schema: type[BaseModel] = AddInput  # 参数模式，必须是BaseModel

    # Can't instantiate abstract class AddTool without an implementation for abstract method '_run'
    def _run(self, a: int, b: int, **kwargs) -> int:
        return a + b


tool = AddTool()
print(tool.name)
print(tool.description)
print(tool.args_schema.model_json_schema()["properties"])
result = tool.invoke({"a": 3, "b": 4})
# tool.invoke  BaseTool.invoke
# BaseTool.invoke 内部会调用_run方法，而父类的_run方法是一个抽象方法，需要子类实现才能实例化子类
print(result)
