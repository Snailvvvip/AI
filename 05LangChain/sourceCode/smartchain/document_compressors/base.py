from abc import ABC, abstractmethod


class BaseDocumentCompressor(ABC):
    @abstractmethod
    def compress_documents(self, documents, query):
        pass
