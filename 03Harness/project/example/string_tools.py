import re


def slugify(text: str) -> str:
    """将文本转换为 URL 友好的 slug 格式。

    - 转为小写
    - 空格替换为连字符
    - 移除非字母数字字符（保留连字符）
    - 合并连续连字符
    - 去除首尾连字符
    """
    if not text:
        return ""

    # 转为小写
    slug = text.lower()

    # 空格替换为连字符
    slug = slug.replace(" ", "-")

    # 移除非字母数字和非连字符的字符
    slug = re.sub(r"[^a-z0-9\-]", "", slug)

    # 合并连续连字符
    slug = re.sub(r"-{2,}", "-", slug)

    # 去除首尾连字符
    slug = slug.strip("-")

    return slug
