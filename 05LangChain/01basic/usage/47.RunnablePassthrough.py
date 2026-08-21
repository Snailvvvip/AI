from langchain_core.runnables import RunnableConfig
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.chat_models import init_chat_model
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from dotenv import load_dotenv
from rich import print
from langchain_core.runnables import chain

load_dotenv(override=True)


def retrieve(question):
    return "langchain是用Runnable统一组件接口，可用|进行组合"


# 将输入字符串包装成包含question字段的字典
to_dict = RunnableLambda(lambda q: {"question": q})
# 从字典中提取出question,调用retrieve得到上下文的runnable
context = RunnableLambda(lambda d: retrieve(d["question"]))  # type: ignore
# 串接 先转字典，再通过assign追加context字段，得到RAG输入
tag_inputs = to_dict | RunnablePassthrough.assign(context=context)
result = tag_inputs.invoke("什么是langchain?")
print(result)

# 把{"question": "什么是langchain?"}传给 RunnablePassthrough.assign
# RunnablePassthrough.assign 会把接收到的字典传给context，得到一结果字段串"langchain是用Runnable统一组件接口，可用|进行组合"
# 然后会把这个context这个键和得到这个context字符串值合并到输入的字典里去
# {"question": "什么是langchain?","context":"langchain是用Runnable统一组件接口，可用|进行组合"}

# The input to RunnablePassthrough.assign() must be a dict.
#  RunnablePassthrough.assign()输入必须是字典
