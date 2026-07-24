from agent import agent_loop
from hooks import trigger_user_prompt_hooks


def main():
    print("输入问题，回车发送。输入q 退出。\n")
    # 初始化历史消息列表
    history = []
    # 进入无限循环，不断接收用户的输入
    while True:
        try:
            # 获取用户输入，带有提示符
            query = input("\x1b[36m>> \x1b[0m")
        except (EOFError, KeyboardInterrupt):
            # 异常时输出循环
            break
        # 如果输入的内容为空，或者用户输入了q quit exit 空串 都退出循环
        if query.strip().lower() in ("q", "quit", "exit", ""):
            break
        # 触发'UserPromptSubmit'钩子，进行前置处理，返回处理后的用户输入
        query = trigger_user_prompt_hooks(query)
        # 将用户的输入添加到历史列表中
        history.append({"role": "user", "content": query})
        # 调用代理循环处理历史消息
        agent_loop(history)
        # 获取历史记录中最后一条消息
        final = history[-1]
        # 如果最后一条消息是助手回复，并且有内容输出则输出该内容
        if final.get("role") == "assistant" and final.get("content"):
            print(final["content"])


if __name__ == "__main__":
    main()
