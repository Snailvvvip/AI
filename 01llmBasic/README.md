# Prompt

- 提示词是你给大模型的一段文字，用来告诉他要做什么、怎么做、输出什么格式；在代码里，提示词通常放在message的content字段中。它强调：明确目标 → 写结构化指令 → 看结果 → 迭代修改。

## 三种角色

调用 API 时，对话由多条消息组成，每条消息有 role（角色） 和 content（内容）。
- system：设定模型身份和全局规则，如「你是面试官，回答风格严谨专业」。
- user：用户输入，即你的提示词或问题。
- assistant：模型之前的回复；多轮对话时要把历史回复一并传入。

## 温度（temperature）与输出长度
- temperature（温度） 控制回答的随机性：越低越稳定，越高越有创意。写代码、做分类、提取数据时，建议用较低温度（如 0.2）；写文案可适当提高。
- max_tokens 限制模型最多输出多少 token，防止回答过长或费用失控。

## 通用提示词结构
角色 + 任务 + 要求 + 细节

## 常用技巧
- 零样本提示（Zero-Shot）
- 少样本提示（Few-Shot）
- 链式思考（Chain-of-Thought）





curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-d81b673836d94562bc972b3d151ec52c" \
  -d '{
        "model": "deepseek-v4-pro",
        "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
        ],
        "thinking": {"type": "enabled"},
        "reasoning_effort": "high",
        "stream": false
      }'

```json
{
	'id': 'd720f55d-1503-484e-96ad-d192b09b70a9',
	'object': 'chat.completion',
	'created': 1783158411,
	'model': 'deepseek-v4-pro',
	'choices': [{
		'index': 0,
		'message': {
			'role': 'assistant',
			'content': 'Hi there! How can I help you today?',
			'reasoning_content': 'We are asked: "Hello!" This is a simple greeting. I should respond in a friendly and helpful manner, indicating I\'m ready to assist.'
		},
		'logprobs': None,
		'finish_reason': 'stop'
	}],
	'usage': {
		'prompt_tokens': 12,
		'completion_tokens': 41,
		'total_tokens': 53,
		'prompt_tokens_details': {
			'cached_tokens': 0
		},
		'completion_tokens_details': {
			'reasoning_tokens': 30
		},
		'prompt_cache_hit_tokens': 0,
		'prompt_cache_miss_tokens': 12
	},
	'system_fingerprint': 'fp_9954b31ca7_prod0820_fp8_kvcache_20260402'
}
```      


网页版本的Deepseek在你发送消息后，并不会自动将你的消息拆分为多个角色的提示词
它是一个单一的对话模型，你输入整段内容(角色定位+需求提问)会当作一个整体直接发给大模型，由大模型理解指令 后生成回复

文本生成是CPU和GPU协同工作的结果
但是核心的思考和生成运算，99%是用GPU完成的，CPU主要负责指挥调度和数据搬运

```json
{
	"id": "e8e642ab-51da-4f5e-a5c3-9ad123369d09",
	"object": "chat.completion.chunk",
	"created": 1783237167,
	"model": "deepseek-v4-pro",
	"system_fingerprint": "fp_9954b31ca7_prod0820_fp8_kvcache_20260402",
	"choices": [{
		"index": 0,
		"delta": {
			"role": "assistant",
			"content": 1,
			"reasoning_content": "1"
		},
		"logprobs": null,
		"finish_reason": null
	}]
}
```

```
ChatCompletionMessage(
	content='我来帮您查询北京今天的天气。', 
	refusal=None,
	 role='assistant', 
	 annotations=None, 
	 audio=None, 
	 function_call=None, 
	 tool_calls=[
		ChatCompletionMessageFunctionToolCall(
			id='call_00_5OqJnJqaENrPUM8h1jix5572', 
			function=Function(
				arguments='{"city": "北京"}',
				name='get_weather'), 
				type='function', 
				index=0
			)
		], 
	 reasoning_content='用户想知道北京今天的天气情况。我需要调用 get_weather 函数，传入 "北京" 作为城市参数。')
```

# 大模型本身并不直接调用函数，它的工作流程是
1. 接收你的请求(用户的问题)
2. 接收tools定义（你给的函数列表，参数结构和描述）
3. 理解并决策 它需要能够阅读我的那些工具定义，理解每个工作是做什么的、需要什么参数，什么时候用
4. 输出结果 要么直接回答问题，要么返回一个tool_calls的结构(告诉系统我要用这个工具，参数是xxx)
2 3 中，模型必须把tools参数完整的读入上下文中才能理解它们，自然要消耗token



# DeepSeek网页端DeepSeek网页端也是一个客户端，也是一个应用程序
# 在DeepSeek网页端中，不是我们自己调用工具的，而整个流程由AI模型和网页应用在幕后自动完成的

# function是发给大模型之前调用，function还是之后调用？？

```python
import os
# 在导入 sentence_transformers 之前设置
os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

from sentence_transformers import SentenceTransformer

# 正常加载模型
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
```