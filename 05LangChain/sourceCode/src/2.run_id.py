# 写的是一个链式调用
# 父链MyCalblackhandler
# 子链1 to_upper
# 子链2 add_prefix


# on_chain_start: run_id: 根链的run_id,父run_id是None
import uuid


class MockChain:
    def __init__(self, name):
        self.name = name

    def invoke(self, input_data, config=None):
        parent_run_id = None if config is None else config.get("run_id")
        current_run_id = str(uuid.uuid4())
        print(f"开始执行:{self.name}")
        print(f"run_id:{current_run_id}")
        print(f"parent_run_id:{parent_run_id}")
        result = input_data.upper() if self.name == "to_upper" else f"结果:{input_data}"
        print(f"结束执行{self.name} 结果：{result}")
        return result


parent_chain = MockChain("MyCalblackhandler")
parent_run_id = str(uuid.uuid4())
print(f"父链开始")
print(f"run_id:{parent_run_id},parent_run_id:None")

child1 = MockChain("to_upper")
input_data = "MyCalblackhandler"
result1 = child1.invoke(input_data, {"run_id": parent_run_id})

child2 = MockChain("add_prefix")
input_data = "add_prefix"
result2 = child1.invoke(input_data, {"run_id": parent_run_id})

print(f"父链结束")
print(f"run_id:{parent_run_id},parent_run_id:None")
