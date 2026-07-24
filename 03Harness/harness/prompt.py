from config import WORKDIR
from skills import SKILL_REGISTRY

# 定义一个提示词片段的字典
PROMPT_SECTIONS = {
    # 是一个多行字符串，作为智能体的系统身份提示
    "identity": (
        f"你是一个编程Agent,直接行动，不要解释"
        f"你将在Windows CMD环境下执行任务，使用CMD命令完成任务"
        f"所有破坏性的操作需要用户批准"
        f"开始多步骤任务前，先用todo_write规划步骤;执行过程中及时更新状态"
        f"遇到复杂子问题时，使用spawn_subagent工具派生子Agent"
        f"上下文过长的时候，可以使用compact工具"
    ),
    "workspace": f"工作目录：{WORKDIR}",
    "skill": "需要完整skill技术说明时，使用load_skill加载相关的文档",
}


def _assemble_system_prompt(skills: str) -> str:
    sections = [PROMPT_SECTIONS["identity"], PROMPT_SECTIONS["workspace"]]
    if skills:
        sections.append(f"可用技能:\n{skills}")
        sections.append(PROMPT_SECTIONS["skill"])
    return "\n\n".join(sections)


def _skills_text():
    # 如果SKILL_REGISTRY是空的字典，那么就返回空串
    if not SKILL_REGISTRY:
        return ""
    # 遍历技能注册表，为每项技能生成markdown列表条目并拼接返回
    return "\n".join(
        f"- ** {skill['name']} **: {skill['description']}"
        for skill in SKILL_REGISTRY.values()
    )


def get_system_prompt() -> str:
    return _assemble_system_prompt(_skills_text())


# 定义子任务Agent的系统提示词
SUB_SYSTEM = (
    f"你是一个位于{WORKDIR}目录中的编程Agent,直接行动，不要解释"
    f"你将在Windows CMD环境下执行任务，使用CMD命令完成任务"
    f"完成分配给你的任务，然后返回简洁摘要，不要接续委派子Agent"
)
