from .base import BaseRetriever
import jieba
import math
import numpy as np
from collections import Counter
from ..documents import Document


def chinese_tokenizer(text):
    tokens = list(jieba.cut_for_search(text))
    return " ".join(tokens)


class BM25Retriever(BaseRetriever):
    def __init__(self, docs=None, k=4, preprocess_func=None):
        super().__init__()
        self.docs = docs
        self.k = k
        self.preprocess_func = preprocess_func or chinese_tokenizer

    @classmethod
    def from_texts(
        cls,
        texts,
        metadatas=None,
        ids=None,
        bm25_params=None,
        preprocess_func=None,
        k=4,
        **kwargs
    ):
        # 如果没有指定分词器,就使用默认的中文分词器
        preprocess_func = preprocess_func or chinese_tokenizer
        bm25_params = bm25_params or {}
        metadatas = metadatas or ({} for _ in texts)
        if ids:
            docs = [
                Document(id=id, page_content=text, metadata=metadata)
                for id, text, metadata in zip(ids, texts, metadatas)
            ]
        else:
            docs = [
                Document(page_content=text, metadata=metadata)
                for text, metadata in zip(texts, metadatas)
            ]
        return cls(docs=docs, k=k, preprocess_func=preprocess_func, **kwargs)

    @classmethod
    def from_documents(
        cls, documents, bm25_params=None, preprocess_func=None, k=4, **kwargs
    ):
        # 获取每个文档对象中的文本内容列表
        texts = [doc.page_content for doc in documents]
        # 获取每个文档对象中的元数据列表
        metadatas = [
            doc.metadata if hasattr(doc, "metadata") else {} for doc in documents
        ]
        return cls.from_texts(
            texts=texts,
            metadatas=metadatas,
            bm25_params=bm25_params,
            preprocess_func=preprocess_func,
            k=k,
            **kwargs
        )

    def _get_relevant_documents(self, query, **kwargs):
        k = kwargs.get("k", self.k)
        # 对查询字符串进行分词处理
        processed_query = self.preprocess_func(query)
        if not self.docs:
            return []
        docs_tokenized = [self.preprocess_func(doc.page_content) for doc in self.docs]
        # 文档总数
        N = len(docs_tokenized)
        # 计算文档的平均长度
        avgdl = (
            sum(len(doc_tokens) for doc_tokens in docs_tokenized) / N if N > 0 else 0
        )
        # 设置BM25参数k1和b
        k1, b = 1.5, 0.75
        # 计算查询 词的IDF值 逆文档频率
        query_word_idf = {}
        for word in processed_query:
            # 统计包含该 词的文档数
            df = sum(1 for doc_tokens in docs_tokenized if word in doc_tokens)
            if df > 0:
                # 按BM25的公式计算IDF值
                query_word_idf[word] = (N - df + 0.5) / (df + 0.5)
            else:
                query_word_idf[word] = 0
        # 初始化每个文档的分数列表
        doc_scores = []
        # 逐个文档计算和查询匹配的分数
        for i, doc_tokens in enumerate(docs_tokenized):
            score = 0
            # 遍历每个查询词
            for word in processed_query:
                # 仅对文档中存在的词进行计算词频率
                if word in doc_tokens:
                    # 词频统计 看这个词在这个文档中出现在多少次
                    tf = doc_tokens.count(word)
                    idf = query_word_idf[word]
                    # 这个是BM25核心公式
                    score += idf * (
                        (tf * (k1 + 1))
                        / (tf + k1 * (1 - b + b * len(doc_tokens) / avgdl))
                    )
            doc_scores.append((score, i))
        # 按分数倒序排列，取前K条
        doc_scores.sort(reverse=True, key=lambda x: x[0])
        # 选择分数大于0的前K个文档索引
        top_indices = [idx for score, idx in doc_scores[:k] if score > 0]
        # 返回对应的文档列表
        return [self.docs[i] for i in top_indices]
