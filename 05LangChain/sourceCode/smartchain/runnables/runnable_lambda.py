from ..config import ensure_config, accept_config
import uuid as uuid_module
from .runnable import Runnable


class RunnableLambda(Runnable):
    def __init__(self, func, name=None):
        # 判断检查传入和func是否是可调用对象,如果不是的话就报错
        if not callable(func):
            raise TypeError(f"func必须是一个可调用对象,但得到了{type(func)}")
        self.func = func
        if name is not None:
            self.name = name
        else:
            self.name = func.__name__ if func.__name__ != "<lambda>" else "lambda"

    def invoke(self, input, config=None, **kwargs):
        # 保证config不为None，如果为None转为空字典
        config = ensure_config(config)
        callbacks = config.get("callbacks")
        # 初始化回调对象列表
        callback_list = []
        # 获取用户传入的调用ID
        run_id = config.get("run_id")
        # 如果用户没有传入，则自动生成一个新的UUID
        if run_id is None:
            run_id = uuid_module.uuid4()
        # 如果callbacks不为空则
        if callbacks:
            if isinstance(callbacks, list):
                callback_list = callbacks
            else:
                callback_list = [callbacks]
        # 构建序列化信息，用于上报链条标识
        serialized = {"name": self.name, "type": "RunnableLambda"}
        # 遍历每个回调对象，触发其on_chain_start函数
        for callback in callback_list:
            if hasattr(callback, "on_chain_start"):
                try:
                    callback.on_chain_start(
                        serialized=serialized,
                        inputs={"input": input},
                        run_id=run_id,
                        parent_run_id=None,
                        tags=config.get("tags"),
                        metadata=config.get("metadata"),
                        **kwargs,
                    )
                except Exception:
                    pass
        # 检查被包装的函数是否能够接收config参数
        if accept_config(self.func):
            kwargs["config"] = config
        try:
            # 正常调用被 包装的函数，将input作为第一个参数，kwargs作为关键字参数字典
            output = self.func(input, **kwargs)
        except Exception as e:
            if callback_list:
                for callback in callback_list:
                    if hasattr(callback, "on_chain_error"):
                        try:
                            callback.on_chain_error(
                                error=e,
                                run_id=run_id,
                                parent_run_id=None,
                                **kwargs,
                            )
                        except Exception:
                            pass
            raise
        # 如果没有异常执行，触发所有的回调中的on_chain_end方法
        if callback_list:
            for callback in callback_list:
                if hasattr(callback, "on_chain_end"):
                    try:
                        callback.on_chain_end(
                            outputs={output: output},
                            run_id=run_id,
                            parent_run_id=None,
                            **kwargs,
                        )
                    except Exception:
                        pass
        return output

    def batch(self, inputs, config=None, **kwargs):
        return [self.invoke(input, config=None, **kwargs) for input in inputs]

    def stream(self, input, config=None, **kwargs):
        yield from super().stream(input, config=None, **kwargs)

    def __repr__(self):
        return f"RunnableLambda(func={self.name})"
