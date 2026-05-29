from abc import ABC, abstractmethod
from pydantic import BaseModel


# from typing import Union, Optional
# python 3.7以前 Union[str, None] = Optional[str]
# python 3.7以后 str|None
class BaseTool(ABC):
    name: str = ""
    description: str = ""
    args_schema: type[BaseModel] | None = None

    def __init__(
        self,
        *,
        name: str | None = None,
        description: str | None = None,
        args_schema: type[BaseModel] | None = None,
        **kwargs
    ):
        if name is not None:
            self.name = name
        if description is not None:
            self.description = description
        if args_schema is not None:
            self.args_schema = args_schema
        for k, v in kwargs.items():
            setattr(self, k, v)

    @abstractmethod
    def _run(self, *args, **kwargs):
        raise NotImplementedError

    async def _arun(self, *args, **kwargs):
        raise NotImplementedError

    def invoke(self, input, **kwargs):
        if isinstance(input, dict):
            return self._run(input, **kwargs)
        return self._run(input, **kwargs)

    def run(self, *args, **kwargs):
        return self._run(*args, **kwargs)
