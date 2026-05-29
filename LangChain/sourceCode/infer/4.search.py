import math
import numpy as np
from collections import Counter


class SimpleTFIDF:
    def __init__(self, documents):
        self.documents = documents
        self.N = len(documents)

        # 计算词汇表和IDF
        self.vocab = []
        df = {}

        for doc in documents:
            for word in set(doc):
                df[word] = df.get(word, 0) + 1

        # 排序词汇表
        self.vocab = sorted(df.keys())

        # 计算IDF
        self.idf = {}
        for word in self.vocab:
            self.idf[word] = math.log(self.N / (df[word] + 1))

    def get_vector(self, doc):
        """获取文档的TF-IDF向量"""
        # 词频统计
        word_counts = Counter(doc)
        doc_len = len(doc)

        vector = []
        for word in self.vocab:
            # 计算TF
            tf = word_counts.get(word, 0) / doc_len if doc_len > 0 else 0
            # 计算TF-IDF
            tfidf = tf * self.idf[word]
            vector.append(tfidf)

        return np.array(vector)


def cosine_similarity(vec1, vec2):
    """计算余弦相似度"""
    # 点积
    dot = np.dot(vec1, vec2)
    # 模长
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)

    # 避免除零
    if norm1 == 0 or norm2 == 0:
        return 0.0

    return dot / (norm1 * norm2)


def search_similar(query_tokens, documents, k=3):
    """搜索相似文档"""
    # 创建TF-IDF模型
    tfidf = SimpleTFIDF(documents)

    # 查询向量
    query_vec = tfidf.get_vector(query_tokens)

    # 计算相似度
    results = []
    for i, doc in enumerate(documents):
        doc_vec = tfidf.get_vector(doc)
        similarity = cosine_similarity(query_vec, doc_vec)
        results.append((i, similarity))

    # 按相似度排序
    results.sort(key=lambda x: x[1], reverse=True)

    return results[:k]


# ====== 使用示例 ======

# 文档数据
documents = [
    ["我", "喜欢", "机器学习"],
    ["机器学习", "很", "有趣"],
    ["自然语言处理", "是", "AI", "的", "重要", "分支"],
    ["我", "喜欢", "自然语言处理"],
]

# 查询
query = ["机器学习", "有趣"]

# 搜索
print("查询:", query)
print("搜索结果:")
for doc_idx, score in search_similar(query, documents, k=3):
    print(f"  文档{doc_idx}: 相似度={score:.4f}, 内容={documents[doc_idx]}")
