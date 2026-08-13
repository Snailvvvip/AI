from ..._constants import CHAT_COMPLETIONS_PATH
from ...types.chat import ChatCompletion


class Completions:
    def __init__(self, client) -> None:
        self._post = client.post
        self._post_stream = client._post_stream

    def create(self, *, model, stream=False, messages, tools, **kwargs):
        # 构建请求体
        payload = {"model": model, "messages": messages, "tools": tools, **kwargs}
        if stream:
            return self._post_stream(
                CHAT_COMPLETIONS_PATH,
                body={**payload, "stream": True},
            )
        # 发送POST请求
        response = self._post(CHAT_COMPLETIONS_PATH, json=payload)
        # 对响应的JSON数据进行模型验证，并返回ChatCompletion的实例
        return ChatCompletion.model_validate(response.json())
