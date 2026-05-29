# from langchain_community.document_loaders import TextLoader
from smartchain.document_loaders import TextLoader

file_path = "files/example.md"
# 创建TextLoader的实例，并自动检测文件的编码格式
loader = TextLoader(file_path, autodetect_encoding=True)
docs = loader.load()
for i, doc in enumerate(docs, 1):
    content = doc.page_content
    metadata = doc.metadata
    print("content", content)
    print("metadata", metadata)
