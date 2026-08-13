# from langchain_core.runnables import RunnableLambda, RunnableBranch

from smartchain.runnables import RunnableLambda, RunnableBranch


def handle_positive(x):
    return f"{x}是正数"


def handle_negative(x):
    return f"{x}是负数"


def handle_zero(x):
    return f"{x}是零"


handle_positive_runnable = RunnableLambda(handle_positive)
handle_negative_runnable = RunnableLambda(handle_negative)
handle_zero_runnable = RunnableLambda(handle_zero)
# 创建条件分支，先判断是否为正数，再判断是否为负数，最后默认处理0，注意顺序很重要
# 条件1 大于0使用 走handle_positive_runnable
# 条件2 小于0，走handle_negative
# 默认分支 走handle_zero_runnable
runnableBranch = RunnableBranch(
    (lambda v: v > 0, handle_positive_runnable),
    (lambda v: v < 0, handle_negative_runnable),
    handle_zero_runnable,
)
print(repr(runnableBranch))
# or value in [3, -2, 0]:
#    print(f"输入 {value}->{runnableBranch.invoke(value)}")
values = [5, 0, -1]
print("batch", runnableBranch.batch(values))

for chunk in runnableBranch.stream(-7):
    print(f"输出:{chunk}")


def generate(input):
    # return [input, 1, 2, 3]
    yield "a"
    yield "b"
    yield "c"


runnableLambda = RunnableLambda(generate)
for item in runnableLambda.stream(1):
    print(f"item:{item}")

iterable = generate(1)
iter = iterable.__iter__()
v1 = iter.__next__()
print(v1)
v2 = iter.__next__()
print(v2)
v3 = iter.__next__()
print(v3)
