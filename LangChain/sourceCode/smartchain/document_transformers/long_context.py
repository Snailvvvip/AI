from .base import BaseDocumentTransformer


class LongContextReorder(BaseDocumentTransformer):
    def transform_documents(self, documents):
        docs = list(documents)
        # 反转文档列表
        docs.reverse()
        # 初始化重排后的文档列表
        reordered = []
        # 遍历反转后的文档列表
        for i, doc in enumerate(docs):
            # 如果索引为奇数的话
            if i % 2 == 1:
                # 将当前的文档追加到重排列表的末尾
                reordered.append(doc)
            else:
                # 如果索引是偶数，将当前文档插入到重排列表头部
                reordered.insert(0, doc)
        return reordered
# 246531