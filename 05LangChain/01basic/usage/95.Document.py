from langchain_core.documents import Document
from rich import print

doc = Document(
    id="doc_1",
    page_content="签收 7 日内可无理由退货。质量问题 15 日内可换货。",
    metadata={"source": "policy/refund.md", "title": "退换货政策", "page": 1},
)
# print(doc.page_content)
# print(doc.metadata)
# print(doc)
# ['id', 'metadata', 'page_content', 'type']
print(list(Document.model_fields.keys()))
print(doc.id)
print(doc.type)
