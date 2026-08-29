# 从 langchain.agents 导入 create_agent
from langchain.agents import create_agent

# 导入模型调用限额中间件
from langchain.agents.middleware import ToolCallLimitMiddleware

# InMemorySaver 是最简单的 checkpointer 实现
from langgraph.checkpoint.memory import InMemorySaver

# 从 langchain.tools 导入 tool 装饰器
from langchain.tools import tool

# 从 dotenv 导入环境变量加载函数
from dotenv import load_dotenv

# 加载 .env 中的 API key
load_dotenv(override=True)


@tool
def search_docs(query: str) -> str:
    """搜索内部文档"""
    return f"与{query}相关的3条结果"


@tool
def lookup_policy(topic: str) -> str:
    """查询制度"""
    return f"请假需要提前申请"


agent = create_agent(
    model="deepseek:deepseek-v4-flash",
    tools=[search_docs, lookup_policy],
    # thread_limit跨多次invoke累计，需要checkpointer+thread_id
    # checkpointer=InMemorySaver(),
    middleware=[
        ToolCallLimitMiddleware(run_limit=10),  # 全局 单轮invoke最多调用10次工具
        ToolCallLimitMiddleware(
            tool_name="search_docs", run_limit=3
        ),  # 针对一某些贵的工具，单轮最多调用3轮工具
        ToolCallLimitMiddleware(
            tool_name="lookup_policy", run_limit=3
        ),  # 针对一某些贵的工具，单轮最多调用3轮工具
    ],
    system_prompt="搜索文档用search_docs,问公司制度用lookup_policy，不要无意义重复搜索",
)
result = agent.invoke(
    {"messages": [{"role": "user", "content": "报销制度要点?"}]},
)
for i, msg in enumerate(result["messages"]):
    content = getattr(msg, "content", "")
    tool_calls = getattr(msg, "tool_calls", "")
    msg_type = type(msg).__name__
    print(f"[{i}] {msg_type}:{repr(content)} {repr(tool_calls)}")
