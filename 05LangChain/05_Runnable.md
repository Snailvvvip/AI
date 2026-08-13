# 1.RunnableLambda

RunnableLambda 是一个用于将普通的 Python 函数（即 lambda 或普通函数）包装为可复用、可链接的“可运行对象”（Runnable）的类。它的主要作用是使得任意函数都能以统一的方式进行调用（如 invoke 处理单个输入，batch 处理批量输入），并能与其它 Runnable 实例灵活组合，实现流式、链式的数据处理。

# 2.RunnableSequence

# 3.RunnablePassthrough

# 4.RunnableParallel

# 5.RunnableBranch

# 6.with_retry

使用 with_retry 给 Runnable 增加自动重试能力。

# 7.config

无论是单个组件还是链式/批量/重试等高级用法，所有 Runnable 对象都支持传递统一的配置 dict（称为 config）。通过配合 config，可以灵活实现：

- 日志与标签（tags、run_name、metadata）
- 回调机制（callbacks）
- 并发/递归层数限制（max_concurrency, recursion_limit）
- 运行身份或唯一标识（run_id）
- 传递模型配置项（configurable）

# 8.configurable_fields

- configurable_fields 机制允许你将任意可运行组件（如 LLM、Chain、RunnableLambda 等）的部分参数声明为“可动态配置”。
- 这些参数可在执行时通过 config 字典灵活传入，从而在不重建对象的前提下，实现推理/测试阶段参数的临时调整。

# 9.configurable_alternatives

