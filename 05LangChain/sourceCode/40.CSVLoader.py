# from langchain_community.document_loaders import CSVLoader

from smartchain.document_loaders import CSVLoader

file_path = "files/example.csv"
loader = CSVLoader(file_path, encoding="utf-8")
docs = loader.load()
for i, doc in enumerate(docs, 1):
    content = doc.page_content
    metadata = doc.metadata
    print("content", content)
    print("metadata", metadata)
