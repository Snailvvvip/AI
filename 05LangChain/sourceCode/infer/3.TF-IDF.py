import math
from collections import Counter


class TFIDF:
    def __init__(self, documents):
        # 保存文档集合
        self.documents = documents
        # 文档集合中的总文档数
        self.N = len(documents)
        # 定义词 -文档频率(DF)字典 文档频率是指包含某个词的文档数量。 文档频率（Document Frequency, DF）
        self.df = {}
        # 遍历每个文档
        for doc in documents:
            # 获取每个当前文档所有的唯一词(经过去重)
            unique_words = set(doc)
            # 遍历文档中的每个唯一的词
            for word in unique_words:
                #  如果词未出现在df中，返回0并加1，否则 直接加1
                self.df[word] = self.df.get(word, 0) + 1
        # 定义词-IDF值的字典
        self.idf = {}
        # 遍历每个词及其对应DF值
        for word, df_value in self.df.items():
            # 计算IDF值，采用log(N/(df_1))避免分母为0
            self.idf[word] = math.log(self.N / (df_value + 1))
        # df和idf它们是针对整个文档列表而言的

    def get_tfidef_vector(self, doc):
        # 词频（Term Frequency, TF是针对某个文档而言的
        vector = {}
        # 获取 文档 中的唯一词
        unique_words = set(doc)
        # 遍历每个词，计算它的TF_IDF值并存入字典
        for word in unique_words:
            vector[word] = self.calculate_tfidf(word, doc)
        # 返回字典
        return vector

    def calculate_tf(self, word, doc):
        if len(doc) == 0:
            return 0
        # 统计文档中每个词出现的次数
        word_counts = Counter(doc)
        # 获取这个词对应的出现的次数
        word_count = word_counts.get(word, 0)
        # 计算词频率 此词出现的次数/文档长度
        tf = word_count / len(doc)
        return tf

    def calculate_tfidf(self, word, doc):
        # 先计算词频TF
        tf = self.calculate_tf(word, doc)
        # 再获取IDF值
        idf = self.idf[word]
        tfidf = tf * idf
        return tfidf


# 定义文档数据，每个文档是词的列表
documents = [
    ["我", "喜欢", "机器学习"],  # 得到每个句子的向量
    ["机器学习", "很", "有趣"],
    ["自然语言处理", "是", "AI", "的", "重要", "分支"],
]
tfidf = TFIDF(documents)
# print(tfidf.df)
print(tfidf.idf)
# 获取整个词汇表，并排序，便于统一向量的顺序
vocabulary = sorted(tfidf.df.keys())
print("词汇表:", vocabulary)
# 计算所有的文档的稀疏TF-IDF向量
sparse_vectors = [tfidf.get_tfidef_vector(doc) for doc in documents]
print("sparse_vectors", sparse_vectors)
# 初始化完整的向量列表
full_vectors = []
for sparse_vector in sparse_vectors:
    vector = []
    for word in vocabulary:
        vector.append(sparse_vector.get(word, 0.0))
    full_vectors.append(vector)
for item in full_vectors:
    print(item)

query_vector = [
    0.0,
    0.0,
    0.0,
    0.13515503603605478,
    0.0,
    0.0,
    0.13515503603605478,
    0.0,
    0.0,
    0.0,
    0.0,
]


# 以前的向量通过向量模型得到的
# 现在是通过关键词加权得到

# 以终为始 未来要实现相似度检索，靠的是向量的相邻度
# 以前我们用的是嵌入模型 embedding
# 现在我们不使用 嵌入模型 embedding。自己通过关键字自己算
# 在项目中，我们会采用两种相似度评分
# 第一种是加权关键字相似性，指的就是我们现在讲的TFIDF值
# 第二种矢量余弦相似性，就是以前讲的向量余弦相似度
# 最后会进行加权求分
