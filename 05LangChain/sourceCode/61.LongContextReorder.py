# from langchain_core.documents import Document
# from langchain_community.document_transformers import LongContextReorder

from smartchain.documents import Document

from smartchain.document_transformers import LongContextReorder

# 构建一个包含 6 个文档的列表，每个文档附带不同的内容和元数据 id
docs = [
    # 第1个文档，介绍部分
    Document(page_content="Document1", metadata={"id": 1}),
    # 第2个文档，细节部分
    Document(page_content="Document2", metadata={"id": 2}),
    # 第3个文档，扩展部分
    Document(page_content="Document3", metadata={"id": 3}),
    # 第4个文档，结论部分
    Document(page_content="Document4", metadata={"id": 4}),
    # 第5个文档，结论部分
    Document(page_content="Document5", metadata={"id": 5}),
    # 第6个文档，结论部分
    Document(page_content="Document6", metadata={"id": 6}),
]

reorder = LongContextReorder()
reorderd_documents = reorder.transform_documents(docs)
for i, doc in enumerate(reorderd_documents, 1):
    print(f"{i} {doc.metadata.get('id')} {doc.page_content}")

"""
1 2 细节：机器学习是人工智能的核心方法。
2 4 结论：人工智能正在改变世界。
3 3 扩展：深度学习通过神经网络取得突破。
4 1 介绍：本文讨论人工智能的基础。
"""
