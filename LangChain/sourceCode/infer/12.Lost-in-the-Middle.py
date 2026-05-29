# 测试文档已经从高高低排序好
documents = [
    "文档1(相关性最高)",
    "文档2",
    "文档3",
    "文档4",
    "文档5",
    "文档6(相关性最低)",
]


def long_context_reorder(documents):
    if len(documents) <= 1:
        return documents
    # 提取所有奇数位置的文档0,2,4...第1项 第3项 第5项
    odd_docs = documents[::2]
    # 提取所有偶数位置的文档1,3,5...第2项 第4项 第6项
    even_docs = documents[1::2]
    # 将偶数位置的文档反转
    even_docs_reversed = even_docs[::-1]
    return odd_docs + even_docs_reversed


for i, doc in enumerate(documents, 1):
    print(f"位置{i}:{doc}")
print("=" * 60)
reordered_documents = long_context_reorder(documents)
for i, doc in enumerate(reordered_documents, 1):
    print(f"位置{i}:{doc}")
