# from langchain_openai import ChatOpenAI
# from langchain_core.prompts import PromptTemplate
# from langchain_core.output_parsers import PydanticOutputParser


from smartchain.output_parsers import PydanticOutputParser
from smartchain.chat_models import ChatOpenAI
from smartchain.prompts import PromptTemplate
from pydantic import BaseModel, Field

llm = ChatOpenAI(model="gpt-4o")


class Person(BaseModel):
    name: str = Field(description="姓名")
    age: int = Field(description="年龄", ge=0, le=150)
    email: str = Field(description="邮箱")
    city: str = Field(description="城市", default="未知")


person_parser = PydanticOutputParser(pydantic_object=Person)
# test_json = '{"name":"张三","age":30,"email":"zs@qq.com","city":"北京"}'
# person = person_parser.parse(test_json)
# print(person, type(person))

person_prompt = PromptTemplate.from_template(
    """
    从以下文本中提取人员信息
    文本:{text}
    {format_instructions}
    请提取人员信息并以JSON格式返回 :
    """
)
# 构造待提取的原始文本示例（多条）
texts = [
    "我叫李四，今年28岁，邮箱是 lisi@example.com，我住在上海。",
    "王五，35岁，邮箱地址是 wangwu@test.com，来自深圳。",
]

for i, text in enumerate(texts, 1):
    # 根据模板生成提示词，插入原始的文本和提取格式说明
    formatted_prompt = person_prompt.format(
        text=text, format_instructions=person_parser.get_format_instructions()
    )
    print(formatted_prompt)
    response = llm.invoke(formatted_prompt)
    print(response.content)
    result = person_parser.parse(response.content)
    print(result, type(result))
