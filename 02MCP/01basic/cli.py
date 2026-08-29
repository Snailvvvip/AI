import subprocess
import json


def execute_cli_command(command: str):
    result = subprocess.run(
        command, shell=True, capture_output=True, text=True, timeout=30
    )
    return result.stdout


def ai_agent(user_request):
    command = user_request
    result = execute_cli_command(command)
    return result


print(ai_agent("dir"))
