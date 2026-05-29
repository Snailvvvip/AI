from .base import BaseRetriever
import jieba
from rank_bm25 import BM25Okapi
from ..documents import Document
import numpy as np


def chinese_tokenizer(text):
    tokens = list(jieba.cut_for_search(text))
    return " ".join(tokens)


class BM25Retriever(BaseRetriever):
    def __init__(self, vectorizer=None, docs=None, k=4, preprocess_func=None):
        super().__init__()
        self.vectorizer = vectorizer
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
        # 对每个文本应用分词处理，得到分词后的文本列表
        texts_processed = [preprocess_func(text) for text in texts]
        bm25_params = bm25_params or {}
        # 用分词后的文本创建BM25Okapi向量化器
        vectorizer = BM25Okapi(texts_processed, **bm25_params)
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
        return cls(
            vectorizer=vectorizer,
            docs=docs,
            k=k,
            preprocess_func=preprocess_func,
            **kwargs
        )

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
        tokenized_query = processed_query.split()
        print("tokenized_query", tokenized_query)
        doc_scores = self.vectorizer.get_scores(tokenized_query)
        print("doc_scores", doc_scores)
        top_indices = np.argsort(doc_scores)[::-1][:k]
        print("top_indices", top_indices)
        return [self.docs[i] for i in top_indices]
