# 导入 TextSplitter 基类和 MarkdownTextSplitter
from smartchain.text_splitters import MarkdownTextSplitter

# 定义一个 Markdown 文档示例
markdown_text = """# 第一章：介绍

这是第一章的内容。Markdown 是一种轻量级标记语言。

## 1.1 什么是 Markdown

Markdown 允许你使用易读易写的纯文本格式编写文档。

### 优点

- 简单易学
- 广泛支持
- 易于转换

## 1.2 基本语法

Markdown 支持多种语法元素。

``python
# 这是一个代码块示例
def hello():
    print("Hello, Markdown!")
``

---

# 第二章：高级特性

这是第二章的内容。

## 2.1 表格

Markdown 支持表格语法。

## 2.2 链接和图片

Markdown 支持链接和图片插入。

---

# 第三章：总结

这是最后一章的内容。
"""

# 创建 Markdown 文本分割器
splitter = MarkdownTextSplitter(
    chunk_size=100,  # 每个块最多 100 字符
    chunk_overlap=20,  # 块之间重叠 20 字符
)

# 分割 Markdown 文本
chunks = splitter.split_text(markdown_text)

# 打印结果
print("=" * 60)
print("Markdown 文本分割示例")
print("=" * 60)
print(f"原文本长度: {len(markdown_text)} 字符")
print(f"切分得到 {len(chunks)} 块：\n")

for i, chunk in enumerate(chunks, 1):
    print(f"--- 片段 {i} ({len(chunk)} 字符) ---")
    # 显示完整内容（如果太长则截断）
    if len(chunk) > 100:
        print(chunk[:100] + "...")
    else:
        print(chunk)
    print()
