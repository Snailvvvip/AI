# 定义消息基础类
class BaseMessage:
    def __init__(self, content: str, **kwargs):
        self.content = content
        # 设置消息的类型
        self.type = kwargs.get("type", "base")

    def __str__(self):
        return self.content

    def __repr__(self):
        return f"{self.__class__.__name__}(content={self.content})"


# AI消息
class AIMessage(BaseMessage):
    def __init__(self, content, **kwargs):
        super().__init__(content, type="ai", **kwargs)


# 用户消息
class HumanMessage(BaseMessage):
    def __init__(self, content, **kwargs):
        super().__init__(content, type="human", **kwargs)


# 系统消息
class SystemMessage(BaseMessage):
    def __init__(self, content, **kwargs):
        super().__init__(content, type="system", **kwargs)


# 系统消息
class ToolMessage(BaseMessage):
    def __init__(self, content, tool_call_id: str = None, **kwargs):
        super().__init__(content, type="tool", **kwargs)
        self.tool_call_id = tool_call_id
