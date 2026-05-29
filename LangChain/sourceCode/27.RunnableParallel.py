# from langchain_core.runnables import RunnableLambda, RunnableParallel

from smartchain.runnables import RunnableLambda, RunnableParallel


def add_one(x, **kwargs):
    return x + 1


def multiply_two(x, **kwargs):
    return x * 2


def square(x, **kwargs):
    return x**2


add_one_runnable = RunnableLambda(add_one)
multiply_two_runnable = RunnableLambda(multiply_two)
square_runnable = RunnableLambda(square)

runnableParallel = RunnableParallel(
    add_one=add_one_runnable, multiply_two=multiply_two_runnable, square=square_runnable
)
# print(repr(runnableParallel))
# input_value = 5
# result = runnableParallel.invoke(input_value)
# print("result", result)
#
# input_values = [1, 2, 3]
# result = runnableParallel.batch(input_values)
# print("result", result)

for chunk in runnableParallel.stream(4):
    print(f"收到:{chunk}")

#
# 收到:{'add_one': 5}
# 收到:{'multiply_two': 8}
# 收到:{'square': 16}
