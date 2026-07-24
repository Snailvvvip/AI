"""提供基本的数学运算工具模块。

本模块包含简单但实用的数学运算函数。
"""


def add(a: int | float, b: int | float) -> int | float:
    """返回两个数之和。

    Args:
        a: 第一个加数。
        b: 第二个加数。

    Returns:
        a 与 b 的和。

    Example:
        >>> add(2, 3)
        5
        >>> add(2.5, 3.5)
        6.0
    """
    return a + b


if __name__ == "__main__":
    print(add(2, 3))
    print(add(2.5, 3.5))
