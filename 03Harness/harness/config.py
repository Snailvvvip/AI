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
# 默认的是大token数量
# 指的是模型输出的token的上限(也就是生成的内容) 一般来说一个汉字等于1~2个token
DEFAULT_MAX_TOKENS = 8000
# 当前的工作目录
WORKDIR = Path.cwd()
# chcp=Change Code Page 设置命令行编码为UTF-8
# UTF8对应的是代码页编号是65001,GBK对应的代码页编号是936
os.system("chcp 65001")
# 设置读写文件时的编码为utf-8
TEXT_ENCODING = "utf-8"
# 设置技能目录为工作目录下面的skills目录
SKILLS_DIR = WORKDIR / "skills"
# 设置工具调用结果最大字节数是10000
MAX_BYTES = 10000
# 设置工具消息持续长度的阈值
PERSIST_THRESHOLD = 1000
# 设置工具结果的落盘目录为
TOOL_RESULTS_DIR = WORKDIR / ".task_outputs" / "tool_results"
# 最大的消息的长度
MAX_MESSAGES_LENGTH = 50
# 设置保留的最近3条工具消息
KEEP_RECENT = 3
# 设置上下文限制大小
CONTEXT_LIMIT = 100000
# 设置转录目录为工作目录下面的.transcripts目录
TRANSCRIPTS_DIR = WORKDIR / ".transcripts"
