# 1.StrOutputParser

# 2.JsonOutputParser

从复杂文本中成功提取纯 JSON 并转为 Python 对象。

# 3.PydanticOutputParser

是一个高级输出解析器，用于将大语言模型（LLM）的输出直接解析为 Pydantic 模型对象，实现输出的结构化、验证和类型安全。

# 4.OutputFixingParser

每当解析格式错误的输出而失败时，能自动修复格式问题，再次解析，最多尝试若干次。

# 5.RetryOutputParser

主要用于大语言模型输出时，基础解析器（如 JsonOutputParser）无法直接解析模型返回结果的场景。该类通过“自动重试”机制，在解析失败时，会自动调用 LLM 重新生成输出，并最多执行指定次数（max_retries）的重试，从而极大提升了解析鲁棒性和实际可用性。

# 6.BaseOutputParser
