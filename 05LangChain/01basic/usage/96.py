# Path 用于跨平台处理文件路径
from pathlib import Path

from langchain_community.document_loaders import TextLoader
from langchain_core.documents import Document

"""
sample = Path("faq.txt")
# sample.write_text("问：发货要多久？\n答：一般 48 小时内发出。\n", encoding="utf-8")
# 构造加载器 第一个参数是文件的路径
loader = TextLoader(str(sample), encoding="utf-8")
# 加载文件返回list[Document]
docs = loader.load()

print("文档的数量", len(docs))
print("正文：", repr(docs[0].page_content))
print("元数据:", repr(docs[0].metadata))



# 造一个 UTF-8 编码的中文文件，这是真实项目里最常见的情况
utf8_file = Path("policy_utf8.txt")
# 用 write_bytes + encode 精确控制字节，避免受系统默认影响
# utf8_file.write_bytes("退换货政策：签收七日内可退。\n".encode("utf-8"))


try:
    TextLoader(str(utf8_file)).load()
except Exception as exc:
    # 外层异常 RuntimeError Error loading policy_utf8.txt
    print("外层异常", type(exc).__name__, exc)
    # 真正原因 UnicodeDecodeError 'gbk' codec can't decode byte 0x80 in position 2: illegal multibyte sequence
    print("真正原因", type(exc.__cause__).__name__, exc.__cause__)



# Path 用于处理路径
from pathlib import Path

# 文本加载器
from langchain_community.document_loaders import TextLoader

# 造两个内容相同但编码不同的文件
utf8_file = Path("policy_utf8.txt")
# UTF-8 版本，代表现在的项目文件
utf8_file.write_bytes("退换货政策：签收七日内可退。\n".encode("utf-8"))
gbk_file = Path("legacy_gbk.txt")
# GBK 版本，模拟老系统 / 旧 Excel 导出的中文文本
gbk_file.write_bytes("退换货政策：签收七日内可退。\n".encode("gbk"))

# 依次尝试各种组合
for label, path, kwargs in [
    # 老文件碰上系统默认，碰巧对上了
    ("GBK 文件 + 不传 encoding", gbk_file, {}),
    # 编码写错，报错
    ("GBK 文件 + encoding=utf-8", gbk_file, {"encoding": "utf-8"}),
    # 编码写对，成功
    ("GBK 文件 + encoding=gbk", gbk_file, {"encoding": "gbk"}),
    # 最常见的真实场景：新文件碰上 GBK 默认
    ("UTF-8 文件 + 不传 encoding", utf8_file, {}),
    # 正确做法
    ("UTF-8 文件 + encoding=utf-8", utf8_file, {"encoding": "utf-8"}),
    # 编码写错，报错
    ("UTF-8 文件 + encoding=gbk", utf8_file, {"encoding": "gbk"}),
]:
    try:
        # ** 把字典展开成关键字参数
        docs = TextLoader(str(path), **kwargs).load()
        # 检查关键词是否还在，用来判断是否乱码
        ok = "退换货政策" in docs[0].page_content
        # :<28 是左对齐补空格，让输出成一列好对比
        print(f"{label:<28} -> {'内容正确' if ok else '乱码'}")
    except Exception as exc:
        # 解码失败会走到这里，只打印异常类型名
        print(f"{label:<28} -> {type(exc).__name__}")
"""


# path要读取的文件路径
# encodings 候选编码，把你项目可能会遇到的编码，按优先级从高到底排列
def load_text_robust(path: Path, encodings=("utf-8", "gbk")):
    """按候选编码依次尝试读取文件的内容，全部失败会报错"""
    # 一次性读成字节，反而会反复尝试解码，避免反复读取文件
    raw = path.read_bytes()
    # 遍历所支持的编码
    for enc in encodings:
        try:
            return Document(
                page_content=raw.decode(enc),  # 使用指定的enc编码解码正文
                metadata={
                    "source": path.as_posix(),
                    "encoding": enc,
                },  # 把实际的编码写入metadata里
            )
        except UnicodeDecodeError:
            continue
    raise ValueError(f"无法解码{path},尝试过:{encodings}")


for enc in ["utf-8", "gbk"]:
    p = Path(f"robust_{enc}.txt")
    # 用指定的编写写入
    p.write_bytes("退换货政策：签收后七日内可退。\n".encode(enc))
    d = load_text_robust(p)
    print(f"{enc}文件->内容={d.page_content.strip()},实际编码={d.metadata['encoding']}")


docs = TextLoader("faq.txt", autodetect_encoding=True).load()
