from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from rich import print
from PIL import Image
from io import BytesIO

load_dotenv(override=True)

prompt = ChatPromptTemplate.from_messages(
    [("system", "用一句话回答"), ("human", "{topic}")]
)
model = init_chat_model(
    "deepseek:deepseek-v4-flash",
    temperature=0,
    extra_body={"thinking": {"type": "disabled"}},
)
chain = prompt | model | StrOutputParser()
#  获取这条链需要传入哪些字段
# print(chain.get_input_jsonschema())
# 获取条链输出什么类型 是个字符串
# print(chain.get_output_jsonschema())
# result = chain.invoke({"topic": "什么是Runnable"})
# print(result)
#  可以查看链有哪些节点组成，按顺序排序
# print([n.name for n in chain.get_graph().nodes.values()])
# graph = chain.get_graph()
# print(graph)
# nodes = graph.nodes
# print(nodes)
# values = nodes.values()
# print(values)
#  PromptInput ,{"topic": "什么是Runnable"}
#  ChatPromptTemplate prompt
#  ChatDeepSeek model
#  StrOutputParser StrOutputParser()
#  StrOutputParserOutput result
# print(chain.get_graph().draw_ascii())#
# raw_mermaid = chain.get_graph().draw_mermaid()
# print(raw_mermaid)
#  获取链结构的mermaid图片，并转成png图片的字节数据
png_bytes = chain.get_graph().draw_mermaid_png()
# 使用BytesIO将png字节数据转换为文件对象
img = Image.open(BytesIO(png_bytes))
# 显示图片 会弹出系统默认的图片查看窗口查看图片
img.show()
