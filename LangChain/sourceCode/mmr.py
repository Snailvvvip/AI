import numpy as np


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


# 权衡相关性和多样性的参数
# 如果是1的话只考虑相关性，不考虑多样性，也就 是说mmr分数只和候选节点和查询节点这间的相似度有关，和已选文档无关
lambda_mult = 1
# 如果是0的话只考虑多样性，不考虑相关性
lambda_mult = 0

# 指定要选择文档数k
k = 3
# 候选文档列表
doc_vectors = np.array(
    [
        [9, 2],  # 0
        [2, 9],  # 1
        [7, 8],  # 2
        [1, 3],  # 3
        [6, 1],  # 4
    ]
)
# 查询 向量
query_vector = [4, 2]

selected = mmr_select(query_vector, doc_vectors, k=k, lambda_mult=lambda_mult)
print(f"lambda_mult={lambda_mult:.1f},最终选择的文档{[int(s)+1 for s in selected]}")
