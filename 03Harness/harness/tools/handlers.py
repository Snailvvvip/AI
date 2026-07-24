import os
import subprocess
from utils import decode_subprocess_output, safe_path
from config import TEXT_ENCODING, WORKDIR
import glob as g
from skills import run_load_skill


def run_bash(command: str) -> str:
    # 定义一些危险的命令列表
    dangerous = ["rm -rf", "sudo", "shutdown", "reboot", "> /dev/"]
    # 如果要执行的命令中包含任何一个危险命令，
    if any(d in command for d in dangerous):
        # 则返回错误提示，拦截拒绝执行危险命令
        return "错误:危险命令已经被拦截"
    try:
        # 得到的stdout和stderr是二进制的字节序列
        result = subprocess.run(
            command,  # 要执行的命令
            shell=True,  # 在shell中执行
            cwd=os.getcwd(),  # 把当前的工作目录设置为当前的路径
            capture_output=True,  # 捕获标准输出和标准错误输出
            timeout=120,  # 超时时间设置为120秒
        )
        out = decode_subprocess_output(
            (result.stdout or b"") + (result.stderr or b"")
        ).strip()
        return out[:500000] if out else "(无输出)"
    except subprocess.TimeoutExpired:
        return "错误： 超时(120秒)"
    except (FileNotFoundError, OSError) as e:
        return f"错误:{str(e)}"


def run_read(path: str, limit: int | None = None) -> str:
    try:
        # 使用safe_path校验并获取文件的路径，并指定编码读取内容并按行分割
        lines = safe_path(path).read_text(encoding=TEXT_ENCODING).splitlines()
        # 如果有行数限制，并且限制小于真实的行数
        if limit and limit < len(lines):
            # 截取前limit行，并在最后添加提示剩余行数的说明
            lines = lines[:limit] + [f"...(还有{len(lines)-limit}行)"]
        return "\n".join(lines)
    except Exception as e:
        return f"错误: {str(e)}"


def run_write(path: str, content: str) -> str:
    try:
        # 获取文件安全路径
        file_path = safe_path(path)
        # 确保父目录是存在的，不存在则创建
        file_path.parent.mkdir(parents=True, exist_ok=True)
        # 指定的编码写入指定内容到指定文件
        file_path.write_text(content, encoding=TEXT_ENCODING)
        return f"已经写入{len(content)}字节到{path}中"
    except Exception as e:
        return f"错误: {str(e)}"


def run_edit(path: str, old_text: str, new_text: str) -> str:
    try:
        # 获取文件安全路径
        file_path = safe_path(path)
        # 读取文件的内容
        text = file_path.read_text()
        if old_text not in text:
            return f"错误：在{path}没有找到指定的文本{old_text}"
        file_path.write_text(
            text.replace(old_text, new_text, 1), encoding=TEXT_ENCODING
        )
        return f"已经编辑{path}"
    except Exception as e:
        return f"错误: {str(e)}"


def run_glob(pattern: str) -> str:
    try:
        results = []
        # 遍历所有的匹配到的路径，根目录为WORKDIR
        for match in g.glob(pattern, root_dir=WORKDIR):
            # 检查匹配到的路径是否是相对于WORKDIR的子路径
            if (WORKDIR / match).resolve().is_relative_to(WORKDIR):
                results.append(match)
        return "\n".join(results) if results else "(无匹配)"

    except Exception as e:
        return f"错误:{e}"


# 全局变量CURRENT_TODOS，用于存储当前的任务列表，类型为list[dict]
CURRENT_TODOS: list[dict] = []


# 定义更新CURRENT_TODOS的函数，接收新的todos，返回字符串
def run_todo_write(todos: list) -> str:
    global CURRENT_TODOS
    for index, todo in enumerate(todos):
        if "content" not in todo or "status" not in todo:
            return f"错误: todos[{index}] 缺少content或status字段"
        if todo["status"] not in ("pending", "in_progress", "completed"):
            return f"错误: todos[{index}] 状态无效"
    CURRENT_TODOS = todos
    lines = ["\x1b[33m ## 当前任务 \x1b[0m"]
    for todo in CURRENT_TODOS:
        icon = {
            "pending": "\x1b[33m等待中\x1b[0m",
            "in_progress": "\x1b[33m处理中\x1b[0m",
            "completed": "\x1b[33m已完成\x1b[0m",
        }[todo["status"]]
        lines.append(f"- [{icon}] {todo['content']}")
    print("\n".join(lines))
    return f"已更新{len(CURRENT_TODOS)}个任务"


# 定义字典，把工具的名称和真正的处理函数关联起来
TOOL_HANDLERS = {
    "bash": run_bash,
    "read_file": run_read,
    "write_file": run_write,
    "edit_file": run_edit,
    "glob": run_glob,
    "todo_write": run_todo_write,
    "load_skill": run_load_skill,
}
