from .base import BaseDocumentCompressor


class CrossEncoderReranker(BaseDocumentCompressor):
    def __init__(self, model, top_n=3):
        super().__init__()
        # 保存交叉编码器重排序模型
        self.model = model
        self.top_n = top_n

    def compress_documents(
        self,
        documents,
        query,
    ):
        if not documents:
            return []
        pairs = [(query, doc.page_content) for doc in documents]
        # 使用cross-encoder对所有的句对进行评分
        scores = self.model.predict(pairs)
        # 将文档和对应的相关性分数打包，并按分数从高到低排序
        ranked = sorted(zip(documents, scores), key=lambda x: x[1], reverse=True)
        return [doc for doc, _ in ranked[: self.top_n]]
