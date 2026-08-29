import os
import subprocess
import sys
import threading
import time

# 获取当前脚本文件所在的目录 父进程指的是MCP的客户端
base_dir = os.path.dirname(os.path.abspath(__file__))
# 拼接子进程的要运行的脚本得到完整路径  子进程指的是MCP的服务器
child_path = os.path.join(base_dir, "stdio_child.py")
# 创建子进程对象，启动子进程并设置参数
child_server_proc = subprocess.Popen(
    # 指定用当前的python解释器来运行目标子进程脚本 python.exe D:\projects\mcp_basic\stdio_child.py
    [sys.executable, child_path],
    # 把子进程的标准输入设置为管道，父子进程可以通信 父进程如果想给子进程发消息，可以把消息写入子进程的stdin标准输出
    stdin=subprocess.PIPE,
    # 把子进程的标准输出设置为管道，父子进程之间可以通信 子进程如果想给父进程发消息，可以把消息写入子进程的stdout 标准输出
    stdout=subprocess.PIPE,
    # 子进程的标准错误输出继承父进程(在子进程写错误输出的话会直接显示在父进程里)，便于输出调试的日志
    stderr=None,
    # 文本模式，直接用字符串读写，而不是字节
    text=True,
    # 指定使用utf-8编码，避免windows下出现乱码
    # encoding="utf-8",
)
request = "hello,child process"
print(f"[父进程(客户端进程)] 发送:{request}")
# 把父进程的消息写入子进程的标准输入，注意需要加换行符以便于子进程读取到完整的一行
child_server_proc.stdin.write(request + "\n")
# 刷新标准输入管道，确保消息及时发送到子进程中
child_server_proc.stdin.flush()
# 从子进程的标准输出里读取一行并且去掉收尾空白字符
response = child_server_proc.stdout.readline().strip()
print(f"[父进程] 收到：{response}")
# 关闭父进程到子进程标准输出的写入端，让子进程检测到EOF并退出
# close指的是关闭管道，相当于告诉子进程，我不会再发送数据了，你可以结束读取了
child_server_proc.stdin.close()
# 等待子进程退出，最多等3秒
exit_code = child_server_proc.wait(timeout=3)
if exit_code == 0:
    print("子进程正常退出")
else:
    print("子进程异常退出")


while True:
    # 执行检查子进程的进程状态
    exit_code = child_server_proc.poll()
    if exit_code is not None:
        print(f"子进程已经退出")
    print("子进程正常运行")
    time.sleep(1)

# wait() 阻塞等待不返加，进程退出后返回退出码

"""
def listen_child(proc):
    while True:
        line = proc.stdout.readline()
        if not line:
            break
        print(f"[监听线程]收到:{line.strip()}")
listener = threading.Thread(target =listen_child,args=(child_server_proc),daemon=True )
listener.start()
"""
