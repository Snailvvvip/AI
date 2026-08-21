from langchain.chat_models import init_chat_model
from dotenv import load_dotenv

# from rich import print
import os

load_dotenv(override=True)
model = init_chat_model("deepseek:deepseek-v4-flash")
result = ""
for chunk in model.stream("用三句话介绍langchain"):
    # print(chunk.text, end="", flush=True)
    result += chunk.text


print(result)
