

# LangChain介绍
LangChain 是目前 LLM 应用开发领域最流行的框架之一。用于简化基于大语言模型的应用开发，通过模块化组件（如模型调用、链式流程、智能体、记
忆和外部工具集成）快速构建灵活强大的 AI 应用。它把“模型调用、提示词管理、数据接入、工具使用、记忆与检索”等常用能力标准化，让开发者可以更高效地搭建从原型到生产的完整 AI 应用。

# Chat Model

模型是 Agent 的「大脑」，但不必每次都上 Agent。翻译、分类、摘要、抽取等固定流程，直接调 Chat Model 往往更简单、更便宜

```text
单独调用：  用户输入 ──► Chat Model ──► AIMessage
Agent 调用：用户输入 ──► create_agent（内部循环调 Model + Tools）──► 最终回答
```
Chat Model 的返回值通常是 AIMessage（不是裸字符串）；文本在 .content。

## 初始化方式
1. 统一工厂 init_chat_model("provider:model") —— 本文默认(多数业务代码)
2. 供应商专用类:
  - ChatDeepSeek/ChatOpenAI：深度绑定某一厂商SDK能力
  - ChatOpenAI：兼容各种类型的模型

## 调用方式：invoke / stream / batch
Chat Model（以及后面拼好的链）都是 Runnable，常见三种同步用法：

```text
方法	含义	典型场景
invoke	一次输入 → 一次完整输出	默认、脚本、接口同步处理
stream	增量产出	打字机式展示长回答
batch	一批输入并行处理	批量摘要、批量分类
```
建议：先 invoke 跑通，再上 stream / batch。

### invoke：一次拿完整结果
最常用。输入可以是：字符串（自动当作用户消息）/ 消息对象列表 / dict 消息列表

返回值是 AIMessage（不是裸字符串）。常用字段：
- content：文本内容
- usage_metadata：token 用量（若供应商返回）
- tool_calls：若绑定了工具且模型决定调用

调试时若打印出一整个对象而不是句子，多半是忘了取 .content。

### stream：边生成边打印
长回答时，流式可以降低等待感。
model.stream 产出的是 AIMessageChunk，增量文本常用 .text（也可用累加后的完整消息）。

- agent.stream 的区别:
```text
API	            流的是什么
model.stream	模型 token / 文本块
agent.stream	Agent 图节点更新（模型步、工具步等）
```
### batch：并行多请求
- 适合一批彼此独立的问题。这是客户端并发多个请求，不是厂商侧「离线 Batch API」。可用 max_concurrency 控制同时飞多少个。
- batch 的结果顺序与输入顺序一致。若希望「谁先完成谁先返回」，可用 batch_as_completed（顺序可能乱，需对照输入索引）。

## 常用参数调优
参数决定「稳不稳、贵不贵、会不会超时」。通过 init_chat_model(..., **kwargs) 传入即可（供应商类同理）。
```text
参数	             含义	                实战建议
temperature	        随机性；越高越发散	      抽取 / 工具调用偏 0~0.3；创意写作可更高
max_tokens	        最大生成长度	         控制成本与超长胡言
timeout	            等待超时（秒）	         弱网或长生成可加大
max_retries	        失败重试次数	         默认约 6；弱网可 10~15。401/404 等客户端错误通常不重试
```

# Messages

消息通常包含：

```text
部分	            含义
Role（角色）	     谁说的：system / user / assistant / tool
Content（内容）	   文本、图片、文件等载荷
Metadata（元数据） id、token 用量、tool_calls 等
```
## 三种传参方式
- 纯文本（单轮、最简）
- 消息对象（推荐，类型清晰）
- dict 格式（OpenAI 风格）

**使用场景**

```text
方式	      适合
字符串	    单轮、无历史
消息对象	  多轮、工具、多模态、要类型提示
dict	     与外部协议对接、快速原型
```
## 四种消息类型
```text
类型	            角色	          通常由谁产生
SystemMessage	    system	       你（应用 / harness）
HumanMessage	    user	         用户 / 你的应用
AIMessage	        assistant	     模型 / 模型输出模型（也可手动构造用于测试）
ToolMessage	      tool	         你执行工具后写回
```

# 内容载荷：content 与 content_blocks
- content: 纯文本内容，可以是字符串、列表、元组、字典、对象等任意类型。
- content_blocks: 内容块列表，文本 + 图片 + 文件等混排，可以是字符串、列表、元组、字典、对象等任意类型。

# Prompts提示词工程
- PromptTemplate: 提示词模板，用于生成提示词。







# note
- LangSmith：可以私有化部署但是比较贵，推荐公有化部署；私有化部署可以用langfuse、opensmith