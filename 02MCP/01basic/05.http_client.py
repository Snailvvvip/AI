import asyncio
import os
import sys
import httpx
from mcp import ClientSession, types
from mcp.client.streamable_http import streamable_http_client

SERVER_URL = "http://127.0.0.1:8000/mcp"
headers = {"Authorization": "Bearer your-api-key"}


async def main():
    # 异步上下文中创建一个httpx异步客户端，并设置自定义请求头
    async with httpx.AsyncClient(headers=headers) as http_client:
        async with streamable_http_client(SERVER_URL, http_client=http_client) as (
            read,
            write,
            _,
        ):
            async with ClientSession(read, write) as session:
                # 进行初始化握手，必须要先调用
                result = await session.initialize()
                print("协议版本", result.protocolVersion)
                print("服务器的名称", result.serverInfo.name)
                # 初始化成功之后，就可以调用业务接口了，比如获取工具列表
                tools = await session.list_tools()
                for tool in tools.tools:
                    print(f"- {tool.name}: {tool.description}")
                    print(f"   参数:{tool.inputSchema}")
                # 调用工具并传递参数
                result = await session.call_tool("add", {"a": 1, "b": 2})
                # 遍历返回的内容content是一个列表
                for block in result.content:
                    if hasattr(block, "text"):
                        print("调用结果:", block.text)
                if result.isError:
                    print(f"工具执行出错")


if __name__ == "__main__":
    asyncio.run(main())
