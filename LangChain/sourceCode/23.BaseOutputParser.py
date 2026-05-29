from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import BaseOutputParser
from langchain_core.exceptions import OutputParserException
from pydantic import Field


# 从 smartchain 库导入 PromptTemplate
# from smartchain.prompts import PromptTemplate
# 从 smartchain 库导入 ChatOpenAI
# from smartchain.chat_models import ChatOpenAI
# 从 smartchain 库导入 BaseOutputParser 和 OutputParserException
# from smartchain.output_parsers import BaseOutputParser, OutputParserException
class BooleanOutputParser(BaseOutputParser):
    true_values: list = Field(default=["TRUE", "YES", "是", "Y", "1"])
    # false_values: list = Field(default=["FALSE", "NO", "否", "N", "0"])

    def __init__(self):
        super().__init__()
        self.true_values = ["TRUE", "YES", "是", "Y", "1"]
        # self.false_values = ["FALSE", "NO", "否", "N", "0"]
        # object.__setattr__(self, "true_values", ["TRUE", "YES", "是", "Y", "1"])
        # object.__setattr__(self, "false_values", ["FALSE", "NO", "否", "N", "0"])

    # @property
    # def true_values(self):
    #    return ["TRUE", "YES", "是", "Y", "1"]

    # @property
    # def false_values(self):
    #    return ["FALSE", "NO", "否", "N", "0"]

    def parse(self, text):
        cleaned_text = text.strip().upper()
        if cleaned_text in self.true_values:
            return True
        elif cleaned_text in self.false_values:
            return False
        else:
            raise OutputParserException(
                f"BooleanOutputParser无法解析{text}",
                f"期望的值:{self.true_values}或{self.false_values}",
            )

    def get_format_instructions(self) -> str:
        return f"请输出{self.true_values}或{self.false_values}"


# 构建一个布尔值解析器实例
bool_parser = BooleanOutputParser()

# 构建测试用例列表
test_cases = [
    "YES",
    "no",
    "true",
    "FALSE",
    "是",
    "否",
    "1",
    "0",
]

# 遍历所有测试用例，运行解析器并打印结果
for test in test_cases:
    result = bool_parser.parse(test)
    print(f"  '{test}' -> {result}")
