from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)
# 使用 [provider:model]这种字符串创建聊天模型，其它参数以关键字的参数方式 传入
model = init_chat_model("deepseek:deepseek-v4-flash", temperature=0.2)
result = model.invoke("介绍一下langchain")
print(result.content)


