import asyncio
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv

load_dotenv(override=True)

prompt = ChatPromptTemplate.from_messages([("human", "{q}")])
model = init_chat_model("deepseek:deepseek-v4-flash", temperature=0)
chain = prompt | model | StrOutputParser()


async def main():
    # 单请求异步
    text = await chain.ainvoke({"q": "一句话介绍 Runnable"})
    print(text)
    # 流式异步
    async for chunk in chain.astream({"q": "一句话介绍 LCEL"}):
        print(chunk, end="", flush=True)


asyncio.run(main())
