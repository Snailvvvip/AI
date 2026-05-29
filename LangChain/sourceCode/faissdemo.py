# 导入必要的库
import numpy as np
import faiss

# 设置随机种子，确保结果可重复
np.random.seed(42)

# 准备数据
# d: 向量维度（每个向量有多少个数字）
d = 64
# nb: 数据库中的向量数量
nb = 1000
# nq: 查询向量的数量
nq = 5

# 生成随机向量作为数据库
# 形状：(1000, 64) 表示1000个向量，每个向量64维
xb = np.random.random((nb, d)).astype("float32")

# 生成随机向量作为查询
# 形状：(5, 64) 表示5个查询向量，每个向量64维
xq = np.random.random((nq, d)).astype("float32")

print(f"数据库向量形状: {xb.shape}")
print(f"查询向量形状: {xq.shape}")

# 创建索引
# IndexFlatL2: 使用 L2 距离（欧氏距离）的精确搜索索引
index = faiss.IndexFlatL2(d)

# 查看索引中的向量数量（初始为0）
print(f"\n初始索引向量数: {index.ntotal}")

# 将数据库向量添加到索引中
index.add(xb)

# 再次查看索引中的向量数量
print(f"添加后索引向量数: {index.ntotal}")

# 执行搜索
# k: 返回最相似的 k 个向量
k = 4
# search 方法返回两个结果：
# D: 距离矩阵（每个查询向量与最相似向量的距离）
# I: 索引矩阵（每个查询向量对应的最相似向量在数据库中的索引）
D, I = index.search(xq, k)

print(f"\n距离矩阵形状: {D.shape}")  # (5, 4) 表示5个查询，每个返回4个结果
print(f"索引矩阵形状: {I.shape}")  # (5, 4)

# 显示搜索结果
print("\n搜索结果:")
for i in range(nq):
    print(f"\n查询 {i+1}:")
    print(f"  查询向量: {xq[i][:5]}...")  # 只显示前5个数字
    print(f"  最相似的 {k} 个向量:")
    for j in range(k):
        idx = I[i][j]  # 数据库中的索引
        dist = D[i][j]  # 距离
        print(f"    {j+1}. 索引 {idx}, 距离 {dist:.4f}")

# 二维
d = 2
# 准备插入索引库中的向量数
nb = 10
# 查询向量数2
nq = 5
# 向量库里的数据10条
xq = [
    [1, 1],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [6, 2],
    [7, 2],
    [8, 2],
    [9, 2],
    [10, 2],
]
# 查询2个向量在索引库中的对应的相似的向量
xq = [[1, 2], [7, 8]]
k = 3
D, I = index.search(xq, k)
# 查询向量对应查询结果之间的距离
D = [
    [1, 3, 5],
    [2, 4, 6],
]
# 查询向量对应查询结果的索引
I = [
    [0, 1, 2],
    [],
]
