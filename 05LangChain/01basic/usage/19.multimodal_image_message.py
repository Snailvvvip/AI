from langchain.agents import create_agent
from langchain.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
from langchain_qwq import ChatQwen
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)
# 创建模型实例，指定qwen-vl-plus视觉模型
# model = ChatQwen(model="qwen-vl-plus")
# msg_url = HumanMessage(
#    content_blocks=[
#        {"type": "text", "text": "用一句话描述图片内容"},
#        {
#            "type": "image",
#            "url": "https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png",
#        },
#    ]
# )
# ai = model.invoke([msg_url])
# print(ai.content)
# print(ai.content_blocks)

import base64
from pathlib import Path

model = ChatQwen(model="qwen-vl-plus")
# 读取本地的图片文件，得到它的原始二进制数据
raw = Path("logo.png").read_bytes()
msg_base64 = HumanMessage(
    content_blocks=[
        {"type": "text", "text": "用一句话描述图片内容"},
        {
            "type": "image",
            # 将图片的二进制数据编码为base64字符串，并解码为普通的字符串
            # 将二进制数据编码为base64字符串，常用于在JSON或HTTP中传输图片等非文本数据
            "base64": base64.b64encode(raw).decode(),
            "mime_type": "image/png",
        },
    ]
)
ai = model.invoke([msg_base64])
print(ai.content)
print(ai.content_blocks)
