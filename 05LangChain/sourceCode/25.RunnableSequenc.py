# from langchain_core.runnables import RunnableLambda

from smartchain.runnables import RunnableLambda


def add_one(x, **kwargs):
    return x + 1


def multiply_two(x, **kwargs):
    return x * 2


def add_prefix(x, **kwargs):
    return f"结果:{x}"


add_one_runnable = RunnableLambda(add_one)
print(repr(add_one_runnable))
multiply_two_runnable = RunnableLambda(multiply_two)
add_prefix_runnable = RunnableLambda(add_prefix)

chain = add_one_runnable | multiply_two_runnable | add_prefix_runnable
print(repr(chain))
result = chain.invoke(5)
print("result", result)

inputs = [1, 2, 3, 4]
batch_results = chain.batch(inputs)
print("batch_results", batch_results)

for chunk in chain.stream(7):
    print(f"收到:{chunk}")
