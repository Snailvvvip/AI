import numpy as np

vec1 = np.array([6, 0])
vec2 = np.array([6, 0])


def cosine_similarity(a, b):
    # 计算两个向量的点积
    dot_product = np.dot(a, b)
    # 计算a的模长
    norm_a = np.linalg.norm(a)
    # 计算a的模长
    norm_b = np.linalg.norm(b)
    return dot_product / (norm_a * norm_b)


similarity = cosine_similarity(vec1, vec2)
# 越大越相似
print("similarity", similarity)


"""

# 定义计算两个向量之间的欧几里得距离的函数
def euclidean_distance(a, b):
    # 将输入列表a转成numpy数组
    a = np.array(a)
    # 将输入列表b转成numpy数组
    b = np.array(b)
    # 计算欧几里得距离并返回
    return np.sqrt(np.sum((a - b) ** 2))


vec1 = [0, 0, 0]
vec2 = [3, 4, 5]
distance = euclidean_distance(vec1, vec2)
print(distance)
"""
