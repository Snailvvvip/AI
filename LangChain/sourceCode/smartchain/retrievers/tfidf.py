from .base import BaseRetriever
import jieba
import math
import numpy as np
from collections import Counter

# uv add scikit-learn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class SimpleTFIDF:
    def __init__(self, documents):
        self.documents = documents

    def fit(self):
        self.N = len(self.documents)

        # 计算词汇表和IDF
        self.vocab = []
        df = {}

        for doc in self.documents:
            for word in set(doc):
                df[word] = df.get(word, 0) + 1

        # 排序词汇表
        self.vocab = sorted(df.keys())

        # 计算IDF
        self.idf = {}
        for word in self.vocab:
            self.idf[word] = math.log(self.N / (df[word] + 1))

    def transform(self, texts):
        return [self.get_vector(text) for text in texts]

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


def chinese_tokenizer(text):
    tokens = list(jieba.cut_for_search(text))
    return " ".join(tokens)


class TFIDFRetriever(BaseRetriever):
    def __init__(self, vectorizer=None, documents=None, k=4, **kwargs):
        super().__init__(**kwargs)
        if "tokenizer" not in kwargs:
            kwargs["tokenizer"] = chinese_tokenizer
        self.vectorizer = vectorizer or TfidfVectorizer(**kwargs)
        self.k = k or 4
        self.documents = documents
        if self.documents:
            self._fit_vectorizer()

    def _fit_vectorizer(self):
        # 获取所有文档对象里面的文本列表
        texts = [doc.page_content for doc in self.documents]
        # 用所有的文档内容训练TF-IDF向量化器，就像学习字典，先看所有的文档，建立词汇表和规则
        self.vectorizer.fit(texts)
        # 将所有的文档转换为TF-IDF向量矩阵，就像查字典，根据词汇表和规则 ，将文档转成向量
        self.document_vectors = self.vectorizer.transform(texts)

    @classmethod
    def from_documents(cls, documents, **kwargs):
        return cls(documents=documents, **kwargs)

    def _get_relevant_documents(self, query, k=3, **kwargs):
        if not self.documents:
            return []
        # 将查询的句子进行分词
        query_tokens = set(chinese_tokenizer(query).split())
        # 将查询分词转成向量
        query_vectors = self.vectorizer.transform([query])
        # 计算查询向量和所有的文档向量的余弦相似度[[0.1,0.2,0.3,0.4]]
        # 取相邻度矩阵的第一个，得到查询文本与所有的文档之间的相似度
        # query_vectors查询向量 document_vectors 所有的文档向量
        # similarities这个就是相似度了
        similarities = cosine_similarity(query_vectors, self.document_vectors)[0]
        # 检查每个文档是否至少包含一个查询字 doc_has_query_word里面放的是布尔值
        doc_has_query_word = []
        # 遍历每个文档
        for doc in self.documents:
            # 获取 每个文档中的token
            doc_tokens = set(chinese_tokenizer(doc.page_content).split())
            # 查询token集合和文档token集合取交集，要求交集的长度大于0
            doc_has_query_word.append(len(query_tokens & doc_tokens) > 0)
        # 获取相似度排序后降序索引列表
        sorted_indices = np.argsort(similarities)[::-1]
        # 只保留相似度大于0并且至少包含一个查询关键词的文档
        valid_indices = [
            i for i in sorted_indices if similarities[i] > 0 and doc_has_query_word[i]
        ]
        # 取前K个索引
        top_indices = valid_indices[:k]
        # 返回索引对应的文档列表
        return [self.documents[i] for i in top_indices]
