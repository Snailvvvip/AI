# 让类型注解里可以直接写 list[Document] 这种新语法（兼容旧 Python）
from __future__ import annotations

# hashlib 用于计算 doc_id
import hashlib

# json 用于写 jsonl
import json
from rich import print

# re 用于文本清洗
import re

# 生成带时区的摄入时间
from datetime import datetime, timezone
from langchain_core.documents import Document

# Path 统一处理路径
from pathlib import Path
from langchain_community.document_loaders import (
    # CSV，按行产出
    CSVLoader,
    # Word，整篇 1 个
    Docx2txtLoader,
    # PDF，按页产出
    PyPDFLoader,
    # 纯文本 / Markdown
    TextLoader,
)

# 要扫描的知识库目录
DOCS_DIR = Path("docs")
MIN_CHARS = 10
# 摄入结果输出文件，一行一个 Document 的 JSON
OUTPUT_FILE = Path("ingested.jsonl")
# 扩展名 → loader 工厂。新增格式只要在这里加一行
# 用 lambda 而不是直接放类，是因为不同 loader 需要的参数不一样
LOADERS = {
    # txt 和 md 都是纯文本，用同一个 loader
    ".txt": lambda p: TextLoader(str(p), encoding="utf-8"),
    # Markdown 当纯文本读，结构信息留给第 13 章处理
    ".md": lambda p: TextLoader(str(p), encoding="utf-8"),
    # PDF 按页产出，不需要 encoding 参数
    ".pdf": lambda p: PyPDFLoader(str(p)),
    # Word 只支持 .docx
    ".docx": lambda p: Docx2txtLoader(str(p)),
    # CSV 按行产出，中文必须指定编码
    ".csv": lambda p: CSVLoader(str(p), encoding="utf-8"),
    # ".xlsx": lambda p: ExcelLoader(str(p), encoding="utf-8"),
}


def clean_text(text: str) -> str:
    """轻量清洗：只去格式噪声，不改信息内容（§8.2）。"""
    # 统一换行符，去掉 \r
    text = text.replace("\r\n", "\n")
    # 全角空格转半角
    text = text.replace("\u3000", " ")
    # 压缩连续空格与制表符
    text = re.sub(r"[ \t]+", " ", text)
    # 三个以上换行压成两个，保留段落结构
    text = re.sub(r"\n{3,}", "\n\n", text)
    # 去掉首尾空白后返回
    return text.strip()


def enrich(doc: Document, path: Path, root: Path) -> Document:
    """清洗正文并补齐统一 metadata（§8.1）。"""
    # 相对路径 + 正斜杠，换机器也不失效
    rel = path.relative_to(root).as_posix()

    # 就地清洗正文（注意这会修改传进来的对象）
    doc.page_content = clean_text(doc.page_content)

    # doc_id 由位置信息决定，便于将来精准替换某一页 / 某一行
    raw_key = f"{rel}|{doc.metadata.get('page', '')}|{doc.metadata.get('row', '')}"
    # 取 md5 前 12 位作为短 id
    doc_id = hashlib.md5(raw_key.encode()).hexdigest()[:12]

    # update 是合并，loader 自带的 page / total_pages / row 都会保留
    doc.metadata.update(
        {
            # 相对路径，覆盖 loader 给的原始路径
            "source": rel,
            # 纯文件名，便于展示
            "file_name": path.name,
            # 扩展名去掉点
            "file_type": path.suffix.lstrip("."),
            # 稳定标识
            "doc_id": doc_id,
            # UTC 摄入时间
            "loaded_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        }
    )
    return doc


def load_all(root: Path):
    """遍历目录逐文件加载，返回(合格文档，待人工确认的清单)"""
    # 通过质检的文档列表
    goods = []
    # 有问题的文件清单，每项是一个字段，等待用户的确认和检查
    problems = []
    # rglob('*')表示递归列出所有的条目，sorted保证每次运行的顺序是一致
    for path in sorted(root.rglob("*")):
        # 只处理文件，跳过目录
        if not path.is_file():
            continue
        # 按扩展名找loader
        factory = LOADERS.get(path.suffix.lower())
        # 如果遇到不认识的格式记录下来，而不是悄悄的失败
        if factory is None:
            problems.append({"file": path.name, "issue": "不支持文件类型"})
            continue
        try:
            raw_docs = factory(path).load()
        except Exception as exc:
            problems.append({"file": path.name, "issue": f"读取加载失败:{exc}"})
            continue
        # 如果没有读到Document
        if not raw_docs:
            problems.append({"file": path.name, "issue": f"加载结果为空"})
            continue
        # 一个文件可能会产出多个Document对象
        for doc in raw_docs:
            # 清先+丰富metadata
            doc = enrich(doc, path, root)
            if len(doc.page_content) < MIN_CHARS:
                problems.append(
                    {
                        "file": path.name,
                        "issue": f"内容过短：只有{len(doc.page_content)}字",
                    }
                )
                continue
            # 如果通过的质检，收到好的文档结果中
            goods.append(doc)

    return goods, problems


def save_jsonl(docs: list[Document], out: Path):
    """存成jsonl,一行一个Document"""
    with out.open("w", encoding="utf-8") as f:
        for d in docs:
            # 只保留下游需要的二个字段
            record = {"page_content": d.page_content, "metadata": d.metadata}
            f.write(json.dumps(record, ensure_ascii=False) + "\n")


def report(docs: list[Document], problems: list[dict]):
    "打印质检报告"
    print(f"共产出{len(docs)}个文档")
    # 统计总字符串
    total = sum(len(d.page_content) for d in docs)
    print(f"总字符数:{total},平均字符数{total//max(len(docs),1)}字/Document")
    # 按来源统计，能直观看到哪个文件贡献了多少内容
    print("\n来源统计")
    by_source = {}
    for d in docs:
        # get(key,0)+1 是计数的常用写法 统计某个文件生成的Document文档数量
        by_source[d.metadata["source"]] = by_source.get(d.metadata["source"], 0) + 1
    # 排序后输出，保证每次运行结果顺序一致
    for src, count in sorted(by_source.items()):
        print(f"{src}:{count}")
    if problems:
        print(f"\n需要人工确认:")
        for p in problems:
            print(f"[{p['file']}] {p['issue']}")
    else:
        print("\n没有发现有问题的文档")


# 目录不存在时给出明确提示，而不是抛一个难懂的异常
if not DOCS_DIR.exists():
    raise SystemExit(f"目录不存在：{DOCS_DIR.resolve()}，请先运行生成演示文件")
# 第一步：加载，同时收集问题清单
docs, problems = load_all(DOCS_DIR)
# 第二步 把合格的文档写到jsonl里去
save_jsonl(docs, OUTPUT_FILE)
# 第三步，打印质检报告
report(docs, problems)
print(f"\n已经写入{OUTPUT_FILE}")
if docs:
    print("示例Document")
    print(docs[0].page_content[:60])
    print(docs[0].metadata)
