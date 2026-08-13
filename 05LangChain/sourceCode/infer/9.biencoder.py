# 导入 HuggingFaceEmbeddings，用于文本编码
from langchain_huggingface import HuggingFaceEmbeddings

# 导入 numpy，用于向量运算
import numpy as np

# 初始化文本编码器，运行在 CPU 上
embeddings = HuggingFaceEmbeddings(model_kwargs={"device": "cpu"})

# 定义查询文本
query = "什么是机器学习"
# 定义第一个待匹配文档
doc1 = "机器学习是人工智能的一个分支"
# 定义第二个待匹配文档
doc2 = "今天天气很好"

# 对查询文本进行编码，得到向量表示
query_vector = embeddings.embed_query(query)
# 对文档1进行编码，得到向量表示
doc1_vector = embeddings.embed_query(doc1)
# 对文档2进行编码，得到向量表示
doc2_vector = embeddings.embed_query(doc2)


# 定义余弦相似度计算函数
def cosine_similarity(vec1, vec2):
    # 将输入转为 numpy 数组
    vec1, vec2 = np.array(vec1), np.array(vec2)
    # 计算余弦相似度并返回
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))


# 计算查询和文档1的相似度（预计很高）
similarity1 = cosine_similarity(query_vector, doc1_vector)
# 计算查询和文档2的相似度（预计很低）
similarity2 = cosine_similarity(query_vector, doc2_vector)

# 创建包含文档和对应相似度的元组列表
docs = [(doc1, similarity1), (doc2, similarity2)]
# 按相似度从高到低排序
sorted_docs = sorted(docs, key=lambda x: x[1], reverse=True)

# 打印查询内容
print(f"查询: {query}\n")
# 打印文档1内容
print(f"文档1: {doc1}")
# 打印文档1的相似度分数
print(f"相似度1: {similarity1:.4f}\n")
# 打印文档2内容
print(f"文档2: {doc2}")
# 打印文档2的相似度分数
print(f"相似度2: {similarity2:.4f}\n")
# 打印排序结果
print("排序结果:")
# 逐个打印排序后的文档及相似度
for i, (doc, score) in enumerate(sorted_docs, 1):
    print(f"{i}. {doc} (相似度: {score:.4f})")
