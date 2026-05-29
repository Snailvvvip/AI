# from langchain_openai import ChatOpenAI
# from langchain_core.prompts import PromptTemplate
# from langchain_core.output_parsers import JsonOutputParser, PydanticOutputParser
# from langchain_classic.output_parsers.fix import OutputFixingParser

from smartchain.output_parsers import JsonOutputParser, OutputFixingParser
from smartchain.chat_models import ChatOpenAI
import json

llm = ChatOpenAI(model="gpt-4o")
# 创建基础的JSON解析器
json_parser = JsonOutputParser()
outputFixingParser = OutputFixingParser.from_llm(
    llm=llm, parser=json_parser, max_retries=2  # 大模型  # 基础解析器  # 最大重试次数
)
# 构造一组无效的 JSON 字符串用于测试
invalid_outputs = [
    # 缺少引号的 JSON
    '{name: "张三", age: 30, city: "北京"}',
    # 使用单引号，JSON 只能使用双引号
    "{'product': '手机', 'price': 3999}",
    # 缺少逗号分隔的 JSON
    '{"name": "李四" "age": 25}',
    # 包含注释，JSON 格式不支持注释
    '{"name": "王五", /* 这是注释 */ "age": 28}',
    '"aaa{"name": "5555","age":666}ccccc"',
]
for i, invalid_output in enumerate(invalid_outputs, 1):
    try:
        try:
            result = json_parser.parse(invalid_output)
            print(f"基础解析成功")
        except Exception as e:
            print(f"基础解析失败")
            print(f"基础解析错误:{type(e).__name__}:{e}")
        print(f"使用OutputFixingParser使用LLM进行修复")
        try:
            result = outputFixingParser.parse(invalid_output)
            print(f"修复后即系成功")
            print(f"修复成功结果：{json.dumps(result,ensure_ascii=False,indent=2)}")
        except Exception as e:
            print(f"修复失败")
            print(f"修复错误:{type(e).__name__}:{e}")
    except Exception as e:
        print(f"修复失败:{e}")
