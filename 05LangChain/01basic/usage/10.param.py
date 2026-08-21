# 从 langchain.chat_models 导入初始化聊天模型的函数
from langchain.chat_models import init_chat_model
# 从 dotenv 导入加载环境变量的函数
from dotenv import load_dotenv

# 加载 .env 文件中的环境变量，并允许覆盖已存在的同名变量
load_dotenv(override=True)

# 偏确定：适合分类、抽取、要稳的工具决策
# 初始化一个偏确定性的聊天模型实例，赋值给变量 strict
strict = init_chat_model(
    # 指定使用的模型名称：DeepSeek V4 Flash
    "deepseek:deepseek-v4-flash",
    # 将温度设为 0，使输出更稳定、可复现
    temperature=0,
    # 限制单次回复最多生成 256 个 token
    max_tokens=256,
    # 设置请求超时时间为 60 秒
    timeout=60,
    # 请求失败时最多重试 6 次
    max_retries=6,
# 结束 init_chat_model 的参数列表
)

# 偏发散：适合头脑风暴
# 初始化一个偏创造性的聊天模型实例，赋值给变量 creative
creative = init_chat_model(
    # 指定使用的模型名称：DeepSeek V4 Flash
    "deepseek:deepseek-v4-flash",
    # 将温度设为 0.9，使输出更发散、更有创意
    temperature=0.9,
    # 限制单次回复最多生成 256 个 token
    max_tokens=256,
# 结束 init_chat_model 的参数列表
)

# 定义提示词：要求模型为咖啡店起名，且只输出店名本身
prompt = "给咖啡店起一个店名，只输出店名本身。"
# 调用确定性模型生成回复，并打印 temperature=0 时的结果内容
print("temperature=0 :", strict.invoke(prompt).content)
# 调用创造性模型生成回复，并打印 temperature=0.9 时的结果内容
print("temperature=0.9:", creative.invoke(prompt).content)
