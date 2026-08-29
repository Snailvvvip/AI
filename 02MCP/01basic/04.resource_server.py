# 导入FastMCP模块，它可以自动处理initialize握手
from mcp.server.fastmcp import FastMCP
import json

# 创建FastMCP实例，name参数会显示在serverInfo中
mcp = FastMCP(name="resource-server")


# 使用@mcp.resource装饰器注册资源，指定URI和mime_type
@mcp.resource("config://app", mime_type="application/json")
def app_config() -> str:
    """应用配置 (静态资源，无参数)"""
    return json.dumps({"theme": "dark", "lang": "zh-CN"}, ensure_ascii=False)


@mcp.resource("note://{title}", mime_type="text/plain")
def read_note(title: str) -> str:
    """按标题读取笔记"""
    return f"笔记标题：{title}\n内容 这是MCP的资源"


if __name__ == "__main__":
    # 以stdio模式启动服务器，等待客户端的连接
    mcp.run(transport="stdio")
