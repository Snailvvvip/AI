from pydantic import BaseModel


class Function(BaseModel):
    name: str
    arguments: str


class ChatCompletionMessageFunctionToolCall(BaseModel):
    id: str
    type: str = "function"
    function: Function


class Message(BaseModel):
    role: str | None = None
    content: str | None = None
    tool_calls: list[ChatCompletionMessageFunctionToolCall] | None = None
    tool_call_id: str | None = None


class Choice(BaseModel):
    index: int
    finish_reason: str | None = None
    message: Message


class ChatCompletion(BaseModel):
    id: str
    model: str
    choices: list[Choice]


class ChoiceDelta(BaseModel):
    role: str | None = None
    content: str | None = None
    reasoning_content: str | None = None


class ChunkChoice(BaseModel):
    index: int
    finish_reason: str | None = None
    delta: ChoiceDelta


class ChatCompletionChunk(BaseModel):
    id: str
    model: str
    choices: list[ChunkChoice]
