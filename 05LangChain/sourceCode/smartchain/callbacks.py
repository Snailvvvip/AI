from abc import ABC


class BaseCallbackHandler(ABC):
    # 链开始事件处理 serialized指序列化的链的信息
    def on_chain_start(self, serialized, inputs, **kwargs):
        pass

    # 链结束事件处理
    def on_chain_end(self, outputs, **kwargs):
        pass

    # 链错误事件处理
    def on_chain_error(self, error, **kwargs):
        pass

    # LLM开始事件
    def on_llm_start(self, serialized, prompts, **kwargs):
        pass

    # LLM结束事件
    def on_llm_end(self, response, **kwargs):
        pass

    # LLM错误事件
    def on_llm_error(self, error, **kwargs):
        pass
