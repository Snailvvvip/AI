import re
from .messages import SystemMessage, HumanMessage, AIMessage
import json
from pathlib import Path


class PromptTemplate:
    def __init__(self, template: str, partial_variables: dict = None):
        # 保存模板字符串到实例属性
        self.template = template
        self.partial_variables = partial_variables or {}
        # 调用内部方法提取模板里的变量到变量名列表中
        all_variables = self._extract_variables(template)
        # 输入变量等于全部的变量减去部分填充的变量
        self.input_variables = [
            v for v in all_variables if v not in self.partial_variables
        ]

    @classmethod
    def from_template(cls, template: str):
        return cls(template=template)

    def _extract_variables(self, template: str):
        pattern = r"\{([^}:]+)(?::[^}]+)?\}"
        matches = re.findall(pattern, template)
        return list(dict.fromkeys(matches))

    # 填充模板中的变量
    def format(self, **kwargs):
        all_vars = {**self.partial_variables, **kwargs}
        # 计算模板中缺失的但是未传入的变量的集合
        missing_vars = set(self.input_variables) - set(kwargs.keys())
        if missing_vars:
            raise ValueError(f"缺少必须的变量:{missing_vars}")
        return self.template.format(**all_vars)

    def partial(self, **kwargs):
        new_partial_variables = {**self.partial_variables, **kwargs}
        new_template = PromptTemplate(
            template=self.template, partial_variables=new_partial_variables
        )
        return new_template


class ChatPromptValue:
    def __init__(self, messages):
        self.messages = messages

    def to_messages(self):
        return self.messages

    def to_string(self):
        parts = []
        for msg in self.messages:
            if hasattr(msg, "type") and hasattr(msg, "content"):
                role_map = {"system": "System", "human": "Human", "ai": "AI"}
                role = role_map.get(msg.type, msg.type.capitalize())
                parts.append(f"{role}:{msg.content}")
            else:
                parts.append(str(msg))
        return "\n".join(parts)


class ChatPromptTemplate:
    def __init__(self, messages):
        self.messages = messages
        self.input_variables = self._extract_input_variables()

    def _extract_input_variables(self):
        variables = set()
        for msg in self.messages:
            if isinstance(msg, tuple) and len(msg) == 2:
                _, template_str = msg
                prompt = PromptTemplate.from_template(template_str)
                variables.update(prompt.input_variables)
        return list(variables)

    def invoke(self, input_variables):
        formatted_messages = self._format_all_messages(input_variables)
        return ChatPromptValue(messages=formatted_messages)

    def _get_placeholder_value(self, variable_name, value):
        if value is None:
            raise ValueError(f"MessagePlaceHolder {variable_name} 对应的值缺失")
        if isinstance(value, ChatPromptValue):
            return value.to_messages()
        elif isinstance(value, list):
            return [self._get_single_message(item) for item in value]
        else:
            return [self._get_single_message(value)]

    def _get_single_message(self, value):
        if isinstance(value, (SystemMessage, HumanMessage, AIMessage)):
            return value
        elif hasattr(value, "type") and hasattr(value, "content"):
            return value
        elif isinstance(value, str):
            return HumanMessage(content=value)
        elif isinstance(value, tuple):
            role, content = value
            return self._create_message_from_role(role, content)
        elif isinstance(value, dict):
            role = value.get("role", "user")
            content = value.get("content", "")
            return self._create_message_from_role(role, content)
        else:
            raise TypeError("无法将占位符的内容转化为消息")

    def _format_all_messages(self, variables):
        formatted_messages = []
        for msg in self.messages:
            if isinstance(msg, tuple) and len(msg) == 2:
                role, template_str = msg
                prompt = PromptTemplate.from_template(template_str)
                content = prompt.format(**variables)
                formatted_messages.append(self._create_message_from_role(role, content))
            elif isinstance(msg, BaseMessagePromptTemplate):
                formatted_messages.append(msg.format(**variables))
            elif isinstance(msg, MessagesPlaceholder):
                placeholder_messages = self._get_placeholder_value(
                    msg.variable_name, variables.get(msg.variable_name)
                )
                formatted_messages.extend(placeholder_messages)
            else:
                formatted_messages.append(msg)
        return formatted_messages

    def _create_message_from_role(self, role, content):
        normalized_role = role.lower()
        if normalized_role == "system":
            return SystemMessage(content=content)
        elif normalized_role in ["human", "user"]:
            return HumanMessage(content=content)
        elif normalized_role in ["ai", "assistant"]:
            return AIMessage(content=content)
        else:
            raise ValueError(f"未知的角色:{role}")

    @classmethod
    def from_messages(cls, messages):
        return cls(messages=messages)

    def format_messages(self, **kwargs):
        return self._format_all_messages(kwargs)


class BaseMessagePromptTemplate:
    def __init__(self, prompt):
        self.prompt = prompt

    @classmethod
    def from_template(cls, template: str):
        prompt = PromptTemplate.from_template(template)
        return cls(prompt=prompt)

    def format(self, **kwargs):
        content = self.prompt.format(**kwargs)
        return self._create_message(content)

    def _create_message(self, content):
        raise NotImplementedError


class SystemMessagePromptTemplate(BaseMessagePromptTemplate):
    def _create_message(self, content):
        return SystemMessage(content=content)


class HumanMessagePromptTemplate(BaseMessagePromptTemplate):
    def _create_message(self, content):
        return HumanMessage(content=content)


class AIMessagePromptTemplate(BaseMessagePromptTemplate):
    def _create_message(self, content):
        return AIMessage(content=content)


class MessagesPlaceholder:
    def __init__(self, variable_name):
        self.variable_name = variable_name


class FewShotPromptTemplate:
    def __init__(
        self,
        *,
        example_selector=None,
        examples=None,
        example_prompt,
        prefix,
        suffix,
        example_separator="\n\n",
    ):
        if examples is None and example_selector is None:
            raise ValueError(f"必须提供examples或example_selector中的一项")
        if example_selector is not None and examples is not None:
            raise ValueError(f"不能同时提供examples或example_selector，只能选择一个")
        self.examples = examples
        if isinstance(example_prompt, PromptTemplate):
            self.example_prompt = example_prompt
        else:
            self.example_prompt = PromptTemplate.from_template(example_prompt)
        self.prefix = prefix
        self.suffix = suffix
        self.example_separator = example_separator
        self.example_selector = example_selector
        # 根据前缀和后缀自动推荐出需要的变量名
        self.input_variables = self._infer_input_variables()

    def _infer_input_variables(self):
        variables = set()
        variables.update(PromptTemplate.from_template(self.prefix).input_variables)
        variables.update(PromptTemplate.from_template(self.suffix).input_variables)
        return list(variables)

    def format(self, **kwargs):
        missingVars = set(self.input_variables) - set(kwargs.keys())
        if missingVars:
            raise ValueError(f"缺少必需的变量:{missingVars}")
        parts = []
        if self.prefix:
            parts.append(self._format_text(self.prefix, **kwargs))
        if self.example_selector:
            examples_block = self.example_separator.join(
                self.format_examples(input_variables=kwargs)
            )
        else:
            examples_block = self.example_separator.join(self.format_examples())
        if examples_block:
            parts.append(examples_block)
        if self.suffix:
            parts.append(self._format_text(self.suffix, **kwargs))
        return self.example_separator.join(part for part in parts if part)

    def format_examples(self, input_variables):
        if self.example_selector:
            selected_examples = self.example_selector.select_examples(input_variables)
        else:
            selected_examples = self.examples
        formatted_examples = []
        for example in selected_examples:
            formatted_examples.append(self.example_prompt.format(**example))
        return formatted_examples

    def _format_text(self, text, **kwargs):
        return PromptTemplate.from_template(text).format(**kwargs)


def load_prompt(path: str | Path, encoding: str | None = "utf-8") -> PromptTemplate:
    file_path = Path(path)
    if not file_path.exists():
        raise ValueError(f"当前文件不存在:{path}")
    if file_path.suffix != ".json":
        raise ValueError(f"只支持.json格式的文件，当前文件的后缀为{file_path.suffix}")
    with file_path.open(encoding=encoding) as file:
        config = json.load(file)
    config_type = config.get("_type", "prompt")
    if config_type != "prompt":
        raise ValueError(f"不支持的提示词类型:{config_type}.只支持prompt")
    template = config.get("template")
    if template is None:
        raise ValueError(f"配置文件中缺少template字段")
    return PromptTemplate.from_template(template)
