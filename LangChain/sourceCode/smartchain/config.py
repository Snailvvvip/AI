import inspect


def ensure_config(config=None):
    if config is None:
        return {}
    return config.copy() if isinstance(config, dict) else dict(config)


def accept_config(func):
    try:
        sig = inspect.signature(func)
        return "config" in sig.parameters
    except (ValueError, TypeError):
        return False
