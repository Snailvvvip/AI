# from langchain_chroma import Chroma
# from langchain_huggingface import HuggingFaceEmbeddings

from smartchain.embeddings import HuggingFaceEmbeddings
from smartchain.vectorstores import Chroma

# 可以使用魔搭下载好模型，在此直接指定路径就可以了
model_path = (
    "C:/Users/rensh/.cache/modelscope/hub/models/sentence-transformers/all-MiniLM-L6-v2"
)
embedding_function = HuggingFaceEmbeddings(model_name=model_path)
# chromadb返回的时候，返回的是一个距离，这个距离是经过归一化处理
# 不管你是什么度量方式，l2或者cosine,都是越小越相似
# 因为在内部做了转换，如果是l2的话本身就是越小越相似，如果是consine distance = 1- similarity
# 初始化向量数据库
chroma_db = Chroma(
    persist_directory="chroma_database",  # 持久化目录
    embedding_function=embedding_function,  # 向量化函数
    collection_name="rag",  # 数据库里集合的名称
    collection_metadata={
        "hnsw:space": "cosine"
    },  # 索引中分层导航小世界距离计算的方式 这里可以指定相似度的计算方式 L2和cosine
)
if not chroma_db._collection.count():
    # 待入库的文本
    texts = [
        "你好，世界！",
        "人工智能非常有趣。",
        "机器学习是人工智能的重要领域。",
        "深度学习通过神经网络模拟人脑。",
        "欢迎使用Chroma向量数据库。",
    ]

    # 每条文本对应的元数据
    metadatas = [
        {"lang": "en", "category": "greeting"},
        {"lang": "en", "category": "tech"},
        {"lang": "zh", "category": "tech"},
        {"lang": "en", "category": "tech"},
        {"lang": "zh", "category": "demo"},
    ]
    chroma_db.add_texts(texts, metadatas)
retriever = chroma_db.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 2},
    # search_type="mmr",
    # search_type="similarity_score_threshold",
    # search_kwargs={"k": 2, "filter": {"lang": "zh"}, "score_threshold": 0.2},
    # search_kwargs={"k": 2, "filter": {"$and": [{"lang": "en"}, {"category": "tech"}]}},
)
results = retriever.invoke("什么是人工智能?")
for i, doc in enumerate(results):
    print(f"检索结果 {i}:{repr(doc)}")
