from langchain.agents.middleware import (
    ModelCallLimitMiddleware,
    ToolCallLimitMiddleware,
)
from langchain.agents.middleware import PIIMiddleware

print(ToolCallLimitMiddleware(run_limit=10).name)
print(ToolCallLimitMiddleware(run_limit=10).name)
print(ToolCallLimitMiddleware(tool_name="search_docs", run_limit=3).name)
print(ToolCallLimitMiddleware(tool_name="get_order_id", run_limit=3).name)
print(ModelCallLimitMiddleware(run_limit=5).name)
print(PIIMiddleware("email").name)
print(PIIMiddleware("credit_card").name)
