# 导入 BaseRetriever 基类
from .base import BaseRetriever

# 导入自定义 Document 类
from ..documents import Document

# 导入numpy用于数组操作
import numpy as np


# 定义余弦相似度计算函数
def cosine_similarity(query_embedding, doc_embeddings):
    """
    计算查询向量与文档向量的余弦相似度

    参数:
        query_embedding: 查询的嵌入向量（一维数组）
        doc_embeddings: 文档的嵌入向量列表（二维数组）

    返回:
        相似度分数数组
    """
    # 将查询嵌入转换为numpy数组
    query_emb = np.array(query_embedding)
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


# 定义VectorSimilarityRetriever检索器，继承自BaseRetriever
class VectorSimilarityRetriever(BaseRetriever):
    # VectorSimilarity 检索器说明文档字符串
    """
    VectorSimilarity 检索器

    使用向量嵌入进行文档检索。
    通过计算查询文本与文档集合的嵌入向量，使用余弦相似度找到最相关的文档。
    """

    # 初始化方法
    def __init__(self, embeddings, documents=None, k=4, **kwargs):
        """
        初始化 VectorSimilarity 检索器

        参数:
            embeddings: 嵌入模型实例，必须实现 embed_query 和 embed_documents 方法
            documents: Document 列表，用于计算嵌入向量
            k: 默认返回的文档数量，默认 4
            **kwargs: 其他参数
        """
        # 调用父类初始化方法
        super().__init__(**kwargs)
        # 保存嵌入模型
        self.embeddings = embeddings
        # 保存返回文档数量
        self.k = k
        # 保存文档列表，如果为None则赋值为空列表
        self.documents = documents or []
        # 文档嵌入向量列表
        self.doc_embeddings = None

        # 如果文档列表不为空，则计算文档嵌入向量
        if self.documents:
            self._compute_document_embeddings()

    # 计算所有文档的嵌入向量
    def _compute_document_embeddings(self):
        """计算所有文档的嵌入向量"""
        # 提取所有文档的内容，组成文本列表
        texts = [doc.page_content for doc in self.documents]
        # 批量计算所有文档的嵌入向量
        self.doc_embeddings = self.embeddings.embed_documents(texts)

    # 通过类方法根据文档列表创建检索器对象
    @classmethod
    def from_documents(cls, documents, embeddings=None, k=4, **kwargs):
        """
        从文档列表创建 VectorSimilarityRetriever 实例

        参数:
            documents: Document 列表
            embeddings: 嵌入模型实例，如果为None则使用默认的HuggingFaceEmbeddings
            k: 默认返回的文档数量，默认 4
            **kwargs: 其他参数，可传递给嵌入模型

        返回:
            VectorSimilarityRetriever 实例
        """
        # 如果没有提供嵌入模型，使用默认的HuggingFaceEmbeddings
        if embeddings is None:
            from ..embeddings import HuggingFaceEmbeddings

            embeddings = HuggingFaceEmbeddings(**kwargs)

        # 创建检索器实例，传递文档列表及嵌入模型
        instance = cls(embeddings=embeddings, documents=documents, k=k)
        return instance

    # 主体检索方法，返回与查询相关的文档 _get_relevant_documents
    def _get_relevant_documents(self, query, k=None, **kwargs):
        """
        获取相关文档

        参数:
            query: 查询字符串
            k: 返回的文档数量，如果为None则使用默认值
            **kwargs: 其他参数

        返回:
            Document 列表，按相似度从高到低排序
        """
        # 如果没有文档，则直接返回空列表
        if not self.documents or self.doc_embeddings is None:
            return []

        # 获取k值，优先使用传入参数，否则使用默认值
        k = k if k is not None else self.k

        # 计算查询的嵌入向量
        query_embedding = self.embeddings.embed_query(query)

        # 计算查询向量和所有文档向量的余弦相似度
        similarities = cosine_similarity(query_embedding, self.doc_embeddings)

        # 获取相似度排序后的索引（降序），并取前k个
        top_indices = np.argsort(similarities)[::-1][:k]

        # 只保留相似度大于0的文档，返回对应的Document对象列表
        return [self.documents[i] for i in top_indices if similarities[i] > 0]
