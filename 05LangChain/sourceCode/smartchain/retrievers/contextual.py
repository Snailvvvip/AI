from .base import BaseRetriever


class ContextualCompressionRetriever(BaseRetriever):
    def __init__(self, base_retriever, base_compressor):
        super().__init__()
        self.base_retriever = base_retriever
        self.base_compressor = base_compressor

    def _get_relevant_documents(self, query, **kwargs):
        docs = self.base_retriever.invoke(query, **kwargs)
        if not docs:
            return []
        compressed_docs = self.base_compressor.compress_documents(docs, query)
        return list(compressed_docs)
