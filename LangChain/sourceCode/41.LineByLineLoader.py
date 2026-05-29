# 导入所需的 Document 类和 BaseLoader 基类
from smartchain.document_loaders import BaseLoader
from smartchain.documents import Document


# 定义逐行文本加载器，每一行为一个 Document
class LineByLineLoader(BaseLoader):
    # 初始化函数，接收文件路径和编码
    def __init__(self, file_path: str, encoding: str = "utf-8"):
        # 保存文件路径到实例
        self.file_path = file_path
        # 保存文本编码方式到实例
        self.encoding = encoding

    # 懒加载方法，逐行读取文本内容
    def lazy_load(self):
        # 以指定编码打开文件进行读取
        with open(self.file_path, "r", encoding=self.encoding) as f:
            # 枚举每一行内容，i 为行号，line 为文本
            for i, line in enumerate(f):
                # 去除每行的首尾空白后生成 Document 并返回（yield）
                yield Document(
                    page_content=line.strip(),
                    metadata={"source": self.file_path, "line_number": i},
                )


# 指定示例文件路径
sample_file = "files/sample_lines.txt"
# 使用 lazy_load() 方法加载文件内容，每行为一个 Document 对象
docs1 = list(LineByLineLoader(sample_file).lazy_load())
print(f"lazy_load() {len(docs1)}:", [d.page_content for d in docs1])

# 使用 load() 方法加载文件内容（BaseLoader 提供的方法）
docs2 = LineByLineLoader(sample_file).load()
print(f"load() {len(docs2)}:", [d.page_content for d in docs2])
print(f"元数据示例: {docs2[0].metadata}")
