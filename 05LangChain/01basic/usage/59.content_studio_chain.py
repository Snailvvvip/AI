from langchain_core.runnables import RunnableConfig
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.chat_models import init_chat_model
import time
from langchain_core.runnables import (
    RunnableLambda,
    RunnablePassthrough,
    RunnableParallel,
    RunnableBranch,
)
from dotenv import load_dotenv
from rich import print
from langchain_core.runnables import chain

load_dotenv(override=True)


# 初始化对话模型，指定模型名称和温度参数
model = init_chat_model("deepseek:deepseek-v4-flash", temperature=0)
# 创建一个字符串输出解析器实例
to_str = StrOutputParser()


def make_chain(system: str):
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system),
            ("human", "{text}"),
        ]
    )
    return prompt | model | to_str


# 创建一个链：一句话中文总结
summary = make_chain("一句话中文总结，不要前缀。")
# 创建一个链：提取 3 个关键词
keywords = make_chain("提取 3 个关键词，逗号分隔，不要其它文字。")
# 创建一个链：判断情感
sentiment = make_chain("只输出：正面 / 负面 / 中性")
# 创建一个链：翻译为英文
translate = make_chain("翻译成英文，只输出译文。")
# 创建一个链：简洁助手直接回答
chat = make_chain("你是简洁助手，直接回答。")

analyze = RunnableParallel(summary=summary, keywords=keywords, sentiment=sentiment)
# analyze = RunnableParallel(
#    {"summary": summary, "keywords": keywords, "sentiment": sentiment}
# )
studio = RunnableBranch(
    (lambda x: x.get("mode") == "translate", translate),
    (lambda x: x.get("mode") == "analyze", analyze),
    chat,
)
studio_chain = (
    (
        # 对输入的规范化，转换为合法的数据后再转入studio分支
        RunnableLambda(
            lambda x: {
                "text": str(x.get("text", "")).strip(),  # type: ignore
                "mode": x.get("mode", "analyze"),  # type: ignore
            }
        )
        | studio
    )
    .with_retry(stop_after_attempt=3)
    .with_config({"run_name": "内容工作室", "tags": ["studio", "v1"]})
)
text = "lanchain把提示词、模型和解析器都统一成了Runnable,组合成本明显下降"
result = studio_chain.invoke({"text": text, "mode": "analyze"})
print(result)
result = studio_chain.invoke({"text": text, "mode": "translate"})
print(result)
result = studio_chain.invoke({"text": text, "mode": "chat"})
print(result)

# 在生产环境中，可以通过LLM意图识别来判断mode,而并非硬编码
# 用户输入 -> LLM分析意图分类->路由到对应的链路
# mode : chat/search/code/analysis
# 下一步怎么走，是我现在就能画出来，还是必须让模型当场决定？


from langchain.agents import create_agent
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)


def get_weather(city: str) -> str:
    """获取指定城市的天气信息"""
    return f"{city} 今天晴，气温25度"


agent = create_agent(
    name="langchain_agent",
    model="deepseek:deepseek-v4-flash",  # 指定使用的模型 用冒号分割，左边是供应商，右而是模型名
    tools=[get_weather],
    system_prompt="你是一个简洁的可靠的中文助手，需要天气信息的时候可以调用工具，不要编造结果",  # 系统指令或者说系统提示词
)
