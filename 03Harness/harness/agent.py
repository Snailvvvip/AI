import json
from config import DEFAULT_MAX_TOKENS, MODEL_ID, CONTEXT_LIMIT
from prompt import get_system_prompt
from llm import call_llm, is_prompt_too_long_error
from utils import assistant_message_dict
from tools.executor import execute_tool
from hooks import trigger_hooks
from history import (
    tool_result_budget,
    snip_compact,
    micro_compact,
    estimate_size,
    repair_message_chain,
    compact_history,
    reactive_compact,
)

# 定义变量,用于记录上次todo_write调用以来的轮数
rounds_since_todo = 0


def agent_loop(messages: list):
    # 声明这是全局变量
    global rounds_since_todo
    # 将最大的token数量设置为默认的值8000，未来这个值可能会变
    max_tokens = DEFAULT_MAX_TOKENS
    # 把模型先设置模型 未来如果这个默认模型不能用，可能会切换备用模型
    model = MODEL_ID
    while True:
        # 获取系统提示词
        system = get_system_prompt()
        # L3:tool_result_budget  超大tool结果落盘
        messages[:] = tool_result_budget(messages)
        # L1 snip_compact 消息>50条的时候保留头3+尾47 ，中间裁掉
        messages[:] = snip_compact(messages)
        # L2: micro_compact — 旧工具结果占位 仅保留最近3条tool的完整内容，旧的变成占位符
        messages[:] = micro_compact(messages)
        # L4: compact_history — LLM 全量摘要
        if estimate_size(messages) > CONTEXT_LIMIT:
            messages[:] = compact_history(messages)
        messages[:] = repair_message_chain(messages)
        if rounds_since_todo >= 3 and messages:
            messages.append(
                {
                    "role": "user",
                    "content": "<reminder>请及时更新你的todo列表</reminder>",
                }
            )
            print(f"\x1b[33m请更新你的todo列表\x1b[0m")
            rounds_since_todo = 0
        try:
            # 调用大模型获取回复
            response = call_llm(system, messages, max_tokens, model)
        except Exception as e:
            # 如果报的错误是提示词过长的导致的错误
            if is_prompt_too_long_error(e):
                # 对消息列表进行反应式压缩，减少消息长度
                messages[:] = reactive_compact(messages)
                continue

        # 获取助手返回的消息
        choice = response.choices[0]  # type: ignore
        assistant = choice.message
        # 消耗的token在choice.usage
        # 将助手的回复以字典的形式添加到消息列表
        messages.append(assistant_message_dict(assistant))
        # 每一轮调用让计数器加1
        rounds_since_todo += 1
        # 如果助手没有工具调用，则终止循环
        if not assistant.tool_calls:
            # 调用trigger_hooks函数，触发名为Stop的钩子，传入当前的消息列表
            force = trigger_hooks("Stop", messages)
            # 如果force有值说明活没干完，也就是hook返回了需要进一步处理的信息
            if force:
                # 如果有值，则将其作为用户角色的消息添加到消息列表中
                messages.append({"role": "user", "content": force})
                # 继续while循环，重新进入 agent loop的流程
                continue
            return
        # 如果助手要调用某些人，则循环所有的工具调用
        for tool_call in assistant.tool_calls:
            # 获取工具名称
            name = tool_call.function.name  # type: ignore
            # 获取解析工具参数
            args = json.loads(tool_call.function.arguments or "{}")  # type: ignore
            # 如果用户想调的工具是压缩工具的话
            if name == "compact":
                messages[:] = compact_history(messages)
                # 跳出当前的for 循环进入下一轮的while循环
                break
            # 触发PreToolUse这个钩子，判断是否允许工具执行
            blocked = trigger_hooks("PreToolUse", name, args)
            # 只要有一个钩子函数返回一个非None的值，后面的钩子就不走了， ---------------------------------------------------
            if blocked:
                # 将[阻止信息]以tool角色的形式添加到消息列表中
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": str(blocked),
                    }
                )
                continue

            output = execute_tool(name, args)
            # 触发PostToolUse钩子，并进行后置处理
            trigger_hooks("PostToolUse", name, args, output)
            # 如果本次调用的工具就是todo_write,则也重置轮数计数器为0
            if name == "todo_write":
                rounds_since_todo = 0
            # 把工具调用的结果以特定的工具格式添加到消息列表
            messages.append(
                {"role": "tool", "tool_call_id": tool_call.id, "content": output}
            )
