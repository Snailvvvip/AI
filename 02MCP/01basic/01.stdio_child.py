import sys

# 如果直接发的是\n,如果发的是  \n.那就继续循环
# 使用一个无限循环，持续处理父进程发过来的请求
while True:
    # 从标准输入里读取一行，如果父进程没有写入会阻塞等待
    line = sys.stdin.readline()
    # 如果读取的是空字符串，表示输入流将要被关闭，子进程需要退出
    if not line:
        break
    message = line.strip()
    # 去掉空字符后是空的
    if not message:
        continue
    # print=sys.stdout.write
    # 向标准错误输出中打印调试信息，一定要写到错误输出里，确保协议数据不会被干扰
    # 正常情况下 window cmd用的编码是GBK
    print(f"[子进程]收到:{message}", file=sys.stderr)
    reply = f"reply：receive {message}"
    # 将回复消息写入到子进程标准输出里，父进程可以读取到
    sys.stdout.write(reply + "\n")
    # 刷新子进程的标准输出缓冲区，确保消息可以及时发送到父进程
    sys.stdout.flush()
