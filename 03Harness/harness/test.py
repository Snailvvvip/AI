"""
msg = "hello" "world"
print(msg, type(msg))
msg2 = ("hello", "world")
print(msg2, type(msg2))


import sys
import os

# bytes bytes[]
# bytes 单个的字节序列 不可变的，有点像字符串，用的是连续内存[0x1,0x2....]可以存图片文件
# bytes[] 字节数组的数组，指的是多个独立的bytes对象
img_data: bytes = b"\xff\xd8"
print(img_data, type(img_data))

chunks: list[bytes] = [b"\xff\xd8", b"\xff\xd8", b"\xff\xd8"]
# bytes是单个二进制串


sys.stdout.write("stdout")
sys.stderr.write("stderr")
sys.stdout.write("stdout")
sys.stderr.write("stderr")


print(f"\x1b[91m⚠  可能破坏性的命令\x1b[0m")

# \x1b[36m  ANSI转义码 可以设置表色(Cyna)字体
# \x1b[0m  ANSI重置码，关闭所有的样式
# <b>ssss</b> <i>ssss</i>
from pathlib import Path

print(Path.cwd())



def extract_text(content) -> str:
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    return str(content)


messages = [
    {"role": "system", "content": "你是一个Agent"},
    {"role": "user", "content": "1+1=?"},
    {"role": "assistant", "content": "2"},
    {"role": "user", "content": "2+2=?"},
    {"role": "user", "content": ""},
]

reversed_messages = [
    {"role": "user", "content": ""},
    {"role": "user", "content": "2+2=?"},
    {"role": "assistant", "content": "2"},
    {"role": "user", "content": "1+1=?"},
    {"role": "system", "content": "你是一个Agent"},
]

# 从所有的消息中最后一条内容中提取文本为最终的结果
result = extract_text(messages[-1].get("content"))
# 如果没有提取到，反向查找assistant角色消息并提取结果
if not result:
    for msg in reversed(messages):
        if msg.get("role") == "assistant":
            result = extract_text(msg.get("content"))
            if result:
                break
print(result)
# 核心原理就是找到最后一条助手的回复


# raw = manifest.read_text(encoding=TEXT_ENCODING, errors="replace")

# encoding 指定字符编码 通常为utf-8
# errors="replace" 指定解码失败的时候的处理策略，replace替换，指的是用 乱码符号�替换无法解码的字节，防止程序崩溃




def repair_message_chain(messages: list):
    if not messages:
        return messages
    # 用于保存修复后的消息列表
    repaired_messages = []
    # 记录等待tool响应的tool_call_id的集合
    pending_call_ids = set()

    # 将当前正在等待的tool call id用reason伪造tool消息并清空pending_call_ids集合
    def flush_pending(reason: str):
        nonlocal pending_call_ids
        # 遍历所有的等待补全的tool call id ,添加伪造tool消息响应
        for tool_call_id in pending_call_ids:
            repaired_messages.append(
                {"role": "tool", "tool_call_id": tool_call_id, "content": reason}
            )
        pending_call_ids = set()

    # 遍历消息列表
    for msg in messages:
        # 获取当前的消息对应的角色
        role = msg.get("role")
        # 如果这个消息是AI助手的话
        if role == "assistant":
            # 必须为之前等待的toolcallid自动补全工具响应
            flush_pending("[工具响应缺失，已自动补全]")
            repaired_messages.append(msg)
            # 获取本次AI消息里的工具调用请求
            tool_calls = msg.get("tool_calls") or []
            # 提取本次assistant消息关联的所有的tool调用ID
            pending_call_ids = {
                tool_call.get("id")
                for tool_call in tool_calls
                if isinstance(tool_call, dict) and tool_call.get("id")
            }
            continue
        elif role == "tool":
            tool_call_id = msg.get("tool_call_id")
            # 如果toolcallid有效，并且在待补全的ID集合中
            if tool_call_id and tool_call_id in pending_call_ids:
                # 添加此tool消息到修复后的结果中
                repaired_messages.append(msg)
                # 标记此ID已经完成，不再需要等待配对了，可以移除pending
                pending_call_ids.discard(tool_call_id)
            continue
        else:
            flush_pending("[工具响应缺失，已自动补全]")
            repaired_messages.append(msg)
    flush_pending("[工具响应缺失，已自动补全]")
    return repaired_messages


messags = [
    {"role": "assistant", "tool_calls": [{"id": "call_1", "name": "read_file"}]},
    {"role": "assistant", "tool_calls": [{"id": "call_2", "name": "read_file"}]},
    {"role": "assistant", "tool_calls": [{"id": "call_3", "name": "read_file"}]},
    {"role": "user", "content": "1+1=?"},
    {"role": "assistant", "content": "2"},
    {"role": "user", "content": "读取当前目录下面的README.txt的文件内容"},
    # {"role": "assistant", "tool_calls": [{"id": "call_4", "name": "read_file"}]},
    {
        "role": "tool",
        "tool_call_id": "call_4",
        "content": "这是README.txt的文件的真实内容",
    },
]
repaired_messages = repair_message_chain(messags)
print(repaired_messages)

# 修复的逻辑就像是   html的标签 必须成对出现 对的
#  缺后面补全后面的 <div>hello => <div>hello</div>
#  缺前面的把后面的也删除  </div> 把这个</div>删除
# 1000   前3条加后面的47，中间的都没有，也不需要补全


import os
from dotenv import load_dotenv
from openai import OpenAI
from pathlib import Path

# 加载.env文件中值到环境变量中，override=True表示如果环境变量里已经有同名变量了，则进行覆盖
load_dotenv(override=True)
# 从环境变量中获取模型名称
MODEL_ID = os.environ["MODEL_ID"]
client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"], base_url=os.environ["OPENAI_BASE_URL"]
)
messages = [
    {"role": "user", "content": "1+1=?"},
    {"role": "assistant", "content": "2"},
    {"role": "assistant", "tool_calls": [{"id": "call_4", "name": "read_file"}]},
    {
        "role": "tool",
        "tool_call_id": "call_4",
        "content": "这是README.txt的文件的真实内容",
    },
]
try:
    response = client.chat.completions.create(
        model="deepseek-v4-pro",
        # 将系统提示消息和原来的消息列表组成messages
        messages=messages,  # type: ignore
    )
    print(response.choices[0])
except Exception as e:
    # Messages with role 'tool' must be a response to a preceding message with 'tool_calls'
    # 拥有角色为tool的消息必须是对前面一个携带tool_calls的asssitant消息的响应
    print(e)
"""

# message [:] 指的是原地替换列表的内容
messages = [1, 2, 3]
print(id(messages))
messages[:] = [4, 5, 6]
print(id(messages))

# jsonl JSON lines 一种每行一个独立的JSON对象的格式
# 每一行都是一个完整的独立的JSON对象，多行之间多个JSON之间用换行符\n分割
