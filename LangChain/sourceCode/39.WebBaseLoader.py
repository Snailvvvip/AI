# from langchain_core.document_loaders import WebBaseLoader

from smartchain.document_loaders import WebBaseLoader

url = "https://www.example.com"
loader = WebBaseLoader(web_paths=[url])

docs = loader.load()
for i, doc in enumerate(docs, 1):
    content = doc.page_content
    metadata = doc.metadata
    print("content", content)
    print("metadata", metadata)
