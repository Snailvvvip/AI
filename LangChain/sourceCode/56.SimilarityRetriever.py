# from langchain_classic.retrievers.bm25 import BM25Retriever
# from langchain_core.documents import Document

# 导入 Document 类（文档表示类）
from smartchain.documents import Document

# 导入 BM25Retriever 检索器
from smartchain.retrievers import VectorSimilarityRetriever

# 准备示例文档，构造 Document 列表，每个包含一段文本
docs = [
    Document(page_content="深度学习通过神经网络取得突破。"),
    Document(page_content="机器人学结合机械工程与人工智能。"),
    Document(page_content="美食点评：这家餐厅的川菜很正宗。"),
    Document(page_content="人工智能技术正推动机器人自主学习与创新。"),
]

# 使用 from_documents 类方法创建 BM25 检索器，传入文档列表
retriever = VectorSimilarityRetriever.from_documents(docs, k=2)

# 设置检索的查询字符串
query = "机器人与人工智能"
# 调用 invoke 方法执行检索，获取相关文档
results = retriever.invoke(query)

# 打印查询内容
print(f"查询：{query}")
# 打印返回的相关文档数量
print(f"返回 {len(results)} 条：")
# 遍历检索结果并逐条打印文档内容
for i, doc in enumerate(results, 1):
    print(f"{i}. {doc.page_content}")
