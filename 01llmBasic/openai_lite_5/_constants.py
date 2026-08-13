DEFAULT_BASE_URL = "https://api.openai.com/v1"
DEFAULT_TIMEOUT = 60.0
CHAT_COMPLETIONS_PATH = "/chat/completions"


def build_url(base_url: str, path: str) -> str:
    if not path.startswith("/"):
        path = f"/{path}"
    return f"{base_url.rstrip('/')}{path}"


def build_headers(api_key: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
