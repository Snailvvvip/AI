import asyncio
import os
import sys
from mcp import ClientSession, StdioServerParameters, types
from mcp.client.stdio import stdio_client
from pydantic import AnyUrl


async def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    server_path = os.path.join(base_dir, "04.resource_server.py")
    # 配置服务器子进程启动函数 command=python.exe args=[D:\projects\mcp_basic\initialize_server.py]
    server_params = StdioServerParameters(command=sys.executable, args=[server_path])
    # 建立stdio连接并自动启动子进程
    async with stdio_client(server_params) as (read, write):
        # 创建会话对象，准备与服务器进行通信
        async with ClientSession(read, write) as session:
            # 进行初始化握手，必须要先调用
            result = await session.initialize()
            print("协议版本", result.protocolVersion)
            print("服务器的名称", result.serverInfo.name)
            # 列出静态资源列表
            resources_result = await session.list_resources()
            print(
                f"静态资源:",
                [str(resource.uri) for resource in resources_result.resources],
            )
            templates_result = await session.list_resource_templates()
            print(
                f"资源模板:",
                [
                    str(resourceTemplate.uriTemplate)
                    for resourceTemplate in templates_result.resourceTemplates
                ],
            )

            resource_result = await session.read_resource(AnyUrl("config://app"))
            for block in resource_result.contents:
                if isinstance(block, types.TextResourceContents):
                    print("[config://app]:", block.text)
            resource_result = await session.read_resource(AnyUrl("note://weekly"))
            for block in resource_result.contents:
                if isinstance(block, types.TextResourceContents):
                    print("[note://weekly]:", block.text)


if __name__ == "__main__":
    asyncio.run(main())
