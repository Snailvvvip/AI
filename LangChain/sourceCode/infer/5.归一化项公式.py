# 归一化项公式：
b = 0.75
doc_length = 400
avgdl = 200
value = 1 - b + b * (doc_length / avgdl)
print(value)
# 0.625 1.75
# 如果b=0的话 value固定为1
# 如果b=1的话  value值(doc_length / avgdl) 0.1
# 如果b=0.5的话. 0.55
# 如果b=0.75的话. 0.325
# 文档越长，这个数越大

# 饱和度公式
TF = 100000
# k₁（饱和度参数）： 控制饱和速度（通常取1.5）
k1 = 1.5
# k₁ + 1： 分子中的系数，保证初始增长
# TF + k₁： 分母，随着TF增大而增大，导致增长变慢
value = (TF * (k1 + 1)) / (TF + k1)
# k1=0 value= TF/TF=TF 没有任何饱和度的效果
# k1=2 value TF*3/4 1.5
# k1=非常大的话
# k1 = 1.5  1.8181818181818181
# k1 = 2  1.42
# TF = 100000    TF * (k1+1)/TF=k1+1=2.5
print(value)
