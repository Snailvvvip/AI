# from langchain_core.runnables import RunnableLambda
from smartchain.runnables import RunnableLambda

# invoke 只能输入一个位置参数
add_one_runnable = RunnableLambda(lambda x: x + 2)
# 单个调用
result = add_one_runnable.invoke(5)
print("result", result)
# 批量调用
results = add_one_runnable.batch([1, 2, 3, 4, 5])
print(f"输出:{results}")


add_runnable = RunnableLambda(lambda x: x + 1)
mul_runnable = RunnableLambda(lambda x: x * 2)
square_runnable = RunnableLambda(lambda x: x**2)
input_value = 2
step1 = add_runnable.invoke(input_value)
print("step1", step1)
step2 = mul_runnable.invoke(step1)
print("step2", step2)
step3 = square_runnable.invoke(step2)
print("step3", step3)


def process_text(text):
    words = text.split()
    for word in words:
        yield word


stream_runnable = RunnableLambda(process_text)
input_text = "你好 世界 Python RAG"
stream = stream_runnable.stream(input_text)
for chunk in stream:
    print(f"收到:{chunk}")
