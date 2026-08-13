import tiktoken

"""
print(tiktoken.__version__)
# 按模型名获取对应的编码器 gpt-4o 用的编码器是o200k_base
enc = tiktoken.encoding_for_model("gpt-4o")
# 把文本编码为token列表
tokens = enc.encode("hello world")
#  hello 对应的数字编号 24912
#  world 对应的数字编号 2375
print("tokens", tokens)
print("tokens数量", len(tokens))


def count_tokens(text: str, model: str = "gpt-4o") -> int:
    enc = tiktoken.encoding_for_model(model)
    return len(enc.encode(text))


prompt = "请用三句话介绍什么是Python"
print("token数量", count_tokens(prompt))




def count_message_tokens(messages: list, model: str = "gpt-4o") -> int:
    enc = tiktoken.encoding_for_model(model)
    # 每条消息都有固定的格式开销
    tokens_per_message = 3
    total = 0
    for message in messages:
        total += tokens_per_message
        for key, value in message.items():
            total += len(enc.encode(value))
    return total


messages = [
    {
        "role": "system",
        "content": "你是一位资深的旅游顾问，擅长为不同的需求的客户规划个性化的行程",
    },
    {
        "role": "user",
        "content": "我想明年春天去北京旅游，有什么推荐的景点吗",
    },
]
print("message的prompt token数量约为", count_message_tokens(messages))
"""
from deepseek_tokenizer import ds_token

text = "你是谁?"
# enc = tiktoken.encoding_for_model("gpt-4o")
# tokens = enc.encode("hello world")
# print("tokens", tokens)
# print("len", len(tokens))
# print("====")
tokens = ds_token.encode(text)
print("tokens", tokens)
print("len", len(tokens))

print("解码", ds_token.decode(tokens))


# -*- coding: utf-8 -*-
# 说明：导入 tiktoken
import tiktoken

# 说明：导入 DeepSeek 官方分词器
from deepseek_tokenizer import ds_token

# 说明：对比用的短文本
text = "你是谁?"

# 说明：用 tiktoken（OpenAI 编码，不能用于 DeepSeek 计费）
tiktoken_count = len(tiktoken.get_encoding("cl100k_base").encode(text))

# 说明：用 DeepSeek 官方分词器
deepseek_count = len(ds_token.encode(text))

# 说明：打印对比结果
print(f"文本：{text!r}")
print(f"tiktoken (cl100k_base)：{tiktoken_count} tokens  ← OpenAI 用")
print(f"deepseek_tokenizer：    {deepseek_count} tokens  ← DeepSeek 用")
print("Chat API prompt_tokens 还会再加消息格式开销，以 usage 为准")


# ticktoken存储的不是简单的从token到汉字的映射,是一个更复杂的，基于字节的分词规则表
# 在它里面的确有一个映射，tokenId到文本片段的映射，但是这个文本片段并不一定是一个汉字，也不定是一个单词
# cl100k_base 里有100000个token,每个token对应一个数字编号

# 原理
# 分词的背后原理BPE(Byte-Pair Encoding) 字节对编码，核心分二步
# 1. 从字节出发，先把所有的许可证 按UTF-8编码拆成最原始的字节，一个汉字占3个字节
# 2.高频合并 统计所有的语料相邻字节对(byte pairs)出现的频率,把最高频的合并成新的token ，不断迭代，直到词表满了为止
# [hello,world,hello,world]
# hello  w o r l d he l l o  w o r l d
