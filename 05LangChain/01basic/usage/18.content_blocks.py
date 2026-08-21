from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
from rich import print

load_dotenv(override=True)
model = init_chat_model("deepseek:deepseek-v4-flash")
ai = model.invoke("写一首关于春天的诗")
# print(ai.content)
for block in ai.content_blocks:
    print(block)
