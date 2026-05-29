import os
import openai
from .messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from .prompts import ChatPromptValue
from .runnables import RunnableConfigurableFields, RunnableConfigurableAlternatives
import json


class ChatOpenAI:
    def __init__(self, model: str = "gpt-4o", **kwargs):
        self.model = model
        self.api_key = kwargs.get("api_key") or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError(f"需要提供api_key或者设置OPENAI_API_KEY环境变量")
        # 保存着除了api_key之外其它的额外参数，供API调用
        self.model_kwargs = {k: v for k, v in kwargs.items() if k != "api_key"}
        self.client = openai.OpenAI(api_key=self.api_key)

    # 调用模型生成回复的方法
    def invoke(self, input, **kwargs):
        # 将输入的数据转换成openai期望的消息的格式
        messages = self._convert_input(input)
        params = {
            "model": self.model,
            "messages": messages,
            **self.model_kwargs,
            **kwargs,
        }
        # 使用OpenAI的客端发起完成请求并获取回复
        response = self.client.chat.completions.create(**params)
        choice = response.choices[0]
        content = choice.message.content or ""
        msg = AIMessage(content=content)
        # 如果有工具调用，需要解析并添加到消息中
        if hasattr(choice.message, "tool_calls") and choice.message.tool_calls:
            tool_calls = []
            for tool_call in choice.message.tool_calls:
                args = (
                    json.loads(tool_call.function.arguments)
                    if tool_call.function.arguments
                    else {}
                )
                tool_calls.append(
                    {
                        "id": tool_call.id,
                        "name": tool_call.function.name,
                        "args": args,
                        "type": "tool_call",
                    }
                )
            msg.tool_calls = tool_calls
        return msg

    # 流式调用模型生成回复
    def stream(self, input, **kwargs):
        # 将输入的数据转换成openai期望的消息的格式
        messages = self._convert_input(input)
        params = {
            "model": self.model,
            "messages": messages,
            "stream": True,  # 启用流式调用
            **self.model_kwargs,
            **kwargs,
        }
        # 使用OpenAI的客端发起完成请求并获取回复
        stream = self.client.chat.completions.create(**params)
        for chunk in stream:
            if chunk.choices and len(chunk.choices) > 0:
                delta = chunk.choices[0].delta
                if hasattr(delta, "content") and delta.content:
                    yield AIMessage(content=delta.content)

    def _convert_input(self, input):
        if isinstance(input, ChatPromptValue):
            input = input.to_messages()
        if isinstance(input, str):
            return [{"role": "user", "content": input}]
        elif isinstance(input, list):
            messages = []
            for msg in input:
                # 如果msg是一个字符串，作为用户消息加入
                if isinstance(msg, str):
                    messages.append({"role": "user", "content": msg})
                elif isinstance(
                    msg, (AIMessage, HumanMessage, SystemMessage, ToolMessage)
                ):
                    if isinstance(msg, AIMessage):
                        role = "assistant"
                        # 如果AIMessage包含tool_calls,需要转换成OpenAI的格式
                        if hasattr(msg, "tool_calls") and msg.tool_calls:
                            tool_calls = []
                            for tool_call in msg.tool_calls:
                                tool_calls.append(
                                    {
                                        "id": tool_call.get("id", ""),
                                        "type": "function",
                                        "function": {
                                            "name": tool_call.get("name", ""),
                                            "arguments": str(tool_call.get("args", {})),
                                        },
                                    }
                                )
                            msg_dict = {
                                "role": role,
                                "content": (
                                    msg.content if hasattr(msg, "content") else str(msg)
                                ),
                                "tool_calls": tool_calls,
                            }
                            messages.append(msg_dict)
                            continue
                    elif isinstance(msg, HumanMessage):
                        role = "user"
                    elif isinstance(msg, SystemMessage):
                        role = "system"
                    elif isinstance(msg, ToolMessage):
                        role = "tool"
                    content = msg.content if hasattr(msg, "content") else str(msg)
                    msg_dict = {"role": role, "content": content}
                    if (
                        isinstance(msg, ToolMessage)
                        and hasattr(msg, "tool_call_id")
                        and msg.tool_call_id
                    ):
                        msg_dict["tool_call_id"] = msg.tool_call_id
                    messages.append(msg_dict)
                elif isinstance(msg, dict):
                    messages.append(msg)
                elif isinstance(msg, tuple) and len(msg) == 2:
                    role, content = msg
                    if role == "human":
                        role = "user"
                    messages.append({"role": role, "content": content})
            return messages
        else:
            return [{"role": "user", "content": str(input)}]

    # 定义可配置字段的方法，用于包装当前的实例，支持部分参数在运行的时候动态调整
    def configurable_fields(self, **fields):
        return RunnableConfigurableFields(default=self, fields=fields)

    def configurable_alternatives(
        self,
        selector_field,  # ConfigurableField id="provider", name="LLM提供商"
        *,
        default_key,  # 默认的key，现在传的是openai
        **alternatives,
    ):
        return RunnableConfigurableAlternatives(
            selector_field=selector_field,  # 用于选择分支的字段信息
            default_key=default_key,  # 默认的分支key
            alternatives=alternatives,  # 所有的可供切换的分支字典
        )

    def bind_tools(self, tools, **kwargs):
        # 绑定工具列表到模型，返回一个支持工具调用的包装对象
        return _BoundToolsLLM(self, tools, **kwargs)


class _BoundToolsLLM:
    def __init__(self, llm, tools, **kwargs):
        # 保存原始的LLM实例
        self.llm = llm
        # 保存StructuredTool工具列表
        self.tools = tools
        # 保存其它可能的参数
        self.kwargs = kwargs
        # 将StructuredTool工具列表转成OpenAI格式描述的工具列表
        self.openai_tools = [self._tool_to_openai(tool) for tool in tools]

    def _tool_to_openai(self, tool):
        schema = tool.args_schema.model_json_schema()
        # 这是OPENAI工具格式规范
        return {
            "type": "function",
            "function": {
                "name": tool.name,
                "description": tool.description,
                "parameters": schema,
            },
        }

    def invoke(self, input, **kwargs):
        # 合并初始化的参数和本次调用的时候传入的参数
        merged_kwargs = {**self.kwargs, **kwargs}
        # 指定tools参数为已经转换后的OpenAI的工具列表
        merged_kwargs["tools"] = self.openai_tools
        # 调用原始的LLM的invoke方法并返回结果
        return self.llm.invoke(input, **merged_kwargs)


class ChatDeepSeek:
    def __init__(self, model: str = "deepseek-chat", **kwargs):
        self.model = model
        self.api_key = kwargs.get("api_key") or os.getenv("DEEPSEEK_API_KEY")
        if not self.api_key:
            raise ValueError(f"需要提供api_key或者设置DEEPSEEK_API_KEY环境变量")
        # 保存着除了api_key之外其它的额外参数，供API调用
        self.model_kwargs = {k: v for k, v in kwargs.items() if k != "api_key"}
        base_url = kwargs.get("base_url", "https://api.deepseek.com/v1")
        self.client = openai.OpenAI(api_key=self.api_key, base_url=base_url)

    # 调用模型生成回复的方法
    def invoke(self, input, **kwargs):
        # 将输入的数据转换成openai期望的消息的格式
        messages = self._convert_input(input)
        params = {
            "model": self.model,
            "messages": messages,
            **self.model_kwargs,
            **kwargs,
        }
        # 使用OpenAI的客端发起完成请求并获取回复
        response = self.client.chat.completions.create(**params)
        choice = response.choices[0]
        content = choice.message.content or ""
        return AIMessage(content=content)

    def _convert_input(self, input):
        if isinstance(input, str):
            return [{"role": "user", "content": input}]
        else:
            return [{"role": "user", "content": str(input)}]


class ChatTongyi:
    def __init__(self, model: str = "qwen-max", **kwargs):
        self.model = model
        self.api_key = kwargs.get("api_key") or os.getenv("DASHSCOPE_API_KEY")
        if not self.api_key:
            raise ValueError(f"需要提供api_key或者设置DASHSCOPE_API_KEY环境变量")
        # 保存着除了api_key之外其它的额外参数，供API调用
        self.model_kwargs = {k: v for k, v in kwargs.items() if k != "api_key"}
        base_url = kwargs.get(
            "base_url", "https://dashscope.aliyuncs.com/compatible-mode/v1"
        )
        self.client = openai.OpenAI(api_key=self.api_key, base_url=base_url)

    # 调用模型生成回复的方法
    def invoke(self, input, **kwargs):
        # 将输入的数据转换成openai期望的消息的格式
        messages = self._convert_input(input)
        params = {
            "model": self.model,
            "messages": messages,
            **self.model_kwargs,
            **kwargs,
        }
        # 使用OpenAI的客端发起完成请求并获取回复
        response = self.client.chat.completions.create(**params)
        choice = response.choices[0]
        content = choice.message.content or ""
        return AIMessage(content=content)

    def _convert_input(self, input):
        if isinstance(input, str):
            return [{"role": "user", "content": input}]
        else:
            return [{"role": "user", "content": str(input)}]
