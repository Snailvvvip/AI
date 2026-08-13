from collections import defaultdict

"""
# 这是一个嵌套的默认字典，用于实现两层键值对的结构


d = {}
# 取字典中的某个key的值，如果key不存在则返回默认值0
# print(d.get("a", 0))
# print(d["a"])

# d = defaultdict(int)
# print(d["a"])
# lambda是匿名函数，是一个无参数的匿名函数，作用是返回一个新的defaultdict(int)
# lambda:defaultdict(int) 等价于 def f(): return defaultdict(int)  无参数，返回内层字典
pair_count = defaultdict(lambda: defaultdict(int))

# 错误：defaultdicts 要求传入一个可调用对象(函数) first argument must be callable
# 因为要保证每次访问不存在的key的时候都要返回新的字典
# int本身主是一个函数，所以可以直接传给defaultdict
pair_count = defaultdict(int)


# 外层 defaultdict 默认值 defaultdict(int) 访问不存在的key时，会自动创建内层字典
# 内层 defaultdict  默认值是0(int) 访问不存在的key时，默认值是为

pair_count = {"user1": {"apple": 3, "banana": 2}, "user2": {"apple": 5, "banana": 1}}


print(type(int), int())

pair_count = {"国王": {"的": 1, "住": 1}, "地区": {"晴朗": 1, "洪涝": 1}}


pair_count = {"天气": {"预报": 1, "很": 1}}
print(pair_count)
next_word_prob = {}
for current_word, count_map in pair_count.items():
    # 统计所有下一个词出现的次数之和
    total = sum(count_map.values())
    print(total)
    next_word_prob[current_word] = {
        word: count / total for word, count in count_map.items()
    }
    print(next_word_prob)

next_word_prob = {"天气": {"预报": 0.3, "很": 0.7}}
prob_map = next_word_prob.get("天气")  # {"预报": 0.5, "很": 0.5}
for item in prob_map.items():
    print(item)
# max本身是取最大值，它是从可迭代对象中找到最大的那个元素
orders = max(prob_map.items(), key=lambda item: item[1])
print(orders)
print(orders[0])

# max(prob_map.items(), key=lambda item: item[1])[0]
"""
