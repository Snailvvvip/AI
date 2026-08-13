from abc import ABC, abstractmethod


class BaseDocumentTransformer(ABC):
    @abstractmethod
    def transform_documents(self, documents):
        pass
