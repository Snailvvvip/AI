from langchain.chat_models import init_chat_model
from langchain_deepseek import ChatDeepSeek
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)

model = ChatDeepSeek(
    model="deepseek-v4-flash",  # 模型名称
    temperature=0.2,  # 温度
    max_retries=2,  # 设置调用模型失败的时候最多重试几次
)
result = model.invoke("一句话介绍一下langchain")
print(result.content)
