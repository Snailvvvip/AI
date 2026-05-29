"""
# class BaseMessage:
#    def __str__(self):
#        return "__str__"
#
#    def __repr__(self):
#        return "__repr__"
#
#
# baseMesage = BaseMessage()
# print(baseMesage)
# print(repr(baseMesage))

import re

pattern = r"\{([^}:]+)(?::[^}]+)?\}"
template = "你好，我叫{name},你是{it:OpenAI}吗？你认识{name}吗？"
matches = re.findall(pattern, template)


template = "你好，我叫{name},你是{it:OpenAI}吗？"
# KeyError: 'it'
result = template.format(name="zs", it="openai")
print(result)


globalVar = 1


class PromptTemplate:
    @classmethod
    def from_template1(cls, template: str):
        return template

    @staticmethod
    def from_template2(template: str):
        globalVar += globalVar
        return template


# promptTemplate = PromptTemplate()
# print(promptTemplate.from_template("temp"))
print(PromptTemplate.from_template1("temp"))
print(PromptTemplate.from_template2("temp"))


class Utils:
    @classmethod
    @staticmethod
    def add(a, b):
        return a + b





kwargs = {"name": "小助"}
# fstring python内置方法
print(template.format(**kwargs))


import re


def format(template: str, **kwargs):
    def replace_match(match):
        expr = match.group(1).strip()
        return str(kwargs[expr])

    pattern = r"\{([^{}]+)\}"
    return re.sub(pattern, replace_match, template)


template = "我叫{name},今年{age}岁了"
print(format(template, name="小张", age=18))


history = [3, 4, [5, 6]]
template = [1, 2]

# result = [1, 2, 3, 4]

# template.append(history)
# print(template)
# template.extend(history)
# print(template)

print(template.extend(history))
print(template)


class SystemMessage:
    pass


class HumanMessage:
    pass


class AIMessage:
    pass


systemMessage = SystemMessage()

print(isinstance(systemMessage, (SystemMessage, HumanMessage, AIMessage)))

values = {"question": "1 [烟花] 1 等于多少?", "answer": "答案是2"}
print("示例问题:{question},示例回答:{answer}".format(**values))

print(
    "示例问题:{question},示例回答:{answer}".format(
        question="1 [烟花] 1 等于多少?", answer="答案是2"
    )
)


arr = ["A", "B"]


def add(a, b):
    return a + b


print(add(*arr))
print(add("A", "B"))


listA = [1, 2, 3, 4, 5]
listB = [3, 4, 5, 6, 7]
diff = list(set(listA) - set(listB))
print(diff)


# 导入必要的模块
from abc import ABC, abstractmethod


# 定义抽象基类，继承自 ABC
class Animal(ABC):
    # 使用 @abstractmethod 装饰器标记抽象方法
    # 子类必须实现这个方法
    @abstractmethod
    def make_sound(self):
        pass

    # 另一个抽象方法
    @abstractmethod
    def move(self):
        pass


# 正确实现：实现了所有抽象方法
class Dog(Animal):
    def make_sound(self):
        return "Woof!"

    def move(self):
        return "Running on four legs"


# 错误实现：只实现了部分抽象方法
class Bird(Animal):
    def make_sound(self):
        return "Chirp!"

    # 缺少 move() 方法，会报错


animal = Animal()



def get_text_length(text):
    print(text.split())
    return len(text.split())


print(get_text_length("hello world"))

import re

text = "1 plus 1等于多少？"
print(len(re.split(r"\s+", text.strip())))
import jieba

words = jieba.cut(text)
list = [word for word in words if word.strip()]
print(len(list))



# 导入 tiktoken 库
import tiktoken

# 获取名为 "cl100k_base" 的编码器（GPT-4 使用的编码方式之一）
encoder = tiktoken.get_encoding("cl100k_base")
#13*4+6
#52+6=58
# 70-58=12
# 定义要编码的字符串
text = "8 plus 7 等于多少?"
# 使用编码器对文本进行编码，得到 token 列表
tokens = encoder.encode(text)
# 计算 token 的数量
token_count = len(tokens)
print(token_count)
tokens = [encoder.decode_single_token_bytes(token) for token in tokens]
print(tokens)
tokens = [token for token in tokens if token.strip()]
print(tokens)
print(len(tokens))
# 打印 token 的总数
# print(f"Token数量: {token_count}")
# 打印每个 token 的编号（整数表示）
# print(f"Tokens: {tokens}")
# 打印每个 token 对应的原始字节内容
# print(
#    f"Token对应文本: {[encoder.decode_single_token_bytes(token) for token in tokens]}"
# )


import tiktoken

encoder = tiktoken.get_encoding("cl100k_base")
text = "8 plus 7等于多少?"
tokens = encoder.encode(text)
print(f"Token IDS:{tokens}")

token_strings = []
for token in tokens:
    # decode_single_token_bytes 返回的是bytes,需要解码 把token的id转成字节数组
    token_bytes = encoder.decode_single_token_bytes(token)
    try:  # 字节数组转成字符串
        token_str = token_bytes.decode("utf-8")
    except:
        token_str = str(token_bytes)
    token_strings.append(token_str)
print(f"token_strings:{token_strings}")
print(f"length:{len(token_strings)}")

#  λ 0-1之间
# λ=1 只看相关性 只看候选节点和查询节点之间的余弦相似度 越相关分数越高
# λ=0 只看相似度 只看候选节点和已选节点之间的余弦相似度 越相似分数越低
# λ=0.3 30%和相关性有关，70%和相似度有关
# MMR = λ × 相关性 - (1-λ) × 相似度
# 相关性指的是候选节点和查询节点之间的余弦相似度
# 相似度指的是候选节点和已选节点之间的余弦相似度





doc_vectors = np.array(["A", "B", "C", "D"])
selected = np.array([1, 2])
selected_vecs = doc_vectors[selected]
print(selected_vecs)




quer_similarities = np.array([1, 2, 5, 7, 8, 3, 9, 3])

selected = np.argmax(quer_similarities)
print([selected])


import numpy as np

doc_vectors = np.array(["A", "B", "C", "D", "E"])
selected = np.array([1, 2])
selected_vecs = doc_vectors[selected]  # - S：选择的结果集
print(selected_vecs)  # ['B','C']
# 计算当前文档与所有的已选文档的余弦相似度
doc_vector="E"
sims = cosine_similarity(doc_vector, selected_vecs)


values = {"B": "ValueB", "A": "ValueA", "C": "ValueC"}
keys = sorted(values)
print(keys)
values = [values[item] for item in keys]
print(values)


dict = {
    "question": "哪些水果适合夏天吃？",
    "answer": "西瓜、哈密瓜、桃子、李子等含水分高的水果特别适合夏天食用。",
}
print(" ".join(dict.values()))
#  embeddings,  # 嵌入模型 是向量模型而非向量的值


print([{}] * 10)


examples = [
    {
        "question": "如何挑选新鲜的水果？",
        "answer": "观察外皮是否光滑、色泽是否自然，还可以闻闻香味，挑选表皮无破损的新鲜水果。",
    },
]
texts = [
    "如何挑选新鲜的水果？ 观察外皮是否光滑、色泽是否自然，还可以闻闻香味，挑选表皮无破损的新鲜水果。"
]
metadatas = [
    {
        "question": "如何挑选新鲜的水果？",
        "answer": "观察外皮是否光滑、色泽是否自然，还可以闻闻香味，挑选表皮无破损的新鲜水果。",
    }
]
embedding_values = [[0.1, 0.2, 0.3]]
(text, metadata, embedding) = (
    "如何挑选新鲜的水果？ 观察外皮是否光滑、色泽是否自然，还可以闻闻香味，挑选表皮无破损的新鲜水果。",
    {
        "question": "如何挑选新鲜的水果？",
        "answer": "观察外皮是否光滑、色泽是否自然，还可以闻闻香味，挑选表皮无破损的新鲜水果。",
    },
    [0.1, 0.2, 0.3],
)


# 导入 faiss 库
import faiss

# 打印 FAISS 版本信息
print(f"FAISS 版本: {faiss.__version__}")

# 测试基本功能：创建一个简单的索引
d = 64  # 向量维度
index = faiss.IndexFlatL2(d)  # 创建 L2 距离索引
print(f"索引创建成功！向量维度: {d}")


# index索引库中的真实索引
index = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
query_embedding = [5, 6]
fetch_k = 5
candidate_indices = [1, 3, 5, 7, 8]
k = 3
candidate_vectors = [[1, 1], [3, 3], [5, 5], [7, 7], [8, 8]]
selected_indices = [1, 2, 3]

# doc_ids = 3 5 7



# uv add langchain-huggingface
from langchain_huggingface import HuggingFaceEmbeddings

model_path = "./models/all-MiniLM-L6-v2"
# 创建 HuggingFaceEmbeddings 实例
embeddings = HuggingFaceEmbeddings(
    model_name=model_path, model_kwargs={"device": "cpu"}
)

# 单个查询文本嵌入
query_text = "什么是人工智能？"
query_embedding = embeddings.embed_query(query_text)
print(f"查询嵌入前5维: {query_embedding[:5]}")






# 导入os模块，用于读取环境变量
import os

# 导入requests库，用于发送HTTP请求
import requests

# 设置文本向量API的URL
VOLC_EMBEDDINGS_API_URL = "https://ark.cn-beijing.volces.com/api/v3/embeddings"
# 设置API密钥
VOLC_API_KEY = "d52e49a1-36ea-44bb-bc6e-65ce789a72f6"


# 定义获取文档向量的函数，参数为文档内容
def get_doubao_embedding(doc_content):
    # 构造请求头，包含内容类型和认证信息
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {VOLC_API_KEY}",
    }
    # 构造请求体，指定模型和输入内容
    payload = {"model": "doubao-embedding-text-240715", "input": doc_content}
    # 发送POST请求到向量API，获取响应
    response = requests.post(VOLC_EMBEDDINGS_API_URL, json=payload, headers=headers)
    # 判断响应状态码是否为200，表示请求成功
    if response.status_code == 200:
        # 解析响应的JSON数据
        data = response.json()
        # 提取嵌入向量
        embedding = data["data"][0]["embedding"]
        # 返回嵌入向量
        return embedding
    else:
        # 如果请求失败，抛出异常并输出错误信息
        raise Exception(f"Embedding API error: {response.text}")


# 定义待处理的文档内容
doc_content = "这是一个示例文档"
# 调用函数获取嵌入向量
embedding = get_doubao_embedding(doc_content)
# 打印嵌入向量
print(embedding)


# 说明：导入 SentenceTransformer 类
from sentence_transformers import SentenceTransformer

# 说明：尝试加载一个轻量级模型进行测试
# "all-MiniLM-L6-v2" 是一个小型的通用模型，适合快速测试
# 首次运行时会自动下载模型（可能需要一些时间）
print("正在加载模型进行测试...")
model = SentenceTransformer("./models/all-MiniLM-L6-v2")

# 说明：对一个简单的句子进行编码测试
sentence = "这是一个测试句子"
embedding = model.encode(sentence)

# 说明：检查嵌入向量的形状
print(f"安装成功！嵌入向量维度：{embedding.shape}")
print(f"前 5 个维度值：{embedding[:5]}")


set1 = set()
set1.add(1)
set1.add(2)
set1.add(3)
set1.add(4)

set2 = set()
set2.add(2)
set2.add(3)
set2.add(4)
set2.add(5)
# 求两个集合交集的元素数量
print(len(set1 & set2))



import re
import json

text = ' ```json\n noise {"product": sss "手机",\n "price": 3999, \n"in_stock": true}  other noise \n``` '
# text = '{"product": "手机",\n "price": 3999, \n"in_stock": true}'
# 去除首尾空格
# text = text.strip()
# json_match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
# print(json_match.groups())
# if json_match:
#    text = json_match.group(1).strip()
# text =  noise {"product": "手机",\n "price": 3999, \n"in_stock": true}  other noise
# text noise [1,2,3]
json_match = re.search(r"(\{.*\}|\ [.*\ ])", text, re.DOTALL)
if json_match:
    text = json_match.group(1).strip()
json_dict = json.loads(text)
print(json_dict)



class BooleanOutputParser:
    def __init__(self):
        # object.__setattr__(self, "trueValue", "YES")
        # object.__setattr__(self, "falseValue", "NO")
        self.trueValue = "YES"
        self.falseValue = "NO"

    def parse(self):
        print(self.trueValue)
        print(self.falseValue)


booleanOutputParser = BooleanOutputParser()
booleanOutputParser.parse()


str = "hello"
d = {"name": "张三"}
print(hasattr(str, "__iter__"))
print(hasattr(d, "__iter__"))
print(hasattr(str, "__iter__") and hasattr(str, "__next__"))
print(hasattr(d, "__iter__") and hasattr(d, "__next__"))


def some():
    pass


print((lambda x: x + 1).__name__)



def inner():
    yield 1
    yield 2
    yield 3


def outer():
    yield "a"
    yield from inner()
    yield "c"


result = outer()
for item in result:
    print(item)


from langchain_core.output_parsers import BaseOutputParser
from pydantic import BaseModel, Field


class BooleanOutputParser(BaseOutputParser):
    true_values: list = Field(..., min_length=1, max_length=50, description="真值")

    @property
    def false_values(self):
        return ["FALSE", "NO", "否", "N", "0"]

    def parse(self):
        print(self.true_values)
        print(self.false_values)


booleanOutputParser = BooleanOutputParser(true_values=["TRUE", "YES", "是", "Y", "1"])
print(booleanOutputParser.true_values)
print(booleanOutputParser.false_values)
booleanOutputParser.parse()
# 1. true_values: list = Field(..., min_length=1, max_length=50, description="真值")
# 2.@property
#    def false_values(self):
#        return ["FALSE", "NO", "否", "N", "0"]
# 3.object.__setattr__(self, "true_values", ["TRUE", "YES", "是", "Y", "1"])



class RunnableSequence:
    def __init__(self, runnables):
        self.runnables = runnables

    def __or__(self, other):
        return RunnableSequence(self.runnables + [other])


class RunnableA:
    def __or__(self, other):
        return RunnableSequence([self, other])


class RunnableB:
    def __or__(self, other):
        return RunnableSequence([self, other])


class RunnableC:
    def __or__(self, other):
        return RunnableSequence([self, other])


runnableA = RunnableA()
runnableB = RunnableB()
runnableSequence = runnableA | runnableB
print(runnableSequence.runnables)
runnableC = RunnableC()
runnableSequence = runnableSequence | runnableC
print(runnableSequence.runnables)


def inner():
    yield 1
    yield 2
    yield 3


def outer():
    yield "a"
    yield from inner()
    yield "c"


result = outer()
for item in result:
    print(item)



class Person:
    __slots__ = ("name", "age")

    def __init__(self, name, age):
        self.name = name
        self.age = age


p = Person("Alice", 25)
print(p.name)
print(p.age)
# AttributeError: 'Person' object has no attribute 'email'
# 尝试添加未在__slots__中规定的属性的会报错
p.email = "alice@qq.com"
print(p.email)



class RunnableBranch:
    def __init__(self, *branches):
        print(len("123"))
        print(len([1, 2, 3]))
        print(len((1, 2, 3)))
        print(len({"a": 1}))
        set1 = set()
        set1.add(1)
        print(len(set1))
        print(branches, type(branches))


RunnableBranch((1, 2), (3, 4), (3, 4))



exponential_jitter_params = {"initial": 2}
# 初始延迟
initial = exponential_jitter_params.get("initial", 0)
# 最大延迟
max_wait = exponential_jitter_params.get("max_wait", 10.0)
# 幂指数基数
exp_base = exponential_jitter_params.get("exp_base", 2.0)
# 抖动范围
jitter = exponential_jitter_params.get("jitter", 10.0)
attempt = 1
delay = min(max_wait, initial * (exp_base ** (attempt - 1)))
print(delay)
attempt = 2
delay = min(max_wait, initial * (exp_base ** (attempt - 1)))
print(delay)
attempt = 3
delay = min(max_wait, initial * (exp_base ** (attempt - 1)))
print(delay)
attempt = 4
delay = min(max_wait, initial * (exp_base ** (attempt - 1)))
print(delay)
import random

# 这句话的意思是在0到jitter之间随机生成一个延迟的时间
# uniform指的是在一个区间[a,b] 生成一个随机浮点数
delay = random.uniform(0, jitter)
print(delay)


query_embedding = None
# if query_embedding is not None:
if query_embedding:
    print("true")
else:  # 0 [] () set() '' None Flase
    print("false")



from pydantic import BaseModel, Field
from langchain_core.tools import BaseTool


class AddInput(BaseModel):
    # ...代表此字段必须提供
    a: int = Field(..., description="被加数")
    b: int = Field(..., description="加数")


# a Field required [type=missing,
input = AddInput(b=2)
print(input)



sig = signature(add)
# print(sig)
# print(sig.parameters)
# print(Parameter.empty)
# for param_name, param in sig.parameters.items():
#    print(param_name, param, param.annotation, param.default)

fields = {"a": (int, Field(...)), "b": (str, Field(default=5))}
AddInput = create_model(f"addInput", **fields)
print(AddInput.model_fields)
print(AddInput.model_fields.keys())


from inspect import signature, Parameter
from pydantic import BaseModel, Field, create_model


class AddInput(BaseModel):
    a: int = Field(..., description="被加数")
    b: int = Field(..., description="加数")


input_dict = {"a": 3, "b": 4}
try:
    # b Input should be a valid integer
    validated = AddInput(**input_dict)
    print(validated, type(validated))
    model = validated.model_dump()
    print(model, type(model))
except Exception as e:
    print(e)




from langchain_core.tools import tool


@tool
def add(a: int, b: int) -> int:
    return a + b


import math

print(math.log(10))  # 自然对数（以 e 为底）
print(math.log10(10))  # 常用对数（以 10 为底）
print(math.log(3 / (3 + 1)))
# 次数多的反而对数是0 这是对的，我们主是这样设计的
# 出现的次数越多，说明这个词越普通，越不具备区分度，分数就越低


import numpy as np

# 这个是5个文档相似度的分数
similarities = np.array([0.3, 0.8, 0.5, 0.9, 0.2])
print(similarities)
# argssort()返回的是索引，而不是值
sorted_indices_asc = np.argsort(similarities)
# [0.2,0.3,0.5,0.8,0.9]
# [4,0,2,1,3]
print(f"升序排序后索引", sorted_indices_asc)
# [::-1]是切片语法，表示反转整个数组
sorted_indices_desc = sorted_indices_asc[::-1]
print(f"反序排序后索引", sorted_indices_desc)



def default_preprocessing_func(text: str):
    return text.split()


print(default_preprocessing_func("人工智能正推动机器人自主学习与创新。"))


# 68.92混合相似度 74.59关键词相似度 55.67向量相似度
full_text = 74.59
full_text_weight = 0.7

vector = 55.67
vector_weight = 0.3

# 那么披萨店的 RRF 分数 = 0.5/(60+1) + 0.5/(60+2) = 0.0082 + 0.0081 = 0.0163

score = 0.3 / (60 + 1) + 0.7 / (60 + 1)
print(score * 100)


import numpy as np

documents = [1, 2, 3, 4, 5]


# arang是numpy中用于创建 等差数列的函数
included_idxs = np.arange(len(documents))
print(included_idxs)  # [0 1 2 3 4]
similarity_threshold = 2.5
similarities = [1, 2, 3, 4, 5]
similar_enough = similarities[included_idxs] > similarity_threshold
print(similar_enough)
included_idxs = included_idxs[similar_enough]
print(included_idxs)
"""

# 交叉编码器 重排序
doc1 = {"id": 1, "score": 1}
doc2 = {"id": 2, "score": 2}
doc3 = {"id": 3, "score": 3}
documents = [doc1, doc2, doc3]
# 我要对它重排序，重新排序
# 用什么依据进行重排序？
# 交叉编码器是用来计算相关性的分数的一个方法，最终是靠方法计算的结果来重新排序
q = 3

pairs = [(q, doc1), (q, doc2), (q, doc3)]
# 最相关性就分数就是求q和doc的score差的绝对值，越大分数越大
pairs = [2, 1, 0]
