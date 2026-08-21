from langchain_core.messages import ToolMessage, HumanMessage

messages = []
result = {}
## 方案一 补齐ToolMessage
# raw就是AIMessage  里面会有 tool_calls
raw = result["raw"]
messages.append(raw)  # 上一轮的 AIMessage
err = result["parsing_error"]
# 给每一个tool_call补一条应答消息，满足协议要求
for tc in raw.tool_calls:
    messages.append(
        ToolMessage(content=f"上次输出未通过校验,出错原因:{err}", tool_call_id=tc["id"])
    )
messages.append(HumanMessage(f"上次输出无法通过校验：{err}。请重新抽取。"))

## 方案二 抛弃AIMessage
messages.append(HumanMessage(f"上次输出无法通过校验：{err}。请重新抽取。"))
