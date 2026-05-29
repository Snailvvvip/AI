from .runnable import Runnable
from ..messages import ToolMessage


class RunnableToolExecutor(Runnable):
    def __init__(self, llm, tools):
        self.llm = llm
        self.tools = tools
        self.tools_map = {tool.name: tool for tool in tools}
        self.llm_with_tools = llm.bind_tools(tools)

    def invoke(self, input, config=None, **kwargs):
        if isinstance(input, str):
            messages = [("human", input)]
        elif isinstance(input, list):
            messages = input
        else:
            messages = [input]
        while True:
            resp = self.llm_with_tools.invoke(messages)
            if not getattr(resp, "tool_calls", None):
                return resp.content
            tool_results = []
            for tool_call in resp.tool_calls:
                tool_name = tool_call["name"]
                tool = self.tools_map.get(tool_name)
                if tool is None:
                    print(f"未知工具:{tool_name}")
                    continue
                args = tool_call["args"]
                result = tool.invoke(args)
                tool_results.append(
                    ToolMessage(str(result), tool_call_id=tool_call["id"])
                )
            messages = messages + [resp] + tool_results
