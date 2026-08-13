# 导入 HuggingFaceEmbeddings 类，用于句向量编码
from smartchain.embeddings import HuggingFaceEmbeddings

# 导入 Chroma 类，实现本地向量数据库
from smartchain.vectorstores import Chroma

# 指定本地模型路径
model_path = (
    "C:/Users/rensh/.cache/modelscope/hub/models/sentence-transformers/all-MiniLM-L6-v2"
)
# 实例化 HuggingFaceEmbeddings，指定模型路径和设备为 CPU
embeddings = HuggingFaceEmbeddings(
    model_name=model_path, model_kwargs={"device": "cpu"}
)

# 创建 Chroma 数据库实例，指定持久化目录、嵌入函数、集合名称和集合元数据（指定使用余弦距离）
chroma_db = Chroma(
    persist_directory="chroma_db",
    embedding_function=embeddings,
    collection_name="langchain",
    collection_metadata={"hnsw:space": "cosine"},
)

# 定义待入库的文本列表
texts = [
    "Hello, world!",
    "Artificial Intelligence is fascinating.",
    "机器学习是人工智能的重要领域。",
    "Deep learning simulates the human brain using neural networks.",
    "欢迎使用Chroma向量数据库。",
]

# 定义对应文本的元数据列表
metadatas = [
    {"lang": "en", "category": "greeting"},
    {"lang": "en", "category": "tech"},
    {"lang": "zh", "category": "tech"},
    {"lang": "zh", "category": "tech"},
    {"lang": "zh", "category": "tech"},
]

# 向 Chroma 数据库中批量添加文本和元数据信息
chroma_db.add_texts(texts, metadatas)

# 使用英语查询，检索最相关的2条文本
results = chroma_db.similarity_search("人工智能的主要领域有哪些？", k=2)
# 输出检索结果
for i, doc in enumerate(results):
    print(f"Result {i}: {doc.page_content}")

# 使用中文查询，检索最相关的2条文本，并返回得分
results_with_score = chroma_db.similarity_search_with_score(
    "人工智能的主要领域有哪些？", k=2
)
# 输出检索结果及其相似度分数
for i, (doc, score) in enumerate(results_with_score):
    print(f"Result {i}: Score={score:.4f} {doc.page_content}")
