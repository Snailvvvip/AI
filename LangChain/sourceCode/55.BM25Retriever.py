from langchain_community.retrievers import BM25Retriever
from langchain_core.documents import Document

# from smartchain.retrievers import BM25Retriever

# from smartchain.documents import Document
import jieba

# 构造一个包含4条文本的示例文档列表
docs = [
    Document(page_content="深度学习通过神经网络取得突破。"),
    Document(page_content="机器人学结合机械工程与人工智能。"),
    Document(page_content="美食点评：这家餐厅的川菜 很正宗。"),
    Document(page_content="人工智能正推动机器人自主学习与创新。"),
    Document(page_content="美食很好吃"),
]


def chinese_tokenizer(text):
    tokens = list(jieba.cut_for_search(text))
    return tokens


retriever = BM25Retriever.from_documents(docs, preprocess_func=chinese_tokenizer, k=2)
query = "机器人与人工智能"
results = retriever.invoke(query)
print(f"查询:{query}")
print(f"返回:{len(results)}")
for i, doc in enumerate(results, 1):
    print(f"{i}:{doc.page_content}")
