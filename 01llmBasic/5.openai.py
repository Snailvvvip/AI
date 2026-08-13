import os
from openai import OpenAI

# 创建OpenAI客户端对象，并设置API密钥和基础URL
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY", "sk-f8c888be90e0461f8a08496f45d952b4"),
    base_url=os.getenv("OPENAI_BASE_URL", "https://api.deepseek.com"),
)
# DeepSeek这个模型不支持n这个参数的

result = client.chat.completions.create(
    model=os.getenv("OPENAI_MODEL", "deepseek-v4-pro"),
    messages=[{"role": "user", "content": "你是谁?"}],
    extra_body={"thinking": {"type": "disabled"}},
    # n=2,  # 如果设置n=2的话，API会返回choices数组，里面有两个候选回答choices[0] choices[1],这两个回答都是针对同一个输入生成的
)
print("len", len(result.choices))
print(result.usage)

# logprobs 是一个常用参数，表示不返回每个生成token的对数概率
# logprobs= log probabilities 对数概率
# prob 概率(0-1)
# logprob 概率的对数 (负数)



# 因为openai这个官方的SDK本身并不跨平台， 但是它定义了一套输入输出的标准，这套格式已经成为了行业标准，其它的大模型服务器也会遵循这个标准

# 也有一些专门上做适配的库 最有名气就是Vercel Ai SDK
# Vercel Ai SDK的核心思想就是Provider Adapter 机制，在统一的接口下适合各种模型
# 你只要使用ai这个名，并搭配对应的Provider包，就可以支持OPENAI Anthropic Google 等主流提供商

# 使用网页版的ChatGPT聊天时，有时候一个问题会给出两个回答，让选择更倾向于哪个回答，choice是不是就是那两个回答选项？
# openai api接口可以在一次模型回复的时候返回多个候选结果

# 你是谁？" 这4个字符占了8个token 啊。这个是如何分词的

# 命中 和缓存未命中  什么意思  看到好多次


## 你问大模型 你是谁？
## 第一次大模型会生成回答，并且把回答缓存起来
## 当你你第二次或者另人问你是谁？的时候，直接返回缓存的结果
