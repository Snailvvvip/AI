# 导入FastMCP模块，它可以自动处理initialize握手
from mcp.server.fastmcp import FastMCP
import json

# 创建FastMCP实例，name参数会显示在serverInfo中
mcp = FastMCP(
    name="http-server",  # 自定义名称
    host="127.0.0.1",  # 主机名
    port=8000,  # 端口号
    streamable_http_path="/mcp",  # 自定义路径
)


@mcp.tool()
def add(a: int, b: int) -> str:
    return str(a + b)


if __name__ == "__main__":
    # 以streamable-http模式启动服务器，等待客户端的连接
    mcp.run(transport="streamable-http")
