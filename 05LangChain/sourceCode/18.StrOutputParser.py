# from langchain_core.output_parsers import StrOutputParser
# from langchain_openai import ChatOpenAI

from smartchain.output_parsers import StrOutputParser
from smartchain.chat_models import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o")
parser = StrOutputParser()
response = llm.invoke("介绍一下Python编程语言")
parsed_output = parser.parse(response.content)
print(f"解析后的内容:{parsed_output}")
print(f"解析后的类型:{type(parsed_output)}")

# stream = llm.stream("介绍一下RAG")
#
# full_response = ""
# for chunk in stream:
#    content = chunk.content if hasattr(chunk, "content") else str(chunk)
#    print(content, end="", flush=True)
#    full_response += content
# parsed_output = parser.parse(full_response)
# print(f"解析后的内容:{parsed_output}")
# print(f"解析后的类型:{type(parsed_output)}")
