# 导入递归字符型文本分割器
# from langchain_text_splitters import RecursiveCharacterTextSplitter

from smartchain.text_splitters import RecursiveCharacterTextSplitter

# 定义一个需要被切分的长文本
text = (
    "LangChain 文本分割示例。"
    "CharacterTextSplitter 会按固定字符数切分，并可重叠。"
    "适合在构建向量索引前先做简单分片。"
)

# 初始化分割器对象，每块20个字符，块与块之间重叠5个字符
splitter = RecursiveCharacterTextSplitter(
    separators=["\n\n", "\n", " ", ""],
    chunk_size=20,
    chunk_overlap=5,
)

# 执行文本切分操作，返回文本块列表
chunks = splitter.split_text(text)

# 打印原始文本长度
print(f"原文本长度: {len(text)} 字符")
# 打印切分后获得了多少块
print(f"切分得到 {len(chunks)} 块：")
# 逐块打印每一个分片和该分片的字符数
for i, c in enumerate(chunks, 1):
    print(f"片段{i} ({len(c)} 字符): {c}")
