# from langchain_community.retrievers import TFIDFRetriever

# from langchain_core.documents import Document

from smartchain.retrievers import TFIDFRetriever
from smartchain.documents import Document

# 构造一个包含4条文本的示例文档列表
docs = [
    Document(page_content="深度学习 通过 神经网络 取得突破。"),
    Document(page_content="机器人 学 结合 机械工程 与 人工智能。"),
    Document(page_content="美食点评：这家餐厅的 川菜 很正宗。"),
    Document(page_content="人工智能 正推动 机器人 自主学习 与 创新。"),
]

retriever = TFIDFRetriever.from_documents(docs, k=2)
query = "机器人与人工智能"
results = retriever.invoke(query)
print(f"查询:{query}")
print(f"返回:{len(results)}")
for i, doc in enumerate(results, 1):
    print(f"{i}:{doc.page_content}")
