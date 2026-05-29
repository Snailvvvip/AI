import math
from collections import Counter
import jieba


class BM25:
    def __init__(self, documents, k1=1.5, b=0.75):
        self.documents = documents
        # 文档总数
        self.N = len(documents)
        # 词频饱和度参数，默认是1.5
        self.k1 = k1
        # 长度归一化参数 默认值是0.75
        self.b = b
        # 计算平均文档长度
        # 所有的文档的长度除以文档数
        self.avgdl = sum(len(doc) for doc in documents) / self.N if self.N > 0 else 0
        print("self.avgdl", self.avgdl)
        # 定义词 -文档频率(DF)字典 文档频率是指包含某个词的文档数量。 文档频率（Document Frequency, DF）
        # df算法和tf-idf是一样的
        self.df = {}
        # 遍历每个文档
        for doc in documents:
            # 获取每个当前文档所有的唯一词(经过去重)
            unique_words = set(doc)
            # 遍历文档中的每个唯一的词
            for word in unique_words:
                #  如果词未出现在df中，返回0并加1，否则 直接加1
                self.df[word] = self.df.get(word, 0) + 1
        print("self.df", self.df)
        # 计算每个词的IDF值
        self.idf = {}
        for word, df_value in self.df.items():
            # n(qi)= 包含词qi的文档数量df_value
            self.idf[word] = math.log((self.N - df_value + 0.5) / (df_value + 0.5)) + 1

    def _calculate_tf(self, word, doc):
        # 使用Counter统计词频
        word_counts = Counter(doc)
        # 返回词在此文档中出现的次数，如果不存在则返回0
        return word_counts.get(word, 0)

    def _calculate_score_for_word(self, word, doc):
        # 获取此词在文档中出现的词频
        tf = self._calculate_tf(word, doc)
        if tf == 0:
            return 0
        # 获取归一化项的值
        normalization = 1 - self.b + self.b * (len(doc) / self.avgdl)
        # 计算调整后的词频
        # 归一化项的值用来调整文档长度对结果的影响
        # 对词频进行"饱和"处理,用来实现刚开始词频率增加对分数贡献大，后面对分数贡献小
        ajusted_tf = (tf * (self.k1 + 1)) / (tf + self.k1 * normalization)
        # 计算最终的分数IDF*ajusted_tf
        score = self.idf[word] * ajusted_tf
        return score

    def get_scores(self, query):
        # 初始化分数列表
        scores = []
        for doc in self.documents:
            # 初始化分数
            doc_score = 0
            # 遍历查询中的每一个词
            for word in query:
                # 计算该 词对文档的分数贡献
                word_score = self._calculate_score_for_word(word, doc)
                # 累加到文档总分
                doc_score += word_score
            # 将此当前文档的分数添加到分数列表中
            scores.append(doc_score)
        return scores

    def get_top_n(self, query, n=5):
        # 计算所有文档的分数
        scores = self.get_scores(query)
        # 创建(分数,索引)元组列表
        score_index_paires = [(score, idx) for idx, score in enumerate(scores)]
        # 按分数倒序排列
        score_index_paires.sort(key=lambda x: x[0], reverse=True)
        # 获取前n个文档对应的索引
        top_indices = [idx for _, idx in score_index_paires[:n]]
        # 根据索引获取对应的原始的文档
        top_documents = [self.documents[idx] for idx in top_indices]
        return top_documents


original_docs = [
    "我喜欢机器学习",
    "我喜欢机器",
    "我喜欢学习",
    "机器学习很有趣",
    "我喜欢编程",
]
documents = [list(jieba.cut(doc)) for doc in original_docs]
# documents [['我', '喜欢', '机器', '学习'], ['机器', '学习', '很', '有趣'], ['我', '喜欢', '编程']]
bm25 = BM25(documents)
print("documents", documents)
query_text = "机器学习"
query = list(jieba.cut(query_text))
print("query", query)
scores = bm25.get_scores(query)
for i, (doc, score) in enumerate(zip(original_docs, scores), 1):
    print(f"{i}:{doc} {score:.4f}")
# query ['机器', '学习']
# D 文档 ['我', '喜欢', '机器', '学习']
# Q ：查询（由多个词组成：q1,q2 )q1=机器,q2=学习
# qi：查询中的第 i个词 q1=机器,q2=学习
# TF(qi,D)：词 qi在文档D中出现的次数 q1=机器 这个词在D ['我', '喜欢', '机器', '学习'] 出现的次数
# |D|：文档 D的长度（词数） 4
# avgdl ：所有文档的平均长度 3.66
# k1：词频饱和度参数（通常取 1.2-2.0，默认 1.5）
# b：长度归一化参数（通常取 0.75）
# i = 0=机器 1=学习
# n 就是查询词的数量 2

top_docs = bm25.get_top_n(query, n=2)
for i, doc in enumerate(top_docs, 1):
    print(f"{i}:{doc}")
