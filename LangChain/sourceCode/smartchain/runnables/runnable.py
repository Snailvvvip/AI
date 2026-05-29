from abc import ABC, abstractmethod
import time
import random
from ..config import ensure_config
import uuid as uuid_module
from ..messages import ToolMessage, AIMessage


class Runnable(ABC):
    @abstractmethod
    def invoke(self, input, config=None, **kwargs):
        pass

    def batch(self, inputs, config=None, **kwargs):
        return [self.invoke(input, config, **kwargs) for input in inputs]

    def stream(self, input, config=None, **kwargs):
        result = self.invoke(input, config, **kwargs)
        # 如果说result是一个可迭代对象的话
        if hasattr(result, "__iter__") and not isinstance(result, (str, bytes, dict)):
            for item in result:
                yield item
        else:
            yield result

    def __or__(self, other):
        if not isinstance(other, Runnable):
            raise TypeError(f"管道右侧必须是一个Runnable实例")
        return RunnableSequence([self, other])

    def __repr__(self):
        return

    def with_retry(
        self,
        *,
        retry_if_exception_type=(Exception,),
        stop_after_attempt=3,
        wait_exponential_jitter=True,
        exponential_jitter_params=None,  # 抖动参数字典
    ):
        return RunnableRetry(
            bound=self,
            retry_if_exception_type=retry_if_exception_type,
            stop_after_attempt=stop_after_attempt,
            wait_exponential_jitter=wait_exponential_jitter,
            exponential_jitter_params=exponential_jitter_params,
        )


class RunnableSequence(Runnable):
    def __init__(self, runnables):
        if not runnables:
            raise ValueError(f"runnables列表不能为空")
        for r in runnables:
            if not isinstance(r, Runnable):
                raise TypeError(f"runnables需要全部是Runnable实例")
        self.runnables = runnables

    def __or__(self, other):
        if not isinstance(other, Runnable):
            raise TypeError(f"管道右侧必须是一个Runnable实例")
        return RunnableSequence(self.runnables + [other])

    def invoke(self, input, config=None, **kwargs):
        # 初始化value为input
        value = input
        config = ensure_config(config)
        chain_run_id = config.get("run_id")
        if chain_run_id is None:
            chain_run_id = uuid_module.uuid4()
        for runnable in self.runnables:
            child_config = config.copy()
            child_run_id = uuid_module.uuid4()
            child_config["run_id"] = child_run_id
            child_config["parent_run_id"] = chain_run_id
            value = runnable.invoke(value, child_config, **kwargs)
        return value

    def __repr__(self):
        names = "|".join(
            getattr(runnable, "name", runnable.__class__.__name__)
            for runnable in self.runnables
        )
        return f"RunnableSequence({names})"


class RunnableRetry(Runnable):
    def __init__(
        self,
        bound,
        retry_if_exception_type=(Exception,),
        stop_after_attempt=3,
        wait_exponential_jitter=True,
        exponential_jitter_params=None,
    ):
        # 保存最原始的被包装的runnable
        self.bound = bound
        self.retry_if_exception_type = retry_if_exception_type
        self.stop_after_attempt = stop_after_attempt
        self.wait_exponential_jitter = wait_exponential_jitter
        self.exponential_jitter_params = exponential_jitter_params or {}

    def invoke(self, input, config=None, **kwargs):
        # 记录最后一次抛出的异常
        last_exception = None
        # 初始延迟
        initial = self.exponential_jitter_params.get("initial", 0)
        # 最大延迟
        max_wait = self.exponential_jitter_params.get("max_wait", 10.0)
        # 幂指数基数
        exp_base = self.exponential_jitter_params.get("exp_base", 2.0)
        # 抖动范围
        jitter = self.exponential_jitter_params.get("jitter", 0.0)

        for attempt in range(1, self.stop_after_attempt + 1):  # attempt = 1 2 3
            try:
                return self.bound.invoke(input, **kwargs)
            except self.retry_if_exception_type as error:
                # 保存本次捕获的异常
                last_exception = error
                # 如果还没有到达最大重试次数
                if attempt < self.stop_after_attempt:
                    # 如果要启动指数回退
                    if self.wait_exponential_jitter:
                        # 计算当前的延迟时间
                        delay = min(max_wait, initial * (exp_base ** (attempt - 1)))
                        # 如果配置了jitter,叠加一个随机抖动 jitter的中文含义就是抖动
                        if jitter and delay > 0:
                            jitter_amount = delay * 0.25  # ±25% jitter
                            delay += random.uniform(-jitter_amount, jitter_amount)  # noqa: S311
                            # Ensure delay is not negative after jitter
                            delay = max(0, delay)
                    else:
                        # 不使用指数回避则使用初始值固定延迟时间
                        delay = initial
                        time.sleep(delay)

            # 如果抛出的是不会重试范围内的异常，则直接抛出
            except Exception:
                raise
        # 如果所有重有的生重试都失败了，则抛出最后一个异常
        raise last_exception
