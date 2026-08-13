import os
from openai import OpenAI
from abc import ABC, abstractmethod
from sentence_transformers import SentenceTransformer
from langchain_huggingface import (
    HuggingFaceEmbeddings as LangchainHuggingFaceEmbeddings,
)
import requests


class Embedding(ABC):
    @abstractmethod
    def embed_query(self, text):
        pass

    @abstractmethod
    def embed_documents(self, texts):
        pass


class OpenAIEmbeddings(Embedding):
    def __init__(self, model="text-embedding-3-small", **kwargs):
        self.model = model
        self.api_key = kwargs.get("api_key") or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError(f"需要提供 api_key")
        self.embedding_kwargs = {k: v for k, v in kwargs.items() if k != "api_key"}
        self.client = OpenAI(api_key=self.api_key)

    def embed_query(self, text):
        response = self.client.embeddings.create(
            model=self.model, input=text, **self.embedding_kwargs
        )
        return response.data[0].embedding

    def embed_documents(self, texts):
        response = self.client.embeddings.create(
            model=self.model, input=texts, **self.embedding_kwargs
        )
        return [item.embedding for item in response.data]


class HuggingFaceEmbeddings(Embedding):
    def __init__(self, model_name="sentence-transformers/all-MiniLM-L6-v2", **kwargs):
        """
        初始化 HuggingFace 嵌入模型 sentence-transformers/all-mpnet-base-v2

        Args:
            model_name: HuggingFace 模型名称，默认为 "sentence-transformers/all-MiniLM-L6-v2"  384
            **kwargs: 传递给 langchain_huggingface.HuggingFaceEmbeddings 的其他参数
        """
        self.model_name = model_name
        # 使用 langchain_huggingface 的 HuggingFaceEmbeddings
        self.embeddings = LangchainHuggingFaceEmbeddings(
            model_name=model_name, **kwargs
        )

    def embed_query(self, text):
        """嵌入单个查询文本"""
        return self.embeddings.embed_query(text)

    def embed_documents(self, texts):
        """嵌入多个文档文本"""
        return self.embeddings.embed_documents(texts)


class SentenceTransformerEmbeddings(Embedding):
    def __init__(self, model="all-MiniLM-L6-v2", **kwargs):
        """
        初始化 SentenceTransformer 嵌入模型

        Args:
            model: 模型名称或路径，默认为 "all-MiniLM-L6-v2"
            **kwargs: 传递给 SentenceTransformer 的其他参数
        """
        self.model_name = model or "all-MiniLM-L6-v2"
        self.model = SentenceTransformer(self.model_name, **kwargs)
        # 可选：是否归一化嵌入向量
        self.normalize_embeddings = kwargs.get("normalize_embeddings", False)

    def embed_query(self, text):
        """嵌入单个查询文本"""
        embedding = self.model.encode(
            text, normalize_embeddings=self.normalize_embeddings
        )
        return embedding.tolist() if hasattr(embedding, "tolist") else embedding

    def embed_documents(self, texts):
        """嵌入多个文档文本（批量处理以提高效率）"""
        if isinstance(texts, str):
            texts = [texts]
        embeddings = self.model.encode(
            texts, normalize_embeddings=self.normalize_embeddings
        )
        # 转换为列表格式
        if hasattr(embeddings, "tolist"):
            return embeddings.tolist()
        return embeddings


# 设置文本向量API的URL
VOLC_EMBEDDINGS_API_URL = "https://ark.cn-beijing.volces.com/api/v3/embeddings"


def get_volc_embedding(
    doc_content, model="doubao-embedding-text-240715", api_key=None, api_url=None
):
    """
    获取火山引擎文档向量

    Args:
        doc_content: 文档内容（字符串或字符串列表）
        model: 模型名称，默认为 "doubao-embedding-text-240715"
        api_key: API密钥，如果未提供则从环境变量 VOLC_API_KEY 获取
        api_url: API地址，如果未提供则使用默认地址

    Returns:
        嵌入向量（单个文本返回向量，多个文本返回向量列表）
    """
    # 从环境变量获取 API key（如果未提供）
    if api_key is None:
        api_key = os.getenv("VOLC_API_KEY")
    if not api_key:
        raise ValueError("需要提供 api_key 或设置环境变量 VOLC_API_KEY")

    # 使用提供的 API URL 或默认 URL
    api_url = api_url or VOLC_EMBEDDINGS_API_URL

    # 构造请求头
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    # 构造请求体
    payload = {"model": model, "input": doc_content}

    # 发送POST请求
    try:
        response = requests.post(api_url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()  # 如果状态码不是 200，会抛出异常

        # 解析响应
        data = response.json()

        # 处理单个或多个输入
        if isinstance(doc_content, list):
            # 多个输入，返回向量列表
            return [item["embedding"] for item in data.get("data", [])]
        else:
            # 单个输入，返回单个向量
            return data["data"][0]["embedding"]

    except requests.exceptions.RequestException as e:
        raise Exception(f"火山引擎 Embedding API 请求失败: {str(e)}")
    except (KeyError, IndexError) as e:
        raise Exception(f"火山引擎 Embedding API 响应格式错误: {str(e)}")


class VOLCEmbeddings(Embedding):
    def __init__(
        self, model="doubao-embedding-text-240715", api_key=None, api_url=None, **kwargs
    ):
        """
        初始化火山引擎嵌入模型

        Args:
            model: 模型名称，默认为 "doubao-embedding-text-240715"
            api_key: API密钥，如果未提供则从环境变量 VOLC_API_KEY 获取
            api_url: API地址，如果未提供则使用默认地址
            **kwargs: 其他参数（保留用于未来扩展）
        """
        self.model = model
        self.api_key = api_key or os.getenv("VOLC_API_KEY")
        if not self.api_key:
            raise ValueError("需要提供 api_key 或设置环境变量 VOLC_API_KEY")
        self.api_url = api_url or VOLC_EMBEDDINGS_API_URL
        self.embedding_kwargs = kwargs

    def embed_query(self, text):
        """嵌入单个查询文本"""
        return get_volc_embedding(
            text, model=self.model, api_key=self.api_key, api_url=self.api_url
        )

    def embed_documents(self, texts):
        """嵌入多个文档文本"""
        if isinstance(texts, str):
            texts = [texts]
        # 批量处理以提高效率
        return get_volc_embedding(
            texts, model=self.model, api_key=self.api_key, api_url=self.api_url
        )
