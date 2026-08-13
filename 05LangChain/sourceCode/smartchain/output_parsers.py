from abc import ABC, abstractmethod
import re
import json
import pydantic
from .prompts import PromptTemplate


class BaseOutputParser(ABC):
    @abstractmethod
    def parse(self, text):
        pass


class StrOutputParser(BaseOutputParser):
    def parse(self, text: str) -> str:
        if not isinstance(text, str):
            return str(text)
        return text

    def __repr__(self):
        return f"StrOutputParser()"


def parse_json(text):
    text = text.strip()
    json_match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
    # 如果找到markdown格式的json字符串
    if json_match:
        # 提取代码块中的JSON字符串并去除首尾空格
        text = json_match.group(1).strip()
    # 再次匹配文本中的
    json_match = re.search(r"(\{.*\}|\ [.*\ ])", text, re.DOTALL)
    if json_match:
        text = json_match.group(1).strip()
    return json.loads(text)


class JsonOutputParser(BaseOutputParser):
    def parse(self, input):
        try:
            parsed = parse_json(input)
            return parsed
        except json.JSONDecodeError as e:
            raise ValueError(f"无法解析JSON输出:{input[:100]},错误原因:{str(e)}")
        except Exception as e:
            raise ValueError(f"解析JSON时出错")

    def get_format_instructions(self):
        return """请以 JSON 格式输出你的回答。
        输出格式要求：
        1. 使用有效的 JSON 格式
        2. 可以使用 markdown 代码块包裹：```json ... ```
        3. 确保所有字符串都用双引号
        4. 确保 JSON 格式正确且完整

        示例格式：
        ```json
        {
        "key": "value",
        "number": 123
        }
       ```
       """


class PydanticOutputParser(JsonOutputParser):
    def __init__(self, pydantic_object):
        super().__init__()
        self.pydantic_object = pydantic_object

    def parse(self, text):
        try:
            json_obj = super().parse(text)
            return self._parse_obj(json_obj)
        except Exception as e:
            raise ValueError(
                f"无法把{text}解析为Pydantic模型{str(self.pydantic_object)}"
            )

    def _parse_obj(self, obj):
        # Pydantic V2+的用法
        if hasattr(self.pydantic_object, "model_validate"):
            return self.pydantic_object.model_validate(obj)
        elif hasattr(self.pydantic_object, "parse_obj"):
            return self.pydantic_object.parse_obj(obj)
        else:
            return self.pydantic_object(**obj)

    def _get_schema(self):
        try:
            if hasattr(self.pydantic_object, "model_json_schema"):  # V2
                return self.pydantic_object.model_json_schema()
            elif hasattr(self.pydantic_object, "schema"):  # V1
                return self.pydantic_object.schema()
            else:
                return {}
        except Exception as e:
            return {}

    def get_format_instructions(self):
        # 获取pydantic模型的schema
        schema = self._get_schema()
        reduced_schema = dict(schema)
        if "description" in reduced_schema:
            del reduced_schema["description"]
        schema_str = json.dumps(reduced_schema, ensure_ascii=False, indent=2)
        return f"""请以 JSON 格式输出你的回答,必须严格遵循以下的Schema

            ```json
            {schema_str}
            ```

            输出格式要求：
            1. 必须完全符合上述的 Schema结构
            2.所有的必需字段都必须提供
            3.字段类型必须匹配(字符串、数字、布尔值等)
            4.使用有效的JSON格式
            5.可以使用markdown代码块包裹 ```json JSON字符串 ```

            确保输出是有效的JSON，并且符合 schema定义
        """


class OutputParserException(ValueError):
    def __init__(self, message, llm_output):
        super().__init__(message)
        self.llm_output = llm_output


class SimpleChain:
    def __init__(self, prompt, llm, parser):
        self.prompt = prompt
        self.llm = llm
        self.parser = parser

    def invoke(self, input_dict):
        formatted = self.prompt.format(**input_dict)
        response = self.llm.invoke(formatted)
        if hasattr(response, "content"):
            content = response.content
        else:
            content = str(response)
        return self.parser.parse(content)


class OutputFixingParser(BaseOutputParser):
    def __init__(self, parser, retry_chain, max_retries):
        self.parser = parser
        self.retry_chain = retry_chain
        self.max_retries = max_retries

    @classmethod
    def from_llm(cls, llm, parser, prompt=None, max_retries=1):
        # 如果没有提供prompt,则使用默认的修复模板
        fix_template = """
            你是一个专门修复LLM输出格式的助手
            原始输出:
            {completion}
            出现的错误
            {error}
            输出应该遵循的格式为:
            {instructions}
            请修复原始输出，使其符合要求的格式
            只返回修复后的输出，不要添加任何的解释
        """
        prompt = PromptTemplate.from_template(fix_template)
        # 创建修复链
        retry_chain = SimpleChain(prompt, llm, StrOutputParser())
        return cls(parser=parser, retry_chain=retry_chain, max_retries=max_retries)

    def parse(self, completion):
        # 初始化重试的次数
        retries = 0
        while retries <= self.max_retries:
            try:
                # 先尝试直接使用基础解析器进行解析
                return self.parser.parse(completion)
            except (ValueError, OutputParserException, Exception) as e:
                # 如果已经达到了最大重试的次数,直接抛异常
                if retries >= self.max_retries:
                    raise OutputParserException(
                        f"解析失败,已重试了{retries}次:{e}", llm_output=completion
                    )
                retries += 1
                print(f"第{retries}次尝试修复")
                instructions = self.parser.get_format_instructions()
                # 调用retry_chain 调用大模型进行修复输出
                completion = self.retry_chain.invoke(
                    {
                        "completion": completion,
                        "error": str(e),
                        "instructions": instructions,
                    }
                )
        raise OutputParserException(
            f"解析失败,已重试了{retries}次:{e}", llm_output=completion
        )


class RetryOutputParser(BaseOutputParser):
    def __init__(self, parser, retry_chain, max_retries):
        self.parser = parser
        self.retry_chain = retry_chain
        self.max_retries = max_retries

    @classmethod
    def from_llm(cls, llm, parser, prompt=None, max_retries=1):
        if prompt is None:
            retry_template = """
                Prompt:{prompt}
                Completion:{completion}
                上面的Completion并没有满足Prompt中的约束要求.
                请重新生成一个新的满足要求的输出
           """
            prompt = PromptTemplate.from_template(retry_template)
        # 创建修复链
        retry_chain = SimpleChain(prompt, llm, StrOutputParser())
        return cls(parser=parser, retry_chain=retry_chain, max_retries=max_retries)

    def parse_with_prompt(self, complection, prompt_value):
        # 初始化重试的次数
        retries = 0
        while retries <= self.max_retries:
            try:
                # 先尝试直接使用基础解析器进行解析
                return self.parser.parse(completion)
            except (ValueError, OutputParserException, Exception) as e:
                # 如果已经达到了最大重试的次数,直接抛异常
                if retries >= self.max_retries:
                    raise OutputParserException(
                        f"解析失败,已重试了{retries}次:{e}", llm_output=completion
                    )
                retries += 1
                print(f"第{retries}次尝试修复")
                try:
                    # 调用retry_chain 调用大模型进行修复输出
                    completion = self.retry_chain.invoke(
                        {
                            "prompt": prompt_value.to_string(),
                            "completion": complection,
                        }
                    )
                except Exception as e:
                    raise OutputParserException(
                        f"解析失败,已重试了{retries}次:{e}", llm_output=completion
                    )
        raise OutputParserException(
            f"解析失败,已重试了{retries}次:{e}", llm_output=completion
        )

    def parse(self, text):
        pass
