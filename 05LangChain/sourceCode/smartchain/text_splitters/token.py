from .base import TextSplitter
import re
import tiktoken
from dataclasses import dataclass


# 使用dataclass装饰器并声明一个不可变的数据类Tokenizer
@dataclass(frozen=True)
class Tokenizer:
    tokens_per_chunk: int  # 每个块多少个Token  20
    chunk_overlap: int  # 不同块这间的重叠5 token数量
    encode: callable  # 编码方法，接收str返回list[int]
    decode: callable  # 解码方法 接收list[int]返回str


def split_text_on_tokens(text, tokenizer):
    # 使用分词器将文本切分为多个块
    splits = []
    # 使用分词器编码文本，得到token id列表
    input_ids = tokenizer.encode(text)
    # 起始索引为0
    start_idx = 0
    # 循环遍历输入token
    while start_idx < len(input_ids):
        # 计算当前块的结束索引，不能超过总长度
        end_idx = min(start_idx + tokenizer.tokens_per_chunk, len(input_ids))
        # 获取当前分块的token id 子列表
        chunk_ids = input_ids[start_idx:end_idx]
        if not chunk_ids:
            break
        # 解码分块为字符串
        decoded = tokenizer.decode(chunk_ids)
        if decoded:
            splits.append(decoded)
        if end_idx == len(input_ids):
            break
        # 下一步的索引 向前滑动tokens_per_chunk也就20个token，再向后退chunk_overlap5个token
        start_idx += tokenizer.tokens_per_chunk - tokenizer.chunk_overlap
    return splits


# 定义 TokenTextSplitter 类，用于按 token 数量切分文本
class TokenTextSplitter(TextSplitter):
    def __init__(self, encoding_name, **kwargs):
        super().__init__(**kwargs)
        # tiktoken 是 OpenAI 提供的一个高效文本分词（tokenization）库，能够将文本按照 GPT 等语言模型所使用的编码规则精准分割为 tokens
        self._tokenizer = tiktoken.get_encoding(encoding_name)

    def split_text(self, text):
        tokenizer = Tokenizer(
            tokens_per_chunk=self._chunk_size,
            chunk_overlap=self._chunk_overlap,
            encode=self._tokenizer.encode,  # 把字符串变成token编号列表
            decode=self._tokenizer.decode,  # 把token编号列表转回字符串
        )
        return split_text_on_tokens(text=text, tokenizer=tokenizer)
