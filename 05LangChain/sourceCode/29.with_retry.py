from langchain_core.runnables import RunnableLambda

# from smartchain.runnables import RunnableLambda

# 定义一个用于统计调用次数的全局变量
call_count = 0


def ustable_func(x):
    global call_count
    call_count += 1
    if call_count < 3:
        raise ValueError(f"第{call_count}次调用失败")

        raise TypeError(f"这是一个类型错误")
    return f"调用成功:{x}"


runnableLambda = RunnableLambda(ustable_func)
# retry_if_exception_type 只针对ValueError类型的异常进行重试
# stop_after_attempt 最多重试3次
# wait_exponential_jitter禁用指数退避与抖动

retry_runnableLambda = runnableLambda.with_retry(
    retry_if_exception_type=(ValueError, TypeError),
    stop_after_attempt=3,
    wait_exponential_jitter=False,
    exponential_jitter_params={"initial": 2},
)

# result = retry_runnableLambda.invoke("测试")
# print("result", result)
# print(f"总调用次数:{call_count}")

results = retry_runnableLambda.batch(["A", "B", "C"])
print("results", results)
print(f"总调用次数:{call_count}")
