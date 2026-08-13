from typing import Any, Callable
from .structured import StructuredTool


def tool(
    name_or_callable=None,  # 工具名或函数
    *,
    description=None,  # 工具描述
    args_schema=None,  # 参数校验模型
    **kwargs,  # 其它扩展函数
):
    # 定义一个内部函数，用于实际创建StructuredTool实例
    def _create_tool(func, override_name=None):
        # 工具的名称 或者传进来一个新的名字，或者直接用函数名
        tool_name = override_name or func.__name__
        tool_desc = description or (func.__doc__ or "")
        return StructuredTool.from_function(
            func=func,
            name=tool_name,
            description=tool_desc,
            args_schema=args_schema,
            **kwargs,
        )

    # 1.装饰器无参数形式
    if name_or_callable is None:

        def decorator(func):
            return _create_tool(func)

        return decorator
    # 2.如果直接装饰函数，参数就是函数本身，则相当于让@tool直接用于函数本身
    if callable(name_or_callable) and hasattr(name_or_callable, "__name__"):
        return _create_tool(name_or_callable)
    # 3.如果是字符串的话
    if isinstance(name_or_callable, str):

        def decorator(func):
            return _create_tool(func, override_name=name_or_callable)

        return decorator
    raise ValueError(f"tool装饰器参数类型不正确 {type(name_or_callable)}")
