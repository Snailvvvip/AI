from .base import BaseRetriever


class VectorStoreRetriever(BaseRetriever):
    # 允许的搜索类型枚举
    ALLOWED_SEARCH_TYPES = ("similarity", "similarity_score_threshold", "mmr")

    def __init__(
        self, vectorstore, search_type="similarity", search_kwargs=None, **kwargs
    ):
        super().__init__(**kwargs)
        # 保存向量数据库的实例
        self.vectorstore = vectorstore
        # 保存搜索类型
        self.search_type = search_type
        # 保存搜索参数字典
        self.search_kwargs = search_kwargs or {}
        if search_type not in self.ALLOWED_SEARCH_TYPES:
            raise ValueError(
                f"search_type{self.search_type}不允许,允许 的值：{self.ALLOWED_SEARCH_TYPES}"
            )
        if search_type == "similarity_score_threshold":
            score_threshold = self.search_kwargs.get("score_threshold")
            if score_threshold is None or not isinstance(score_threshold, (int, float)):
                raise ValueError(
                    "使用similarity_score_threshold搜索类型时，"
                    "必须提供score_threshold参数，并且必须是数字"
                )

    def _get_relevant_documents(self, query, **kwargs):
        # 合并__init__时的搜索参数与本次调用传递的搜索参数
        search_kwargs = {**self.search_kwargs, **kwargs}
        if self.search_type == "similarity":
            docs = self.vectorstore.similarity_search(query, **search_kwargs)
        elif self.search_type == "similarity_score_threshold":
            docs_and_scores = self.vectorstore.similarity_search_with_score(
                query, **search_kwargs
            )
            score_threshold = search_kwargs.get("score_threshold")
            # 这个分数就是越大越相似
            docs = [doc for doc, score in docs_and_scores if score >= score_threshold]
        elif self.search_type == "mmr":
            docs = self.vectorstore.max_marginal_relevance_search(
                query, **search_kwargs
            )
        else:
            raise ValueError(f"不支持的搜索类型:{self.search_type}")
        return docs
