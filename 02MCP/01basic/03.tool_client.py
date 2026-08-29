import asyncio
import os
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    server_path = os.path.join(base_dir, "03.tool_server.py")
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
            # 初始化成功之后，就可以调用业务接口了，比如获取工具列表
            tools = await session.list_tools()
            for tool in tools.tools:
                print(f"- {tool.name}: {tool.description}")
                print(f"   参数:{tool.inputSchema}")
            # 调用工具并传递参数
            result = await session.call_tool("search_city_weather", {"city": "北京"})
            # 遍历返回的内容content是一个列表
            for block in result.content:
                if hasattr(block, "text"):
                    print("调用结果:", block.text)
            if result.isError:
                print(f"工具执行出错")


if __name__ == "__main__":
    asyncio.run(main())
