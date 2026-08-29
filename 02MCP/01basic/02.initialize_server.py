# 导入FastMCP模块，它可以自动处理initialize握手
from mcp.server.fastmcp import FastMCP

# 创建FastMCP实例，name参数会显示在serverInfo中
mcp = FastMCP(name="hello-server")


# 使用装饰器注册greet工具，初始化的时候会自动声明tools的能力
@mcp.tool()
def greet(name: str = "world") -> str:
    return f"Hello,{name}"


if __name__ == "__main__":
    # 以stdio模式启动服务器，等待客户端的连接
    mcp.run(transport="stdio")
