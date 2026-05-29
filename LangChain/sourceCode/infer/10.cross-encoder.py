query = "什么是机器学习"
doc1 = "机器学习是人工智能的一个分支"
doc2 = "我喜欢学习机器学习"


def corss_encoder_score(query, document):
    # 将查询文本转成字符集合
    query_chars = set(query)
    # 将文档转换为字符集合
    doc_chars = set(document)
    # 获取查询与文档的共同的字符集合
    common_chars = query_chars & doc_chars
    # 只计算共同字符的数量，并乘以0.5作为分数
    char_score = len(common_chars)
    return char_score


# 1.构建查询文档对，打包成元组列表
pairs = [(query, doc1), (query, doc2)]
# 2. 直接计算每个查询 文档对的相关性分数 不需要分别编码
scores = [corss_encoder_score(query, doc) for query, doc in pairs]
# 3.将文档和分数打包 按分数排序
results = sorted(zip([doc1, doc2], scores), key=lambda x: x[1], reverse=True)

for i, (doc, score) in enumerate(results, 1):
    print(f"{i} {doc} {score}")
