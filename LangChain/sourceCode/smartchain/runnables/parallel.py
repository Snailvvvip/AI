from .runnable import Runnable


class RunnableParallel(Runnable):
    def __init__(self, **runnables):
        if not runnables:
            raise ValueError("至少需要提供一个Runnable")
        for name, runnable in runnables.items():
            if not isinstance(runnable, Runnable):
                raise TypeError(f"键{name}必须是Runnable的实例")
        self.runnables = runnables

    def invoke(self, input, config=None, **kwargs):
        return {
            name: runnable.invoke(input, config=None, **kwargs)
            for name, runnable in self.runnables.items()
        }

    def batch(self, inputs, config=None, **kwargs):
        return [self.invoke(item, config=None, **kwargs) for item in inputs]

    def __repr__(self):
        keys = ", ".join(self.runnables.keys())
        return f"RunnableParallel({keys})"

    def stream(self, input, config=None, **kwargs):
        for name, runnable in self.runnables.items():
            yield {name: runnable.invoke(input, config=None, **kwargs)}
