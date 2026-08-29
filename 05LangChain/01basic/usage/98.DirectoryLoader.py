from pathlib import Path
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from rich import print
from langchain_core.documents import Document

root = Path("kb")
(root / "faq.txt").write_text("发货一般在48小时以内。\n", encoding="utf-8")
(root / "policy").mkdir(parents=True, exist_ok=True)
(root / "policy" / "refund.md").write_text("签收后7日内可退货。\n", encoding="utf-8")
"""
# glob可以直接传列表，一次匹配多种扩展文件
loader = DirectoryLoader(
    str(root),  # 要扫描的根目录
    # 文件匹配模式列表，开头的**表示匹配所有的内容，包括路径分隔符，也表示递归所有的子目录
    glob=["**/*.txt", "**/*.md"],
    # 指定用哪个loader处理匹配到的文件
    loader_cls=TextLoader,
    # 传给loader参数，中文场景下务必指定编码
    loader_kwargs={"encoding": "utf-8"},
    # 显示进度条(大目录的时候比较有用)
    show_progress=True,
    # 单个文件加载失败了，是否跳过
    silent_errors=True,
)
docs = loader.load()
for doc in docs:
    print(doc)



loader = TextLoader("faq.txt", encoding="utf-8")
docs = loader.load()
print("load返回的类型", type(docs).__name__, "数量", len(docs))

stream = loader.lazy_load()
print("lazy_load返回的类型", type(stream).__name__, "数量", len(docs))

for doc in stream:
    print(doc)
for doc in stream:
    print(doc)

import hashlib
from datetime import datetime, timezone


def enrich(doc: Document, path: Path, root: Path):
    ""给一个Document补齐统一的metadata""
    # 统一用相对路径，且转成正斜杠，避免window反斜杠在JSON时被转义
    # relative_to可以把绝对路径转成相对知识库的相对路径
    # rel=policy/refund.md
    rel = path.relative_to(root).as_posix()
    # doc_id 由[相对路径+页码+行号计算，内容更新但位置不变时ID保持稳定]
    # 用get而不是用[]是因为txt里没有page,pdf里没有row
    raw_key = f"{rel}|{doc.metadata.get('page','')}|{doc.metadata.get('row','')}"
    # 取md5的前12位，够短，也好读
    doc_id = hashlib.md5(raw_key.encode()).hexdigest()[:12]
    # update是合并而非覆盖，loader原有的page/total_pages等字段都会保留
    doc.metadata.update(
        {
            "source": rel,  # 用相对路径覆盖掉loader原始路径
            "file_name": path.name,  # 只要文件名，展示引用时比长路径更好
            "file_type": path.suffix.lstrip(
                "."
            ),  # suffix 是带点的 .md,lstrip把左边的.去掉，就是文件类型  md
            "doc_id": doc_id,  # 稳定文档标识
            # 带时区的ISO时间串，可以实现跨机器不歧义
            # timespec="seconds"去掉microsseconds,让时间串更短
            "loaded_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        }
    )
    return doc


# 元数据治理，就是尽量给文档补充丰富的元数据，方便后面使用
root = Path("kb")
target = root / "policy" / "refund.md"
doc = Document(page_content="签收7日内可退货", metadata={"source": str(target)})
doc = enrich(doc, target, root)
print(doc.metadata)  # type: ignore



# re 是 Python 内置的正则表达式模块
import re


def clean_text(text: str) -> str:
    ""轻量清洗：统一换行、压缩空白，但不改动实质内容。""
    # Windows 换行统一成 \n，避免 \r 混进正文
    text = text.replace("\r\n", "\n")
    # 全角空格（U+3000）在中文 PDF 里很常见，换成半角
    text = text.replace("\u3000", " ")
    # 多个空格 / 制表符压成一个空格；[ \t]+ 表示"一个或多个空格或制表符"
    text = re.sub(r"[ \t]+", " ", text)
    # 三个以上连续换行压成两个，保留段落感；\n{3,} 表示"3 个及以上换行"
    text = re.sub(r"\n{3,}", "\n\n", text)
    # 去掉首尾空白
    return text.strip()


# 构造一段包含各种噪声的文本：全角空格、多余空行、制表符、Windows 换行
messy = "第一段　　内容\n\n\n\n第二段\t\t内容   \r\n"
# 用 repr 打印才能看清不可见字符的变化
print(repr(clean_text(messy)))
"""
MIN_CHARS = 10


def inspect(docs: list[Document], expected_files: int):
    "打印加载的文档的质量报告"
    print(f"Document总数:{len(docs)}")
    # 计算覆盖率 有多少个源文件真正产出了内容
    # 用集合去重，因为一个文件可能会产出多个Document （PDF是按页生成Document,CSV是按行生成 Document）
    loaded_files = {d.metadata.get("source") for d in docs}
    print(f"产出内容的文件数:{len(loaded_files)}/预期{expected_files}")

    # 空/过短的Document,通常是扫描件或解析失败
    too_short = [d for d in docs if len(d.page_content.strip()) < MIN_CHARS]
    print(f"内容过短的Document数量是:{len(too_short)}")
    for d in too_short[:5]:
        print(f"- {d.metadata.get('source')} 第 {d.metadata.get('page','-')}")

    if docs:
        # 收集每个Document的字符数
        lengths = [len(d.page_content) for d in docs]
        print(
            f"字符数:最小{min(lengths)},平均{sum(lengths)/len(lengths)},最大{max(lengths)},"
        )


# 演示：混入一个空 Document，看它是否被抓出来
demo_docs = [
    # 正常的一条
    Document(
        page_content="签收 7 日内可无理由退货。", metadata={"source": "refund.md"}
    ),
    # 模拟扫描件产出的空 Document
    Document(page_content="", metadata={"source": "scan.pdf", "page": 0}),
]
# 预期有 2 个源文件
# inspect(demo_docs, expected_files=2)
