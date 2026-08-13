# 关键词检索排名 全文检索的排名 或者 稀疏检索的排名 关键词
keyword_results = ["doc1", "doc2", "doc3"]
# 矢量检索排名 向量检索排名 稠密检索排名 向量就384维度
vector_results = ["doc3", "doc2", "doc4"]


def reciprocal_rank_fusion(rankings, k=60):
    # 创建一个空的分数字典并设置平滑常数 k = 60
    scores = {}
    # 遍历每个排名
    for ranking in rankings:
        for rank, doc in enumerate(ranking, 1):
            # 如果该文档还没有加入到分数字典，则加入
            if doc not in scores:
                scores[doc] = 0
            # 计算每个文档在此排序中的RRF分数 1/(k+rank)
            rrf_score = 1 / (k + rank)
            # 将RRF分数加到该文档的总分中
            scores[doc] += rrf_score
    # 按照分数从高到低进行排序，获取排序后的结果
    sorted_results = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_results


fused_results = reciprocal_rank_fusion([keyword_results, vector_results], k=1000)
print("关键词检索结果", keyword_results)
print("向量检索结果", vector_results)
print("融合后的最终结果")
for i, (doc, score) in enumerate(fused_results, 1):
    print(f"{i}.{doc} {score:.4f}")

# 向量检索和关键字检索的得分放在一起排序吗，是的
# 不是单独排序再加权吗 是的

# 向量检索和关键字检索他们本质是也是排名算法，内部都有单独排序
