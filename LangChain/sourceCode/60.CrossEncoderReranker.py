# from langchain_chroma import Chroma
# from langchain_huggingface import HuggingFaceEmbeddings  # 768
# from langchain_classic.retrievers.contextual_compression import (
#    ContextualCompressionRetriever,
# )
# from langchain_classic.retrievers.document_compressors import CrossEncoderReranker
# from langchain_community.cross_encoders import HuggingFaceCrossEncoder
# from langchain_deepseek import ChatDeepSeek

from smartchain.vectorstores import Chroma
from smartchain.embeddings import HuggingFaceEmbeddings
from smartchain.retrievers import ContextualCompressionRetriever
from smartchain.document_compressors import CrossEncoderReranker
from smartchain.cross_encoders import HuggingFaceCrossEncoder
from smartchain.chat_models import ChatDeepSeek

embeddings = HuggingFaceEmbeddings()
chroma_db = Chroma(
    persist_directory="chroma_db",
    embedding_function=embeddings,
    collection_name="CrossEncoderReranker2",
    collection_metadata={"hnsw:space": "cosine"},
)

# 检查数据库是否为空，若为空批量插入初始文本及其元数据
if not chroma_db._collection.count():
    # 定义插入的文本列表
    texts = [
        "人工智能（AI）是一种让机器模拟人类智能行为的技术。",
        "深度学习是人工智能的一个重要分支，通过多层神经网络学习数据。",
        "ChatGPT是OpenAI开发的强大自然语言模型。",
        "向量数据库可以高效地存储和检索文本的嵌入向量。",
        "机器人学结合了人工智能和机械工程，推动自动化发展。",
        "AI可以辅助医生进行医学影像分析。",
        "大模型在对话、问答、摘要等领域不断取得突破。",
        "知识库问答系统常用于企业信息检索场景。",
    ]
    # 对应的元数据列表
    metadatas = [
        {"topic": "ai"},
        {"topic": "ai"},
        {"topic": "nlp"},
        {"topic": "vector_db"},
        {"topic": "robotics"},
        {"topic": "healthcare"},
        {"topic": "llm"},
        {"topic": "retrieval"},
    ]
    # 向向量数据库批量插入文本和元数据
    chroma_db.add_texts(texts, metadatas)
llm = ChatDeepSeek(model="deepseek-chat")

base_retriever = chroma_db.as_retriever(
    search_type="similarity", search_kwargs={"k": 20}
)

crossEncoder = HuggingFaceCrossEncoder()
base_compressor = CrossEncoderReranker(model=crossEncoder, top_n=3)
retriever = ContextualCompressionRetriever(
    base_retriever=base_retriever, base_compressor=base_compressor
)

query = "人工智能"
results = retriever.invoke(query)
print(f"查询:{query}")
print(f"返回:{len(results)}")
for i, doc in enumerate(results, 1):
    print(f"{i}:{doc.page_content}")
