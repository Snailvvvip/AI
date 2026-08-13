from .runnable import Runnable


class RunnablePassthrough(Runnable):
    def invoke(self, input, config=None, **kwargs):
        return input

    def batch(self, inputs, config=None, **kwargs):
        return list(inputs)

    def __repr__(self):
        return f"RunnablePassthrough()"
