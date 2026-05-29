# from langchain_core.runnables import RunnableLambda
# from langchain_core.runnables.config import RunnableConfig
# from langchain_core.callbacks.stdout import BaseCallbackHandler


from smartchain.runnables import RunnableLambda
from smartchain.callbacks import BaseCallbackHandler
import uuid


def to_upper(text, config={}):
    print(f"1.to_upper输入:{text}")
    print(f"to_upper.tags:{config.get('tags')}")
    print(f"to_upper.metadata:{config.get('metadata')}")
    print(f"to_upper.max_concurrency:{config.get('max_concurrency')}")
    print(f"to_upper.recursion_limit:{config.get('recursion_limit')}")
    print(f"to_upper.callbacks:{config.get('callbacks')}")
    print(f"to_upper.configurable:{config.get('configurable')}")
    result = text.upper()
    print(f"2.add_prefix输出:{result}")
    return result


def add_prefix(text, config={}):
    print(f"1.add_prefix输入:{text}")
    print(f"add_prefix.tags:{config.get('tags')}")
    print(f"add_prefix.metadata:{config.get('metadata')}")
    print(f"add_prefix.max_concurrency:{config.get('max_concurrency')}")
    print(f"add_prefix.recursion_limit:{config.get('recursion_limit')}")
    print(f"add_prefix.callbacks:{config.get('callbacks')}")
    print(f"add_prefix.configurable:{config.get('configurable')}")
    result = f"结果:{text}"
    print(f"2.add_prefix输出:{result}")
    return result


to_upper_runnable = RunnableLambda(to_upper)
add_prefix_runnable = RunnableLambda(add_prefix)
chain = to_upper_runnable | add_prefix_runnable
run_name = "文本处理任务"
config1 = {"run_name": run_name}
result1 = chain.invoke("hello", config=config1)
print("result1", result1)
print("=" * 50)
config2 = {"run_id": uuid.uuid4()}
result2 = chain.invoke("world", config=config2)
print("result2", result2)
print("=" * 50)
config3 = {"tags": ["production", "text_processing"]}
result3 = chain.invoke("tags", config=config3)
print("result3", result3)
print("=" * 50)
config4 = {"metadata": {"user_id": "1000", "session_id": "abc-def-ghi"}}
result4 = chain.invoke("metadata", config=config4)
print("result4", result4)
print("=" * 50)
config5 = {"max_concurrency": 2}
result5 = chain.invoke("max_concurrency", config=config5)
print("result5", result5)
print("=" * 50)
config6 = {"recursion_limit": 10}
result6 = chain.invoke("recursion_limit", config=config6)
print("result6", result6)


class MyCallbackHandler(BaseCallbackHandler):
    # 链开始事件处理
    def on_chain_start(self, serialized, inputs, **kwargs):
        print(f"on_chain_start:{serialized},{inputs},{kwargs}")

    # 链结束事件处理
    def on_chain_end(self, outputs, **kwargs):
        print(f"on_chain_end:,{outputs},{kwargs}")

    # 链错误事件处理
    def on_chain_error(self, error, **kwargs):
        print(f"on_chain_error:{error},{kwargs}")

    # LLM开始事件
    def on_llm_start(self, serialized, prompts, **kwargs):
        print(f"on_llm_start:{serialized},{prompts},{kwargs}")

    # LLM结束事件
    def on_llm_end(self, response, **kwargs):
        print(f"on_llm_end:{response},{kwargs}")

    # LLM错误事件
    def on_llm_error(self, error, **kwargs):
        print(f"on_llm_error:{error},{kwargs}")


myCallbackHandler = MyCallbackHandler()
print("=" * 50)
config7 = {
    "run_id": uuid.uuid4(),
    "run_name": "MyCallbackHandler",
    "callbacks": [myCallbackHandler],
}
result7 = chain.invoke("MyCallbackHandler", config=config7)
print("result7", result7)
print("=" * 50)
config8 = {"configurable": {"model": "gpt-4o", "temperature": 0.5}}
result8 = chain.invoke("configurable", config=config8)
print("result8", result8)
