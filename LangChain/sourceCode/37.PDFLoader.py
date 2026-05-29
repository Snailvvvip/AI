# from langchain_community.document_loaders import PyPDFLoader

from smartchain.document_loaders import PyPDFLoader

file_path = "files/example.pdf"
loader = PyPDFLoader(file_path)
docs = loader.load()
for i, doc in enumerate(docs, 1):
    content = doc.page_content
    metadata = doc.metadata
    print("content", content)
    print("metadata", metadata)
