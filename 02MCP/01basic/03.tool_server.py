# 导入FastMCP模块，它可以自动处理initialize握手
from mcp.server.fastmcp import FastMCP
import json

# 创建FastMCP实例，name参数会显示在serverInfo中
mcp = FastMCP(name="hello-server")


@mcp.tool(name="search_city_weather", description="根据城市名查询实时天气")
def get_weather(city: str) -> str:
    """查询指定城市的当前天气"""
    data = {"city": city, "temp": "22度", "condition": "晴"}
    return json.dumps(data, ensure_ascii=False)


if __name__ == "__main__":
    # 以stdio模式启动服务器，等待客户端的连接
    mcp.run(transport="stdio")
