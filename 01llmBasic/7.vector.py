import os
import numpy as np
from sentence_transformers import SentenceTransformer

"""
model = SentenceTransformer(
    "C:/Users/rensh/.cache/modelscope/hub/models/BAAI/bge-small-zh-v1___5"
)
text_a = "我喜欢吃苹果"
text_b = "梨是很好吃的水果"
text_c = "篮球打起来很过瘾"


def cosine_similarity(a, b):
    # 计算两个向量的点积
    dot_product = np.dot(a, b)
    # 计算a的模长
    norm_a = np.linalg.norm(a)
    # 计算a的模长
    norm_b = np.linalg.norm(b)
    return dot_product / (norm_a * norm_b)


vectors = model.encode([text_a, text_b, text_c])
vec_a, vec_b, vec_c = vectors[0], vectors[1], vectors[2]
ab = cosine_similarity(vec_a, vec_b)
print("a vs b ", round(ab, 4))
ac = cosine_similarity(vec_a, vec_c)
print("a vs c ", round(ac, 4))

# 在导入 sentence_transformers 之前设置
os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"
# 还有一种办法就是先本地加载好，然后再指定本地路径

text = "苹果很甜"
vector = model.encode(text)
print(f"文本:{text}")
print(f"dimension:{len(vector)}")
print(f"vector:{vector}")

"""


# 导入 numpy 库用于数学计算
import numpy as np

# 定义一个向量
vector = np.array([3, 4])

# 方法1：使用 numpy 的 linalg.norm 函数计算模长
norm_v1 = np.linalg.norm(vector)
print(f"方法1（使用norm）: {norm_v1}")

# 方法2：手动计算模长
# 先计算每个元素的平方
squared = vector**2
print(f"各元素平方: {squared}")
# 求和
sum_squared = np.sum(squared)
print(f"平方和: {sum_squared}")
# 开平方根
norm_v2 = np.sqrt(sum_squared)
print(f"方法2（手动计算）: {norm_v2}")

# 验证：3² + 4² = 9 + 16 = 25，√25 = 5
print(f"验证: 3² + 4² = {3**2 + 4**2}, √{3**2 + 4**2} = {norm_v2}")

# 可视化：在二维坐标系中，向量 [3, 4] 的长度就是 5
print(f"\n在二维坐标系中，从原点到点 (3, 4) 的距离是: {norm_v1}")
