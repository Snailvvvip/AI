from .base import BaseTool
from inspect import signature, Parameter
from pydantic import BaseModel, Field, create_model


class StructuredTool(BaseTool):
    # 定义要绑定的函数
    func = None

    def __init__(
        self, func, *, name=None, description=None, args_schema=None, **kwargs
    ):
        # 如果没有提供工具名称，则使用函数的名称
        name = name or func.__name__
        # 如果未提供工具描述，则使用函数的docstring作为工具描述
        description = description or (func.__doc__ or "")
        # 如果未提供参数模型，则根据函数的签名自动推断参数模型
        if args_schema is None:
            args_schema = self._infer_schema_from_function(func, name)
        super().__init__(
            name=name, description=description, args_schema=args_schema, **kwargs
        )
        self.func = func

    # 静态方法 通过函数的签名推断pydantic模型
    @staticmethod
    def _infer_schema_from_function(func, model_name):
        sig = signature(func)
        fields = {}
        for param_name, param in sig.parameters.items():
            if param_name in ("self", "cls"):
                continue
            # 获取参数注解类型
            param_type = param.annotation
            # 如果没有给某个参数添加类型注释，则默认类型为str
            if param_type == Parameter.empty:
                param_type = str
            if param.default != Parameter.empty:
                fields[param_name] = (param_type, Field(default=param.default))
            else:
                fields[param_name] = (param_type, Field(...))
        if not fields:
            return None
        return create_model(f"{model_name}Input", **fields)

    @classmethod
    def from_function(
        cls,
        func,  # 绑定的函数
        *,
        name=None,  # 可选的工具名
        description=None,  # 可选的工具描述
        args_schema=None,  # 可选的参数模式
        **kwargs,
    ):
        return cls(
            func=func,
            name=name,
            description=description,
            args_schema=args_schema,
            **kwargs,
        )

    def _run(self, *args, **kwargs):
        # 执行校验输入并且执行工具函数
        # 如果参数校验模型存在，并且是BaseModel的子类
        if (
            self.args_schema
            and isinstance(self.args_schema, type)
            and issubclass(self.args_schema, BaseModel)
        ):
            if args:
                # 如果仅有一个参数并且是一个字典，合并dict和kwargs
                if len(args) == 1 and isinstance(args[0], dict):
                    input_dict = {**args[0], **kwargs}
                else:
                    # 否则将args顺序匹配到schema字段名，再合并kwargs
                    field_names = list(self.args_schema.model_fields.keys())  # a,b
                    input_dict = {
                        field_names[i]: args[i]
                        for i in range(min(len(args), len(field_names)))
                    }  # {a:3,b:4}
                    input_dict.update(kwargs)
            else:
                input_dict = kwargs
            # self.args_schema AddInput(BaseModel):
            # 用schema做参数的校验
            validated = self.args_schema(**input_dict)
            # 调用绑定的参数，并以模型校验后的数据作为参数
            return self.func(**validated.model_dump())
        return self.func(*args, **kwargs)
