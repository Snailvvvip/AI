# 安装 huggingface 相关依赖（如需）
# uv add langchain-huggingface

# 导入 HuggingFaceEmbeddings 类（这里用自定义 smartchain 版本）
# from langchain_huggingface import HuggingFaceEmbeddings
from smartchain.embeddings import HuggingFaceEmbeddings

# 指定本地模型路径
model_path = (
    "C:/Users/rensh/.cache/modelscope/hub/models/sentence-transformers/all-MiniLM-L6-v2"
)

# 创建 HuggingFaceEmbeddings 实例，指定模型路径和设备为 cpu
embeddings = HuggingFaceEmbeddings(
    model_name=model_path, model_kwargs={"device": "cpu"}
)

# 定义查询文本（单个句子）
query_text = "什么是人工智能？"

# 计算查询文本的嵌入向量
query_embedding = embeddings.embed_query(query_text)

# 打印查询嵌入向量的前5维
print(f"查询嵌入前5维: {query_embedding[:5]}")

# 定义待嵌入的多个文档（句子列表）
documents = [
    "人工智能是计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统。",
    "机器学习是人工智能的一个子领域，它使计算机能够从数据中学习而无需明确编程。",
    "深度学习是机器学习的一个子集，使用神经网络来模拟人脑的工作方式。",
]

# 计算每个文档的嵌入向量（批量嵌入）
doc_embeddings = embeddings.embed_documents(documents)

# 打印第一个文档嵌入向量的前5维
print(f"文档嵌入第1个前5维: {doc_embeddings[0][:5]}")

# 导入 numpy 库用于数组运算
import numpy as np


# 定义计算两个向量余弦相似度的函数
def cosine_similarity(vec1, vec2):
    # 转为 numpy 数组
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    # 计算余弦相似度
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))


# 再次获得查询文本的嵌入向量
query_emb = embeddings.embed_query(query_text)

# 计算查询与每个文档嵌入的相似度
similarities = [cosine_similarity(query_emb, doc_emb) for doc_emb in doc_embeddings]

# 找到相似度最高的文档索引
most_similar_idx = int(np.argmax(similarities))

# 打印最相似文档的编号和相似度分值
print(
    f"最相似文档索引: {most_similar_idx} 相似度: {similarities[most_similar_idx]:.4f}"
)
