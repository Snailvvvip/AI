# 导入CrossEncoder类
from sentence_transformers import CrossEncoder

# 加载预训练的CrossEncoder模型
# 这个模型专门用于计算文本相关性
# 首次运行会自动从HuggingFace下载模型
model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
query = "什么是机器学习"
document1 = "什么是机器学习"
document2 = "美食"
document3 = "机器"
# 1.将查询和文档组成文本对
pair1 = [query, document1]
pair2 = [query, document2]
pair3 = [query, document3]
# 2.使用模型预测相关性分数,分数越同表示越相关，7.268762 6.551426 6.795484
score1 = model.predict(pair1)  # 6.434271
score2 = model.predict(pair2)  # -4.6339407
score3 = model.predict(pair3)  # -1.1985557
print(score1, score2, score3)
