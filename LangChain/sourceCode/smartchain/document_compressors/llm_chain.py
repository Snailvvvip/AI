from .base import BaseDocumentCompressor
from ..prompts import PromptTemplate
from ..documents import Document

# 定义一个默认的中文抽取Prompt模板
CHINESE_EXTRACT_PROMPT = """给定以下问题和上下文，提取上下文中与回答问题相关的任何部分（保持原样）。如果上下文都不相关，返回 NO_OUTPUT。

记住，*不要*编辑提取的上下文部分。

> 问题：{question}
> 上下文：
>>>
{context}
>>>
提取的相关部分："""


class LLMChain:
    def __init__(self, prompt_template, llm):
        self.prompt_template = prompt_template
        self.llm = llm

    def invoke(self, input_dict, **kwargs):
        formatted_template = self.prompt_template.format(**input_dict)
        response = self.llm.invoke(formatted_template, **kwargs)
        if hasattr(response, "content"):
            text = response.content
        elif isinstance(response, str):
            text = response
        else:
            text = str(response)
        text = text.strip()
        if text == "NO_OUTPUT" or text == "":
            return ""
        return text


class LLMChainExtractor(BaseDocumentCompressor):
    def __init__(self, llm_chain=None, llm=None, prompt=None, get_input=None):
        super().__init__()
        if llm_chain is not None:
            self.llm_chain = llm_chain
        elif llm is not None:
            if prompt is None:
                prompt_template = PromptTemplate.from_template(CHINESE_EXTRACT_PROMPT)
            else:
                prompt_template = prompt
            self.llm_chain = self._create_chain(prompt_template, llm)
        else:
            raise ValueError(f"必须提供llm_chain或llm参数")
        # 这里设置get_input,用于将query/doc打包成输出,可以自定义
        self.get_input = get_input or self._default_get_input

    def _create_chain(self, prompt_template, llm):
        return LLMChain(prompt_template, llm)

    def _default_get_input(self, query, doc):
        return {"question": query, "context": doc.page_content}

    @classmethod
    def from_llm(cls, llm, prompt=None, get_input=None):
        return cls(llm=llm, prompt=prompt, get_input=get_input)

    def compress_documents(self, documents, query, callbacks=None):
        compressed_documents = []
        for doc in documents:
            input_dict = self.get_input(query, doc)
            output = self.llm_chain.invoke(input_dict)
            if not output or len(output) == 0:
                continue
            compressed_document = Document(
                page_content=output,
                metadata=doc.metadata if hasattr(doc, "metadata") else {},
            )
            compressed_documents.append(compressed_document)
        return compressed_documents
