from .base import BaseRetriever
from .bm25 import BM25Retriever
from .vector import VectorSimilarityRetriever
from ..embeddings import HuggingFaceEmbeddings


class EnsembleRetriever(BaseRetriever):
    def __init__(self, retrievers=None, weights=None, k=60, n=2):
        super().__init__()
        self.retrievers = retrievers or []
        self.weights = weights or []
        self.k = k
        self.n = n

    @classmethod
    def from_documents(cls, documents, weights, n=2):
        bm25Retriever = BM25Retriever.from_documents(documents)
        vectorSimilarityRetriever = VectorSimilarityRetriever.from_documents(documents)
        if weights is None:
            weights = [0.5, 0.5]
        retrievers = [bm25Retriever, vectorSimilarityRetriever]
        return cls(retrievers=retrievers, weights=weights, n=n)

    def _get_doc_id(self, doc):
        return doc.page_content

    def _calculate_rrf_score(self, doc_ranks):
        # 存储每个文档的RRF的分数
        rrf_scores = {}
        # 遍历每个文档在不同的检索器中的排名
        for doc_id, ranks in doc_ranks.items():
            score = 0.0
            # 遍历各个检索器的排名
            for i, rank in enumerate(ranks):
                # 如果有排名，排名不为None
                if rank is not None:
                    # 使用指定的权重，如果没有提供 权重，默认使用1.0
                    weight = self.weights[i] if self.weights else 1.0
                    # 累加RFF的分数
                    score += weight / (self.k + rank)
            rrf_scores[doc_id] = score
        return rrf_scores

    # 获取最终融合后的相关文档
    def _get_relevant_documents(self, query, n=4, **kwargs):
        if not self.retrievers:
            return []
        if self.weights is None:
            self.weights = [1.0 / len(self.retrievers)] * len(self.retrievers)
        all_results = []
        for retriever in self.retrievers:
            results = retriever.invoke(query, k=n * 2, **kwargs)
            all_results.append(results)
        # 建立ID到文档对象的映射
        doc_id_to_doc = {}
        # 存储每个文档在各检索器中的排名
        doc_ranks = {}
        # 遍历每个检索器返回的召回数据
        for retriever_idx, results in enumerate(all_results):
            for rank, doc in enumerate(results, start=1):
                # 获取 文档ID
                doc_id = self._get_doc_id(doc)
                # 如果是首次出现在的话，初始化一下
                if doc_id not in doc_id_to_doc:
                    doc_id_to_doc[doc_id] = doc
                    doc_ranks[doc_id] = [None] * len(self.retrievers)
                # 仅记录第一次出现的rank
                if doc_ranks[doc_id][retriever_idx] is None:
                    doc_ranks[doc_id][retriever_idx] = rank
        # 融合所有的排名，返回RRF融合分数
        rrf_scores = self._calculate_rrf_score(doc_ranks)
        # 按分数倒序排列
        sorted_docs = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
        # 收集分数大于0的topk个文档
        top_k_docs = []
        for doc_id, score in sorted_docs[: self.n]:
            top_k_docs.append(doc_id_to_doc[doc_id])
        return top_k_docs
