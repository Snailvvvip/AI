from langchain.tools import tool

# 是一个标记，表示该参数由代码注入，而非由模型填写
from langchain_core.tools import InjectedToolArg
from langchain_core.utils.function_calling import convert_to_openai_tool
import json
from rich import print

import time
from langchain_core.runnables import RunnableConfig
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.chat_models import init_chat_model
import time
from langchain_core.runnables import (
    RunnableLambda,
    RunnablePassthrough,
    RunnableParallel,
    RunnableBranch,
    RunnableGenerator,
)
from pydantic import BaseModel, Field
from typing import Literal, Annotated
from dotenv import load_dotenv
from rich import print
from langchain_core.runnables import chain

load_dotenv(override=True)


# 解析docstring
@tool(parse_docstring=True)
def search_database(query: str, limit: int = 10) -> str:
    """在客户库中按关键字检索记录

    Args:
        query: 要搜索的关键字
        limit: 最多返回多少条
    """
    return f"找到了与{query}相关的{limit}条记录"


"""
# 工具名称来自于函数的名称
print("name", search_database.name)
# 工具的描述来自于整段的docstring
print("description", search_database.description)
# 参数schema来自于由类型注解推断出来的字典
print("args", search_database.args)
# 不经过模型，可以通过调用工具的invoke方法来执行工具
# print(search_database.invoke({"query": "张三", "limit": 3}))
#  1 validation error for search_database limit Field required [type=missing, input_value={'query': '张三'}, input_type=dict]
print(search_database.invoke("张三"))


tools_desc = json.dumps(
    convert_to_openai_tool(search_database), ensure_ascii=False, indent=2
)
print(tools_desc)

  "type": "function",
  "function": {
    "name": "search_database",
    "description": "在客户库中按关键字检索记录\n\n    Args:\n        query: 要搜索的关键字\n        limit:
最多返回多少条",
    "parameters": {
      "properties": {
        "query": {
          "type": "string"
        },
        "limit": {
          "type": "integer"
        }
      },
      "required": [
        "query",
        "limit"
      ],
      "type": "object"
    }
  }
}

tools_desc = json.dumps(
    convert_to_openai_tool(search_database), ensure_ascii=False, indent=2
)
print(tools_desc)



# 不给函数参数写类型注解，不报错，但schema会静默降级，参数没有类型
@tool
def no_annotation(query) -> str:
    ""没有类型注解的工具""
    return "ok"


print(no_annotation.args)



@tool(description="这是工具的描述")
def no_doc(query: str) -> str:
    ""这是工具的docstring""
    return "ok"


# ValueError: Function must have a docstring if description not provided.
print(no_doc)



@tool("web_search")
def search(query: str) -> str:
    ""在互联网上搜索信息""
    return f"搜索到了关于{query}的搜索结果"


print(search.name)


@tool(
    "calculator", description="执行四则运算，遇到任何算术问题都请调用本工具，不要心算"
)
def calc(expression: str) -> str:
    ""计算数学表达式""
    return expression
print(calc.name)
print(calc.description)



@tool("web search")
def f1(query: str) -> str:
    ""搜索信息""
    return "ok"


@tool("查询天气")
def f2(query: str) -> str:
    ""查询城市天气""
    return "ok"


print(repr(f1.name))
print(repr(f2.name))

model = init_chat_model("deepseek:deepseek-v4-flash")
try:
    model.bind_tools([f1, f2]).invoke("搜索一下langchain")
except Exception as e:
    print(f"{e}")
# Invalid 'tools[0].function.name
# string does not match pattern
# Expected a string that matches the pattern '^+$'."





class WeatherInput(BaseModel):
    ""天气查询入参""

    # 必填字段，没有default默认值，所以本字段会进入required列表
    location: str = Field(description="城市名或坐标，如 [上海]")
    # Literal会在JSON Schema变成enum，模型只能二选一
    units: Literal["C", "F"] = Field(default="C", description="温度单位： C或F")
    include_forecast: bool = Field(
        default=False, description="是否包含未来5天的天气预报"
    )


@tool(args_schema=WeatherInput)
def get_weather(location: str, units: str = "C", include_forecast: bool = False) -> str:
    ""查询当前天气，需要事实天气时必须调用，不要编造""
    temp = 22 if units == "C" else 72
    result = f"{location}当前{temp}度 {units}，晴"
    if include_forecast:
        result += "未来5日：多云"
    return result


print(get_weather.args)
print(get_weather.description)
try:
    # Input should be 'C' or 'F'
    # print(get_weather.invoke({"location": "北京", "units": "K"}))
    print(get_weather.invoke({"units": "K"}))
except Exception as e:
    print(str(e))



# args_schema和函数的签名不匹配
class MismatchInput(BaseModel):
    ""入参""

    location: str = Field(description="城市名")


@tool(args_schema=MismatchInput)
def weather(city: str) -> str:
    ""查天气""
    return f"{city} 晴"


print(weather.args)
try:
    # weather() got an unexpected keyword argument 'location'
    print(weather.invoke({"location": "北京"}))
except Exception as e:
    print(str(e))



@tool
def with_config_param(query: str, config: RunnableConfig):
    ""搜索信息""
    return f"query={query},tags={config.get('tags')}"


print("模型可见的args", with_config_param.args)
print(
    with_config_param.invoke(
        {"query": "langchain"}, config={"tags": ["v1"], "user_id": 100}  # type: ignore
    )
)
"""


# user_id用Annotated标注成注入参数
@tool
def with_injected(query: str, user_id: Annotated[str, InjectedToolArg]) -> str:
    """搜索信息"""
    return f"query={query},user_id={user_id}"


# print("模型可见", list(with_injected.args.keys()))
# print(
#    "完整的schema",
#    list(with_injected.args_schema.model_json_schema()["properties"].keys()),
# )
# print(with_injected.invoke({"query": "x", "user_id": "u001"}))
# 在内部会通过convert_to_openai_tool把langchain的工具转换为大模型能看到的某些人
tool_desc = json.dumps(
    convert_to_openai_tool(with_injected), ensure_ascii=False, indent=2
)
print(tool_desc)
"""
大模型看到的工具里参数里没有user_id
{
  "type": "function",
  "function": {
    "name": "with_injected",
    "description": "搜索信息",
    "parameters": {
      "properties": {
        "query": {
          "type": "string"
        }
      },
      "required": [
        "query"
      ],
      "type": "object"
    }
  }
}
"""
# 工具里的args_schema时面的属性properties是有user_id
print(with_injected.args_schema.model_json_schema()["properties"])  # type: ignore
# {'query': {'title': 'Query', 'type': 'string'}, 'user_id': {'title': 'User Id', 'type': 'string'}}
# 后续在通过convert_to_openai_tool转换成给大模型看的工具的时候，会判断user_id有InjectedToolArg，把user_id过滤掉了

# 区分给模型的schema和程序校验schema
# 给模型看的不包括注入参数，给工具看的包括
#
