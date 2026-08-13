from abc import ABC, abstractmethod
from .prompts import PromptTemplate
import re
import jieba
import tiktoken
from .vectorstores import VectorStore

encoder = tiktoken.get_encoding("cl100k_base")


class BaseExampleSelector(ABC):
    @abstractmethod
    def select_examples(self, input_variables: dict) -> list[dict]:
        pass


class LengthBasedExampleSelector(BaseExampleSelector):
    def __init__(
        self,
        examples: list[dict],  # 样例的列表
        example_prompt: PromptTemplate | str,  # 每条样例对应的提示词模板
        max_length=2048,  # 提示词的最大长度
        get_text_length=None,  # 可选的文本长度计算函数 默认是按单词算的
    ):
        self.examples = examples
        if isinstance(example_prompt, str):
            self.example_prompt = PromptTemplate.from_template(example_prompt)
        else:
            self.example_prompt = example_prompt
        self.max_length = max_length
        self.get_text_length = get_text_length or self._default_get_text_length
        self.example_text_lengths = self._calculate_example_lengths()

    def _calculate_example_lengths(self):
        lengths = []
        for example in self.examples:
            formatted_example = self.example_prompt.format(**example)
            length = self.get_text_length(formatted_example)
            lengths.append(length)
        return lengths

    def _default_get_text_length(self, text):
        words = jieba.cut(text)
        list = [word for word in words if word.strip()]
        return len(list)

        # tokens = encoder.encode(text)
        # 计算 token 的数量
        # return len([token for token in tokens if token.strip()])

    def select_examples(self, input_variables):
        # 将输入的变量拼成一个字符串 8 plus 7 等于多少?
        input_text = " ".join(str(v) for v in input_variables.values())
        # 计算输入内容的长度 6
        input_length = self.get_text_length(input_text)
        # 计算剩余的可用的长度
        remaining_length = self.max_length - input_length
        selected_examples = []
        for i, example in enumerate(self.examples):
            if remaining_length <= 0:
                break
            example_length = self.example_text_lengths[i]
            if remaining_length - example_length < 0:
                break
            selected_examples.append(example)
            remaining_length -= example_length
        return selected_examples


# def sorted_values(values: dict) -> list:
#    # 对字典的键进行排序
#    # 依次取出对应的值组成新的列表
#    return [values[val] for val in sorted(values)]


class VectorStoreExampleSelector(BaseExampleSelector):
    def __init__(self, vectorstore: VectorStore, k: int = 3):
        self.vectorstore = vectorstore
        self.k = k

    @staticmethod
    def _example_to_text(example: dict) -> str:
        return " ".join(example.values())
        # return " ".join(sorted_values(example))
        # return example["question"] + example["answer"]

    def _documents_to_examples(self, documents):
        return [dict(doc.metadata) for doc in documents]


class MaxMarginalRelevanceExampleSelector(VectorStoreExampleSelector):
    def __init__(self, vectorstore, k=3, fetch_k=20):
        super().__init__(vectorstore=vectorstore, k=k)
        self.fetch_k = fetch_k

    @classmethod
    def from_examples(
        cls,  # 当前类
        examples,  # 示例字典列表
        embeddings,  # 嵌入模型实例
        vectorstore_cls,  # 向量存储类如 FAISS
        k=4,  # 最终选择几个示例
        fetch_k=20,  # 候选集大小
    ):
        # 先将每个样例转换为字符串 未来用作向量数据库的文本
        string_examples = [cls._example_to_text(eg) for eg in examples]
        # 使用向量存储类批量创建并加载这些样式text=>向量
        vectorstore = vectorstore_cls.from_texts(
            texts=string_examples, embeddings=embeddings, metadatas=examples
        )
        return cls(vectorstore=vectorstore, k=k, fetch_k=fetch_k)

    def select_examples(self, input_variables):
        # 将输入的变量转成文本查询字符串
        query_text = self._example_to_text(input_variables)
        # 调用向量存储的最大边际相关性检索方法获取候选的示例文档
        example_docs = self.vectorstore.max_marginal_relevance_search(
            query=query_text, k=self.k, fetch_k=self.fetch_k
        )
        return self._documents_to_examples(example_docs)


# 定义语义相似度示例选择器类，继承自VectorStoreExampleSelector
class SemanticSimilarityExampleSelector(VectorStoreExampleSelector):
    """
    基于语义相似度的示例选择器
    使用简单的相似度搜索来选择与查询最相似的示例。
    这是最直接的示例选择方法，根据与查询的语义相似度排序选择 top-k 示例。
    """

    # 定义选择示例的方法，输入为包含输入变量的字典
    def select_examples(self, input_variables: dict):
        """
        根据语义相似度选择示例
        Args:
            input_variables: 输入变量字典
        Returns:
            List[dict]: 选中的示例列表
        """
        # 将输入变量字典转换为查询文本
        query_text = self._example_to_text(input_variables)
        # 调用向量存储的similarity_search方法，检索与查询最相似的k个文档
        example_docs = self.vectorstore.similarity_search(query=query_text, k=self.k)
        # 将检索到的文档对象转换为示例字典列表并返回
        return self._documents_to_examples(example_docs)

    # 类方法：通过一组示例和相关组件实例，创建SemanticSimilarityExampleSelector实例
    @classmethod
    def from_examples(
        cls,  # 当前类
        examples,  # 示例列表
        embeddings,  # 嵌入模型实例
        vectorstore_cls: type,  # 向量存储类
        k: int = 4,  # 选择的示例数量   （默认4个）
    ) -> "SemanticSimilarityExampleSelector":
        """
        从示例列表创建 SemanticSimilarityExampleSelector
        Args:
            examples: 示例列表
            embeddings: 嵌入模型实例
            vectorstore_cls: 向量存储类（如 FAISS）
            k: 选择的示例数量
        Returns:
            SemanticSimilarityExampleSelector: 示例选择器实例
        """
        # 遍历每个示例，将其转换为单一字符串形式组成列表
        string_examples = [cls._example_to_text(eg) for eg in examples]
        # 使用vectorstore_cls批量创建向量存储对象，将文本转为向量，并将原始元数据关联
        vectorstore = vectorstore_cls.from_texts(
            texts=string_examples,  # 文本列表
            embeddings=embeddings,  # 嵌入模型
            metadatas=examples,  # 元数据列表
        )
        # 实例化当前类，生成选择器实例并返回
        return cls(vectorstore=vectorstore, k=k)  # 构建好的向量存储实例  # 选择示例个数
