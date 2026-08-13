from abc import ABC, abstractmethod


class BaseRetriever(ABC):
    def __init__(self):
        super().__init__()

    @abstractmethod
    def _get_relevant_documents(self, query, **kwargs):
        pass

    def invoke(self, query, **kwargs):
        return self._get_relevant_documents(query, **kwargs)
