# 用于定义工具的函数，接收函数名称、函数描述、属性和必填的字段,返回一个字典
def _fn_tool(
    name: str, description: str, properties: dict, requried: list[str]
) -> dict:
    return {
        "type": "function",  # 类型是函数
        "function": {  # 函数的具体内容
            "name": name,  # 函数名称
            "description": description,  # 函数描述
            "parameters": {  # 参数设置，是一个对象，包含属性和必需字段
                "type": "object",
                "properties": properties,
                "requried": requried,
            },
        },
    }


# 子代理的工具
BASE_TOOLS = [
    _fn_tool("bash", "执行一条shell命令", {"command": {"type": "string"}}, ["command"]),
    _fn_tool(
        "read_file",
        "读取文件内容",
        {"path": {"type": "string"}, "limit": {"type": "integer"}},
        ["path"],
    ),
    _fn_tool(
        "write_file",
        "将内容写入文件",
        {"path": {"type": "string"}, "content": {"type": "string"}},
        ["path", "content"],
    ),
    _fn_tool(
        "edit_file",
        "在文件中精确替换一段文件(仅替换一次)",
        {
            "path": {"type": "string"},
            "old_text": {"type": "string"},
            "new_text": {"type": "string"},
        },
        ["path", "old_text", "new_text"],
    ),
    _fn_tool(
        "glob",
        "按glob模式查找文件",
        {"pattern": {"type": "string"}},
        ["pattern"],
    ),
]
# 主代理的工具
TOOLS = [
    *BASE_TOOLS,
    _fn_tool(
        "todo_write",  # 名称
        "创建并管理当前编码会话的任务列表。",  # 描述
        {
            "todos": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "content": {"type": "string"},  # 子任务的内容
                        "status": {  # 子任务的状态
                            "type": "string",
                            "enum": [
                                "pending",  # 待执行
                                "in_progress",  # 进行中
                                "completed",  # 已完成
                            ],
                        },
                    },
                    "required": ["content", "status"],
                },
            }
        },
        ["todos"],
    ),
    _fn_tool(
        "spawn_subagent",
        "启动子Agent处理复杂子任务，仅返回最终结论",
        {
            "description": {"type": "string"},
        },
        ["description"],
    ),
    _fn_tool(
        "load_skill",
        "按名称加载技能的完整内容",
        {
            "name": {"type": "string"},
        },
        ["name"],
    ),
    _fn_tool(
        "compact",
        "摘要较早的对话以释放上下文的空间",
        {
            "focus": {"type": "string"},
        },
        [],
    ),
]
