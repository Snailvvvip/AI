from .base import BaseDocumentCompressor
import numpy as np


# 定义余弦相似度计算函数
def cosine_similarity(query_embeddings, doc_embeddings):
    # 将查询嵌入转换为numpy数组
    query_emb = np.array(query_embeddings)
    # 将文档嵌入转换为numpy数组
    doc_embs = np.array(doc_embeddings)
    # 若查询为一维，转换为二维以便向量批量操作
    if query_emb.ndim == 1:
        query_emb = query_emb.reshape(1, -1)
    # 计算查询和所有文档嵌入的点积
    dot_product = np.dot(query_emb, doc_embs.T)
    # 计算查询向量的范数
    query_norm = np.linalg.norm(query_emb, axis=1, keepdims=True)
    # 计算所有文档嵌入的范数，并转置方便后续相乘
    doc_norms = np.linalg.norm(doc_embs, axis=1, keepdims=True).T
    # 使用点积/范数乘积得到余弦相似度
    similarity = dot_product / (query_norm * doc_norms)
    # 将因除零产生的nan、正负无穷转为0
    similarity = np.nan_to_num(similarity, nan=0.0, posinf=0.0, neginf=0.0)
    # 返回第一行的相似度结果（只支持一个query）
    return similarity[0]


class EmbeddingsFilter(BaseDocumentCompressor):
    def __init__(self, embeddings, similarity_fn=None, k=20, similarity_threshold=None):
        super().__init__()
        if k is None and similarity_threshold is None:
            raise ValueError(f"必须指定k或者similarity_threshold")
        # 向量模型
        self.embeddings = embeddings
        # 计算相邻度的函数
        self.similarity_fn = similarity_fn or cosine_similarity
        # 返回多少条文档
        self.k = k
        # 相似度的阈值
        self.similarity_threshold = similarity_threshold

    def compress_documents(self, documents, query):
        if not documents:
            return []
        # 收集每个文档的文本内容
        doc_texts = [
            doc.page_content if hasattr(doc, "page_content") else str(doc)
            for doc in documents
        ]
        # 计算所有的文本的向量embed_documents
        doc_embeddings = self.embeddings.embed_documents(doc_texts)
        # 计算查询 向量
        query_embedding = self.embeddings.embed_query(query)
        # 计算查询向量和所有的文档的相似度分类
        similarities = self.similarity_fn([query_embedding], doc_embeddings)
        # 初始化包含所有文档的索引
        included_idxs = np.arange(len(documents))
        # 如果指定了k值，保留相似度最高的K篇文档
        if self.k is not None:
            sorted_indices = np.argsort(similarities)[::-1]
            included_idxs = sorted_indices[: self.k]
        # 如果指定了相似度的阈值，只保留超过阈值的文档
        if self.similarity_threshold is not None:
            similar_enough = similarities[included_idxs] > self.similarity_threshold
            included_idxs = included_idxs[similar_enough]

        return [documents[i] for i in included_idxs]
