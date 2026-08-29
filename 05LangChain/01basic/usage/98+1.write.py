# Path 用于创建目录与文件
from pathlib import Path

# PdfWriter 用来造一个"扫描件式"的空白 PDF
from pypdf import PdfWriter

# 演示知识库根目录
root = Path("docs")
# 建一个子目录，用来验证递归扫描
(root / "policy").mkdir(parents=True, exist_ok=True)

# Markdown：制度类文档，放在子目录里，用来验证递归扫描
(root / "policy" / "refund.md").write_text(
    # 带标题的 Markdown 正文
    "# 退换货政策\n\n签收 7 日内可无理由退货。\n质量问题 15 日内可换货。\n",
    # 始终显式指定编码
    encoding="utf-8",
)

# 纯文本：FAQ
(root / "faq.txt").write_text(
    # 一问一答
    "问：发货要多久？\n答：一般 48 小时内发出。\n",
    encoding="utf-8",
)

# CSV：一行一条订单，会变成多个 Document
(root / "orders.csv").write_text(
    # 表头 + 两行数据
    "order_id,status,eta\nA1001,已发货,明天\nA1002,运输中,后天\n",
    encoding="utf-8",
)

# 故意留一个空文件，测试质检能否抓出「内容过短」
(root / "empty.txt").write_text("", encoding="utf-8")

# 故意造一个没有文字层的 PDF，模拟扫描件（§5.1）
writer = PdfWriter()
# 一个空白 A4 页
writer.add_blank_page(width=595, height=842)
# 写入 docs/ 目录
with (root / "scan.pdf").open("wb") as f:
    writer.write(f)

# 故意放一个脚本不认识的格式，测试"不支持的类型"分支
(root / "notes.xlsx").write_bytes(b"fake")

# resolve() 打印绝对路径，方便你去文件管理器里确认
print("演示知识库已生成：", root.resolve())
print("提示：把你自己的 PDF / .docx 也丢进 docs/ 就能一起摄入")
