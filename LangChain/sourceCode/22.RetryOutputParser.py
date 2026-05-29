# from langchain_openai import ChatOpenAI
# from langchain_core.prompts import PromptTemplate
# from langchain_core.output_parsers import JsonOutputParser
# from langchain_classic.output_parsers import RetryOutputParser
# from langchain_core.prompt_values import StringPromptValue


from smartchain.output_parsers import JsonOutputParser, RetryOutputParser
from smartchain.chat_models import ChatOpenAI
from smartchain.prompts import PromptTemplate
from smartchain.prompt_values import StringPromptValue
import json

llm = ChatOpenAI(model="gpt-4o")
json_parser = JsonOutputParser()
retryOutputParser = RetryOutputParser.from_llm(
    llm=llm, parser=json_parser, max_retries=2
)
prompt = PromptTemplate.from_template(
    """
    请以JSON格式输出以下信息
    - 姓名:{name}
    - 年龄:{age}
    - 城市:{city}

    {format_instructions}

    请输出JSON:
    """
)
formatted_prompt = prompt.format(
    name="张三",
    age=30,
    city="北京",
    format_instructions=json_parser.get_format_instructions(),
)
# 不是一个有效的JSON字符串
invalid_completion = 'name:"张三",age:30,city:"北京"'
try:
    try:
        result = json_parser.parse(invalid_completion)
        print(f"基础解析成功(意外)")
    except Exception as e:
        print(f"基础解析失败")
        print(f"错误:{str(e)}")
    prompt_value = StringPromptValue(text=formatted_prompt)
    result = retryOutputParser.parse_with_prompt(invalid_completion, prompt_value)
    print(f"重试后解析成功")
    print(f"结果:{json.dumps(result,ensure_ascii=False,indent=2)}")

except Exception as e:
    print(f"重试失败:{str(e)}")

# 21.OutputFixingParser 尝试让大模型修复输出结果的格式
# 22.RetryOutputParser  尝试让大模型重新输出结果
