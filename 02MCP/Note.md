# 通信协议
- MCP 的所有通信都基于 JSON-RPC 2.0。
- 消息只有三类：请求（Request）、响应（Response）、通知（Notification）
- 请求和响应都有id，通知没有id;

# MCP主要支持三种连接（传输）方式
涵盖了从本地进程到远程网络的不同场景
## 1. stdio（Standard Input/Output，标准输入输出）

## 2. Streamable HTTP（流式 HTTP）

## 3. SSE（Server-Sent Events，服务器推送事件）




# IPC Inter-Process Communication  进程间通信 
父子进程通信是IPC通信众多应用场景中的一种
## 常见的 IPC 通信方式
- 管道（Pipe / FIFO）：最经典的 IPC 方式。分为匿名管道（通常用于父子进程间）和命名管道（可用于任意进程间）。数据以字节流的形式单向传输。
- 消息队列（Message Queue）：允许进程间通过发送和接收离散的消息块来通信，避免了管道的字节流解析问题，支持异步通信。
- 共享内存（Shared Memory）：最高效的 IPC 方式。多个进程直接映射同一块物理内存，无需数据拷贝。但需要配合信号量等机制来保证数据访问的同步。
- 信号量与信号（Semaphores & Signals）：主要用于进程间的同步和异步事件通知，而非大量数据传输。
- 套接字（Sockets）：虽然常用于网络通信，但 Unix Domain Socket 专门用于同一台机器上的进程间通信，支持全双工，且性能优于 TCP/IP 网络套接字。

## 父子进程间通信有很多种方式
- 管道 Pipe  父子进程比较常用 subprocess.PIPE创建匿名管道，这是典型的父子进程IPC的方式
- 命名管道 FIFO 任意进程可用
- 消息队列、共享内存、信号量 任意进程可用
- Socket 网络通信
- 信号 Signal  任意进程


# 父进程收子进程的消息
1. 阻塞读取 最简单 适合一发一收
2. while True轮询 通用 适合持续通信 ，不知道对方回复几条
3. 线程异步监听，这种方式不会阻塞主进程 

子进程while循环结束，子进程就自然退出了(一旦子进程执行完所有的代码后子进程就退出)
python没有类似于node process.exit(0)
子进程如果想退出，有以下方式
1. 让代码自然执行完
2. sys.exit(0) 主动退出子进程
3. 通过抛异常来退出  raise SystemExit

子进程如果挂了，父进程能知道吗 ？
父进程可以检测子进程异常的
1. exit_code是否为0来判断子进程是否正常退出
2. poll


# 自动提取入参数信息
MCP框架 以及像FastAPI 等都是通过反射机制和约定规则自动提取入参数信息

```python
#  解析器会自动计取这个参数名和参数的类型
def get_weather(city: str) -> str:
    data = {"city": city, "temp": "22度", "condition": "晴"}
    return json.dumps(data, ensure_ascii=False)

sig = inspect.signature(get_weather)
params = sig.parameters
print(params)
print(params["city"].annotation)

```

# MCP与cli 的区别

```text
                     MCP                                       cli
思路   是通过标准协议封装工具，让AI大模型统一调用          AI直接通过命令行调用原生的工具，无中间层
Token   消耗比较多的Token                                    不太需要消耗上下文Token
性能       延迟会高一点                                       延迟比较低，性能比较高

```
- 如果你做的AI原生适合用cli；   
- 但是在有些场景下
    - 需要复杂共享
    - 企业级权限管理，治理与分发，需要统一权限管理，费用跟踪，或者需要一键安装分给普通的非技术用户的情况下还是适合MCP

#  资源和工具 
工具是动词，表示的是动作，资源是名词，表示的数据
工具是主动的，由AI主动调用 AI根据自己的想法决定我想调用哪个工具，执行什么操作
资源是由AI被动引用，AI在回答问题的时候，发现自己需要知道什么，就自动去读取

# MCP和Function Call
MCP和Function Call是标准化协议和底层能力的关系，不是包装的关系

大模型LLM  
  - 理解用户的意图
  - 决定是否调用工具
  - 生成调用参数
Function Call 大模型厂商提供的原生API接口，让模型能够"调用"外部函数
  - OpenAI API
  - 原生支持
MCP 上层协议  是在Function Call之上构建的一层统一抽象层
  - 标准化工具
  - 跨平台统一


首先Function Call一定需要MCP吗？

Function Call只是说大模型可以发起工具调用给Agent
至于工具谁来执行大模型是不管的

function call是模型的技能(让AI可以能动手)
MCP是工具的插座，让AI可以即插即用

function call技能 ，是大模型自带的提线木偶的能力，告诉AI手在这里，怎么动你说了算。
但每个厂商 openai anthropic控制方式不同
MCP提供了一个国际化的标准插头，AI只要认这个插头，就能自动适合任何厂商的模型

