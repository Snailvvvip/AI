from pydantic import BaseModel, Field
from smartchain.tools import tool
from smartchain.chat_models import ChatOpenAI
from smartchain.messages import ToolMessage


class AddInput(BaseModel):
    a: int = Field(..., description="被加数")
    b: int = Field(..., description="加数")


@tool(args_schema=AddInput, description="计算两个数的和")
def add(a: int, b: int) -> int:
    print("调用加法工具", a, b)
    return a + b


def chat_with_tools(llm_with_tools, initial_message):
    """支持多轮连续调用工具，必须要时可以进行多次调用"""
    # 构建工具名称到工具函数的映射字典
    tools_map = {add.name: add}
    # 1.把初始消息转成列表 2.浅拷贝，不会修改原来的列表
    messages = list(initial_message)
    # 开始循环直到模型不再请求调用工具为止
    while True:
        # 调用大模型并传入消息
        resp = llm_with_tools.invoke(messages)
        print(f"模型响应:", resp.content)
        # 检查模型返回的内容中是否有tool_calls
        if not getattr(resp, "tool_calls", None):
            print("最终回答:", resp.content)
            return resp.content
        # 存放工具调用的结果列表
        tool_results = []
        for tool_call in resp.tool_calls:
            tool_name = tool_call["name"]
            tool = tools_map.get(tool_name)
            if tool is None:
                print(f"未知工具:{tool_name}")
                continue
            args = tool_call["args"]
            result = tool.invoke(args)
            print(f"工具{tool_name}执行{args}:{result}")
            tool_results.append(ToolMessage(str(result), tool_call_id=tool_call["id"]))
        # 所有的工具调用结束后，将最新模型返回的消息，以及工具的所有调用结果消息一起组成下一轮消息列表
        messages = messages + [resp] + tool_results


llm = ChatOpenAI(model="gpt-4o")
llm_with_tools = llm.bind_tools([add])
messages = [("human", "请帮我计算3和5的和，并调用合适的工具实现")]
chat_with_tools(llm_with_tools, messages)
# 'finish_reason': 'tool_calls'
# tool_calls=[{'name': 'add', 'args': {'a': 3, 'b': 5}, id='id1','type': 'tool_call'}]
#
[
    {
        "id": "id1",
        "type": "function",
        "function": {"name": "add", "arguments": "{'a': 3, 'b': 5}"},
    }
]
