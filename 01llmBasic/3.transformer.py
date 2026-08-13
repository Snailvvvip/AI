from collections import defaultdict

# 1.定义训练语料，每个句子中的词和标点由空格分隔
sentences = [
    "天气 预报 说 长沙 明天 有 暴雨 。",
    "出门 请 携带 雨具 。",
    "这里 是 一座 历史悠久 的 美丽 城市 。",
    "大雨 在 下午 停了 ， 太阳 出来 了 。",
    "后天 大部分 地区 晴朗 温暖 。",
    "强降雨 可能 造成 低洼 地区 洪涝 。",
    "国王 的 女儿 善良 勇敢 。",
    "公主 住 在 森林 附近 的 城堡 里 。",
    "很久 以前 一位 国王 住 在 遥远 的 国度 。",
    "她 每天 喜欢 读书 和 学习 新 知识 。",
]


# 定义分词函数，用于将句子用空格分割成词列表
def split_words(sentence):
    return sentence.split()


# 对每个句子调用分词函数，得到所有的句子的分词结果 -------------------------------------
words_per_sentence = [split_words(sentence) for sentence in sentences]
print("words_per_sentence", words_per_sentence)
# 构建一个集合，用于收集语料中出现过的所有的词(去重)，得到词汇表
all_words = set()
# 遍历每个分词后的句子
for words in words_per_sentence:
    # 遍历句子中的每个词
    for word in words:
        # 将词加到集合中，可以得到去重后的词汇表
        all_words.add(word)
print("all_words", all_words)

# 构建相邻词出现的次数统计: pair_count[当前词][下一个词]=下一个词出现次数  -------------------------------------------
pair_count = defaultdict(lambda: defaultdict(int))
# 遍历所有的分词句子
for words in words_per_sentence:
    # 遍历句子中的每对相邻词 ['天气', '预报', '说', '长沙', '明天', '有', '暴雨', '。']
    for i in range(len(words) - 1):
        # 取出当前词 天气
        current_word = words[i]
        # 取出下一个词 预报
        next_word = words[i + 1]
        # {'天气':{"预报":1},'预报':{'说':1},"说":{'长沙':1}}
        pair_count[current_word][next_word] += 1
print("pair_count", pair_count)
# 构建下一个词出现的条件概率表 next_word_prob[当前词][下一个词]=下一个词出现的概率
next_word_prob = {}
# 遍历每个当前词及其统计映射
# current_word=天气,count_map={"预报":1}
for current_word, count_map in pair_count.items():
    # 统计所有下一个词出现的次数之和
    total = sum(count_map.values())
    # 计算各下一个词出现的概率，组成一个新的字典
    next_word_prob[current_word] = {
        word: count / total for word, count in count_map.items()
    }


# 预测下一个词的函数，根据当前词和概率表返回概率最高的下一个词
def predict_next_word(current_word):
    # 获取当前词对应的下一个词的概率映射 {'天气': {'预报': 0.3, '很': 0.7}}
    prob_map = next_word_prob.get(current_word)
    # 如果没找到就返回 none
    if not prob_map:
        return None
    # 返回概率最大的那一个词，如果概率都一样则优先选句末标号，其次按字典排序
    return max(prob_map.items(), key=lambda item: item[1])[0]


def join_words(words):
    return "".join(words)


# 定义补全句子的函数，根据首词生成完整的句子  ---------------------------------------------------
def complete_sentence(first_word):
    # 检查首词是否出现在词汇表中
    if first_word not in all_words:
        raise ValueError(f"首词[{first_word}]不在词汇表中")
    # 初始化生成的词列表，将首词加入到列表中
    generated_words = [first_word]
    # 初始化当前词为首词
    current_word = first_word
    # 进入生成循环，直到无法继续结束
    while True:
        # 根据当前的词预测下一个词
        next_word = predict_next_word(current_word)
        # 如果无法预测下一个词，跳出循环
        if next_word is None:
            break
        # 将下一个词加入到已生成的词列表中
        generated_words.append(next_word)
        current_word = next_word
    return join_words(generated_words)


# 定义补全句子的起始词，这是选择后天
first_word = "后天"
result_sentence = complete_sentence(first_word)
print("生成的句子", result_sentence)
