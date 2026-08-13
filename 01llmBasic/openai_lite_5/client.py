import httpx
import json
from ._constants import DEFAULT_BASE_URL, DEFAULT_TIMEOUT, build_url, build_headers
from .resources.chat import Chat
from .types.chat import ChatCompletionChunk

_SSE_PREFIX = "data: "


def _parse_sse_line(line):
    if not line or not line.startswith(_SSE_PREFIX):
        return None
    data = line[len(_SSE_PREFIX) :].strip()
    return "" if data == "[DONE]" else data


class OpenAI:
    def __init__(
        self,
        *,
        api_key: str,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = DEFAULT_TIMEOUT,
    ):
        self.api_key = api_key
        self.base_url = base_url
        self.timeout = timeout
        self.chat = Chat(self)

    def _request(self, method: str, path: str, *, json: dict | None = None):
        response = httpx.request(
            method,
            build_url(self.base_url, path),
            headers=build_headers(self.api_key),
            json=json,
            timeout=self.timeout,
        )
        return response

    def post(self, path: str, *, json: dict | None = None):
        return self._request("POST", path, json=json)

    def _post_stream(self, path, *, body=None):
        def iter_chunks():
            # 使用httpx.stream方法以流式发送POST请求
            with httpx.stream(
                "POST",
                build_url(self.base_url, path),
                headers=build_headers(self.api_key),
                json=body,
                timeout=self.timeout,
            ) as response:
                # 迭代响应体中的每一行的数据
                for line in response.iter_lines():
                    # 解析每一行的SSE(Server Sent Event)数据
                    data = _parse_sse_line(line)
                    if data is None:
                        continue
                    # 如果解析得到结果是空串，说明是流的结束标记，退出循环
                    if data == "":
                        break
                    data = json.loads(data)
                    yield ChatCompletionChunk.model_validate(data)

        return iter_chunks()
