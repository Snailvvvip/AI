from langchain_core.prompts import PromptTemplate
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv

load_dotenv(override=True)
# {name}是待填变量，缺少变量时format的时候会报错
# 用字符串模板创建PromptTemplate实例，其中{name}为运行时需要填充的变量
prompt_template = PromptTemplate.from_template(
    "你是一个助手，用户叫{name},请用一句话打招呼"
)
# 将name填充为张三，得到完整的提示词文本
prompt = prompt_template.format(name="张三")
print(prompt)
model = init_chat_model("deepseek:deepseek-v4-flash", temperature=0.2)
result = model.invoke(prompt)
print(result.content)
