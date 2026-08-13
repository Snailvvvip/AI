# 导入递归字符型文本分割器
# from langchain_text_splitters import TokenTextSplitter

from smartchain.text_splitters import TokenTextSplitter
import tiktoken

# 定义一个需要被切分的长文本
text = (
    "LangChain 文本分割示例。"
    "CharacterTextSplitter 会按固定字符数切分，并可重叠。"
    "适合在构建向量索引前先做简单分片。"
)
# token不是单词，也不是字符，而是一种介于字符和单词之间一种分割方法
# playing 是一个单词， 按字符分 p l a  y i n g ,如果按token play,ing
# 初始化分割器对象，每块20个token，块与块之间重叠5个字符
splitter = TokenTextSplitter(
    chunk_size=20,  #  每块是20个token
    chunk_overlap=5,  # 重叠5个token
    encoding_name="cl100k_base",
)

# 执行文本切分操作，返回文本块列表
chunks = splitter.split_text(text)
# 获取编码器
encoding = tiktoken.get_encoding("cl100k_base")

# 打印原始文本长度
print(f"原文本长度: {len(encoding.encode(text))} token")
# 打印切分后获得了多少块
print(f"切分得到 {len(chunks)} 块：")
# 逐块打印每一个分片和该分片的字符数
for i, c in enumerate(chunks, 1):
    print(f"片段{i} ({len(encoding.encode(c))} tokens): {c}")
