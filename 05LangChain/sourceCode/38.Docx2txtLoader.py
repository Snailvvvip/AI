# from langchain_community.document_loaders import Docx2txtLoader

from smartchain.document_loaders import Docx2txtLoader

file_path = "files/example.docx"
loader = Docx2txtLoader(file_path)
docs = loader.load()
for i, doc in enumerate(docs, 1):
    content = doc.page_content
    metadata = doc.metadata
    print("content", content)
    print("metadata", metadata)
