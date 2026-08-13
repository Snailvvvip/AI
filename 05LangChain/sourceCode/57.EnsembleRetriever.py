# from langchain_community.retrievers import EnsembleRetriever
# from langchain_core.documents import Document

from smartchain.documents import Document
from smartchain.retrievers import EnsembleRetriever

# 构造一个包含4条文本的示例文档列表
documents = [
    Document(page_content="深度学习通过神经网络取得突破。"),
    Document(page_content="机器人学结合机械工程与人工智能。"),
    Document(page_content="美食点评：这家餐厅的川菜 很正宗。"),
    Document(page_content="人工智能正推动机器人自主学习与创新。"),
    Document(page_content="美食很好吃"),
]
retriever = EnsembleRetriever.from_documents(documents, weights=[0.5, 0.5], n=2)
query = "机器人与人工智能"
results = retriever.invoke(query)
print(f"查询:{query}")
print(f"返回:{len(results)}")
for i, doc in enumerate(results, 1):
    print(f"{i}:{doc.page_content}")

# 这里面 有2个k：
# 1.返回数量 n
# 2.平滑系数 k
