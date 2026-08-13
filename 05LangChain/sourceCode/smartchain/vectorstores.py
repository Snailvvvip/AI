import os
import numpy as np
from abc import ABC, abstractmethod
import faiss
import chromadb
import uuid
from .retrievers import VectorStoreRetriever
from .documents import Document


# 计算一个向量与多个向量的余弦相似度
def cosine_similarity(from_vec, to_vecs):
    # 将from_vec转换为numpy数组并且强制类型为float
    from_vec = np.array(from_vec, dtype=float)
    to_vecs = np.array(to_vecs, dtype=float)
    # 计算from_vec模长
    norm1 = np.linalg.norm(from_vec)
    similarities = []
    for to_vec in to_vecs:
        dot_product = np.sum(from_vec * to_vec)
        norm_vec = np.linalg.norm(to_vec)
        similarity = dot_product / (norm1 * norm_vec)
        similarities.append(similarity)
    return np.array(similarities)


def mmr_select(query_vector, doc_vectors, k=3, lambda_mult=0.5):
    # 计算每个文档向量与查询向量(Query)的余弦相似度。这代表了文档的“相关性”。
    quer_similarities = cosine_similarity(query_vector, doc_vectors)
    # 选择与查询向量相似度最高的文档：文档 1。
    # 找到与查询向量最相关的文档的下标，作为初始的已选文档 S：选择的结果集=selected=[0]
    selected = [int(np.argmax(quer_similarities))]
    while len(selected) < k:
        # 存放每个候选文档的MMR分数
        mmr_scores = []
        for i in range(len(doc_vectors)):
            if i not in selected:
                # 相关性，指的是i对应的候选文档和查询文档这间的相似性
                relevance = quer_similarities[i]
                # 获取当前已选文档的向量集合
                selected_vecs = doc_vectors[selected]  # - S：选择的结果集
                # 计算当前文档与所有的已选文档的余弦相似度
                sims = cosine_similarity(doc_vectors[i], selected_vecs)
                # 获取对已选中的文档最最大相似度 最不多样性的那个
                # 与已选节点有最大相似度的那个就是最不具有多样性的节点
                max_sim = np.max(sims)
                mmr_score = lambda_mult * relevance - (1 - lambda_mult) * max_sim
                mmr_scores.append((i, mmr_score))
        # 选出MMR分数最高的文档索引
        best_idx, best_score = max(mmr_scores, key=lambda x: x[1])
        # 将选中的文档添加到已选文档中
        selected.append(best_idx)
    return selected


# 定义向量存储的抽象的基类 faiss=chromdb
class VectorStore(ABC):
    # 添加文本到向量存储
    @abstractmethod
    def add_texts(self, texts, metadatas=None):
        pass

    # 最大边际相关性检索
    def max_marginal_relevance_search(self, query, k=3, fetch_k=20):
        pass

    # 从文本批量构建向量存储
    @abstractmethod
    def from_texts(self, texts, embeddings, metadatas=None):
        pass

    @abstractmethod
    def similarity_search(self, query: str, k: int = 4):
        """相似度搜索"""
        pass


class FAISS(VectorStore):
    def __init__(self, embeddings):
        self.embeddings = embeddings
        # 初始化索引为空
        self.index = None
        # 初始化文档字典，键为文档的ID，值为一个文档Document对象
        self.documents_by_id = {}

    def add_texts(self, texts, metadatas):
        if metadatas is None:
            metadatas = [{}] * len(texts)
        embedding_values = self.embeddings.embed_documents(texts)
        embedding_values = np.array(embedding_values, dtype=np.float32)
        # 如果还没有建立FAISS索引库，则新建它
        if self.index is None:
            dimension = len(embedding_values[0])
            self.index = faiss.IndexFlatL2(dimension)
        # 添加嵌入向量到FAISS索引库中
        self.index.add(embedding_values)
        # 获取已知的文档数量，用于新文档的编号
        start_index = len(self.documents_by_id)
        for i, (text, metadata, embedding_value) in enumerate(
            zip(texts, metadatas, embedding_values)
        ):
            # 构建文档ID
            doc_id = str(start_index + i)
            # 构建文档对象
            doc = Document(
                id=doc_id,
                page_content=text,
                metadata=metadata,
                embedding_value=embedding_value,
            )
            # 保存到字典里
            self.documents_by_id[doc_id] = doc

    # 类方法，通过文本批量创建FAISS向量数据库的实例
    @classmethod
    def from_texts(cls, texts, embeddings, metadatas=None):
        instance = cls(embeddings=embeddings)
        instance.add_texts(texts, metadatas=metadatas)
        return instance

    def max_marginal_relevance_search(self, query, k, fetch_k, lambda_mult=0.5):
        # 获取查询文本的嵌入向量
        query_embedding = self.embeddings.embed_query(query)
        # 转换为二维numpy数组
        query_vectors = np.array([query_embedding], dtype=np.float32)
        if isinstance(self.index, faiss.Index):
            # 执行索引库中的检索，返回索引及距离
            _, indices = self.index.search(query_vectors, fetch_k)
            # 获取候选文档对应的索引列表
            candidate_indices = indices[0]
        else:
            raise RuntimeError("FAISS 不可用")
        # 如果说候选文档数不足K个，则直接返回这些文档，不需要再走MMR了
        if len(candidate_indices) <= k:
            docs = []
            for idx in candidate_indices:
                doc_id = str(idx)
                if doc_id in self.documents_by_id:
                    docs.append(self.documents_by_id[doc_id])
            return docs
        # 从candidate_indices用MMR算法挑选出K个元素
        # 从字典中提取候选文档的嵌入向量 5个
        candidate_vectors = np.array(
            [self.documents_by_id[str(i)].embedding_value for i in candidate_indices],
            dtype=np.float32,
        )
        # 通过MMR算法获取MMR选出的下标
        selected_indices = mmr_select(
            query_embedding, candidate_vectors, k=k, lambda_mult=lambda_mult
        )
        # 根据下标选出最终的文档对象
        docs = []
        # 遍历选中的索引，这个索引candidate_indices列表中的索引
        for idx in selected_indices:
            # 获取真实的文档索引或者说文档ID
            doc_id = str(candidate_indices[idx])
            # 通过真实的文档ID找到对应的文档对象
            if doc_id in self.documents_by_id:
                docs.append(self.documents_by_id[doc_id])
        return docs

    # 定义相似度检索方法，返回与查询最近的k个文档
    def similarity_search(self, query: str, k: int = 4):
        """
        相似度搜索

        Args:
            query: 查询文本
            k: 返回的文档数量

        Returns:
            List[Document]: 最相似的文档列表
        """
        # 获取查询文本的嵌入向量
        query_embedding = self.embeddings.embed_query(query)
        # 将嵌入向量转换为NumPy二维数组（形状为1行，d维）
        query_vector = np.array([query_embedding], dtype=np.float32)
        # 用FAISS索引执行k近邻检索，得到距离最近的k个索引
        _, indices = self.index.search(query_vector, k)
        # 创建用于存放检索到文档对象的列表
        docs = []
        # 遍历返回的每个文档索引
        for idx in indices[0]:
            # 把数字索引转为字符串形式的文档id
            doc_id = str(idx)
            # 只有字典中存在这个id的文档才加入最终结果
            if doc_id in self.documents_by_id:
                docs.append(self.documents_by_id[doc_id])
        # 返回最终的相似文档列表
        return docs


class Chroma(VectorStore):
    # 设置默认 的集合名称为langchain
    LANCHAIN_DEFAULT_COLLECTION_NAME = "langchain"

    def __init__(
        self,
        collection_name,
        embedding_function,
        persist_directory,
        collection_metadata,
    ):
        self.embedding_function = embedding_function
        self.collection_name = collection_name
        self.collection_metadata = collection_metadata
        if persist_directory is not None:
            # 如果指定了持久化目录，则使用执行化客户端
            self._client = chromadb.PersistentClient(path=persist_directory)
        else:
            # 使用默认的内存客户端
            self._client = chromadb.Client()
        # 使用客户端获取或新建集合
        self._collection = self._client.get_or_create_collection(
            name=self.collection_name, metadata=self.collection_metadata
        )

    def add_texts(self, texts, metadatas, ids=None, **kwargs):
        if ids is None:
            ids = [str(uuid.uuid4()) for _ in texts]
        else:
            ids = [str(_id) if _id is not None else str(uuid.uuid4()) for _id in ids]

        if metadatas is None:
            metadatas = [{}] * len(texts)
        else:
            # 如果元数据数量少于文本数量，则补齐元数据
            length_diff = len(texts) - len(metadatas)
            if length_diff > 0:
                metadatas = metadatas + [{}] * length_diff

        embedding_values = self.embedding_function.embed_documents(texts)
        # 将文本 ID 嵌入 添加到集合中 upsert=update +insert
        self._collection.upsert(
            ids=ids, documents=texts, embeddings=embedding_values, metadatas=metadatas
        )
        return ids

    # 类方法，通过文本批量创建FAISS向量数据库的实例
    @classmethod
    def from_texts(
        cls,
        texts,
        embedding_function,
        metadatas,
        collection_name,
        persist_directory,
        collection_metadata,
    ):
        instance = cls(
            collection_name=collection_name,
            embedding_function=embedding_function,
            persist_directory=persist_directory,
            collection_metadata=collection_metadata,
        )
        instance.add_texts(texts, metadatas=metadatas)
        return instance

    # 定义相似度检索方法，返回与查询最近的k个文档
    def similarity_search(self, query: str, k: int = 4, filter=None, **kwargs):
        docs_and_scores = self.similarity_search_with_score(
            query=query, k=k, filter=filter, **kwargs
        )
        return [doc for doc, _ in docs_and_scores]

    def _results_to_docs_and_scores(self, results):
        docs_and_scores = []
        if not results.get("ids") or not results["ids"][0]:
            return docs_and_scores
        ids = results["ids"][0]
        documents = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results["distances"][0]
        for i, doc_id in enumerate(ids):
            if documents[i] is not None:
                doc = Document(
                    id=doc_id,
                    page_content=documents[i],
                    metadata=(
                        metadatas[i] if i < len(metadatas) and metadatas[i] else {}
                    ),
                )
                score = distances[i] if i < len(distances) else 0.0
                docs_and_scores.append((doc, score))
        return docs_and_scores

    def max_marginal_relevance_search(self, query, k, fetch_k, lambda_mult=0.5):
        pass

    def _select_relevance_score_fn(self, distance):
        return 1.0 - distance

    # 处理chroma检索结果，转为(doc,score)元组列表
    def similarity_search_with_score(
        self, query: str, k: int = 4, filter=None, **kwargs
    ):
        # query_embedding是一个向量，当然一个向量就是一个小数的列表 [0.1,0.2] 一维列表
        query_embedding = self.embedding_function.embed_query(query)
        if query_embedding is not None:
            results = self._collection.query(
                query_embeddings=[query_embedding], n_results=k, where=filter
            )
        else:
            results = self._collection.query(
                query_texts=[query], n_results=k, where=filter
            )
        docs_and_scores = self._results_to_docs_and_scores(results)
        return [
            (doc, self._select_relevance_score_fn(score))
            for doc, score in docs_and_scores
        ]

    def as_retriever(self, search_type="similarity", search_kwargs=None, **kwargs):
        # search_type  similarity  mmr similarity_score_threshold
        return VectorStoreRetriever(
            vectorstore=self,
            search_type=search_type,
            search_kwargs=search_kwargs,
            **kwargs,
        )
