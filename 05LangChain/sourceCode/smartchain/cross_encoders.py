from sentence_transformers import CrossEncoder


class HuggingFaceCrossEncoder:
    def __init__(
        self, model_name="BAAI/bge-reranker-base", device=None, **model_kwargs
    ):

        self.model = CrossEncoder(
            model_name_or_path=model_name, device=device or "cpu", **model_kwargs
        )

    # 定义预测方法，输入为句对组成的列表
    def predict(self, pairs):
        # 调用CrossEncoder计算匹配分数
        return self.model.predict(pairs)
