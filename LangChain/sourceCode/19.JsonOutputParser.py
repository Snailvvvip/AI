# from langchain_core.output_parsers import JsonOutputParser
# from langchain_openai import ChatOpenAI
# from langchain_core.prompts import PromptTemplate


from smartchain.output_parsers import JsonOutputParser
from smartchain.chat_models import ChatOpenAI
from smartchain.prompts import PromptTemplate
import json

llm = ChatOpenAI(model="gpt-4o")
parser = JsonOutputParser()

# 定义不同测试用的 JSON 格式数据
test_cases = [
    # 第一种：纯 JSON 格式的字符串
    '{"name": "张三", "age": 25, "city": "北京"}',
    # 第二种：包裹在 Markdown 代码块里的 JSON
    '```json\n noise {"product": "手机", "price": 3999, "in_stock": true}\n```',
    # 第三种：JSON 数组
    '["苹果", "香蕉", "橙子"]',
]
for i, test_input in enumerate(test_cases, 1):
    result = parser.parse(test_input)
    print(result, type(result))
    print(
        f"解析成功:{json.dumps(result,ensure_ascii=False,indent=2)},type={type(result)}"
    )

prompt = PromptTemplate.from_template(
    """你是一个数据提取助手。请从以下文本中提取信息

    文本：{text}

    {format_instructions}

    请提取以下信息：
    - name: 姓名
    - age: 年龄
    - location: 地点
    - interests: 兴趣列表（数组）

    JSON 输出：
    """
)
# 获取JSON格式输出的格式说明
format_instructions = parser.get_format_instructions()
print(
    "format_instructions", format_instructions
)  # Return a JSON object 返回一个JSON对象 指导大模型应该返回什么格式
test_texts = [
    "我叫李四，今年30岁，住在上海。我喜欢编程、阅读和旅行。",
    "王五，28岁，来自深圳。爱好包括音乐、电影和摄影。",
]
for i, text in enumerate(test_texts, 1):
    # 根据模板生成提示词，插入原始的文本和提取格式说明
    formatted_prompt = prompt.format(text=text, format_instructions=format_instructions)
    response = llm.invoke(formatted_prompt)
    print(response.content)
    result = parser.parse(response.content)
    print(result, type(result))
    print(
        f"解析成功:{json.dumps(result,ensure_ascii=False,indent=2)},type={type(result)}"
    )
