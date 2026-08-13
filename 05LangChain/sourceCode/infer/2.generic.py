"""
def get_first_int(lst: list[int]) -> int:
    return lst[0]


def get_first_str(lst: list[str]) -> str:
    return lst[0]


def get_first_float(lst: list[float]) -> float:
    return lst[0]


# 使用泛型：一个函数处理所有类型
from typing import TypeVar, List

T = TypeVar("T")  # T 表示"某种类型"


def get_first(lst: List[T]) -> T:
    return lst[0]


# 可以用于任何类型
first_int = get_first([1, 2, 3])  # 返回 int
print(first_int)
first_str = get_first(["a", "b", "c"])  # 返回 str
print(first_str)



# 导入 TypeVar 和 List
from typing import TypeVar, List

# 定义类型变量 T
T = TypeVar("T")


# 定义函数：获取列表的第一个元素
# List[T] 表示元素类型为 T 的列表
# -> T 表示返回值类型也是 T
def first_element(lst: List[T]) -> T:
    # 返回列表的第一个元素
    # 返回类型与列表元素类型相同
    return lst[0]


# 主程序入口
if __name__ == "__main__":
    # 使用整数列表
    # T 被推断为 int
    numbers: List[int] = [1, 2, 3]
    result: int = first_element(numbers)
    print(f"第一个数字：{result}，类型：{type(result).__name__}")

    # 使用字符串列表
    # T 被推断为 str
    strings: List[str] = ["a", "b", "c"]
    result2: str = first_element(strings)
    print(f"第一个字符串：{result2}，类型：{type(result2).__name__}")

    # 使用浮点数列表
    # T 被推断为 float
    floats: List[float] = [1.1, 2.2, 3.3]
    result3: float = first_element(floats)
    print(f"第一个浮点数：{result3}，类型：{type(result3).__name__}")



# 导入 TypeVar
from typing import TypeVar

# 定义只能接受数字类型的类型变量
# Number 只能是 int 或 float
Number = TypeVar("Number", int, float)


# 定义函数：计算两个数字的和
def add_numbers(a: Number, b: Number) -> Number:
    # 返回两个数字的和
    return a + b


# 主程序入口
if __name__ == "__main__":
    # 使用整数（允许）
    result1 = add_numbers(1, 2)
    print(f"整数相加：{result1}")

    # 使用浮点数（允许）
    result2 = add_numbers(1.5, 2.5)
    print(f"浮点数相加：{result2}")

    # 使用字符串（不允许，类型检查器会报错）
    result3 = add_numbers("1", "2")  # 类型错误！
    print(f"字符串相加：{result2}")

"""

# Generic（泛型类） 用于创建可以接受类型参数的类，让类可以处理多种类型的数据。
# 导入 TypeVar 和 Generic
from typing import TypeVar, Generic

# 定义类型变量 T
T = TypeVar("T")


# 定义泛型类 Box
# Generic[T] 表示这个类接受一个类型参数 T
class Box(Generic[T]):
    """一个可以存放任何类型值的盒子"""

    def __init__(self, value: T):
        # 初始化方法，接受类型为 T 的值
        self.value = value

    def get(self) -> T:
        # 获取值，返回类型为 T
        return self.value

    def set(self, new_value: T) -> None:
        # 设置值，参数类型为 T
        self.value = new_value


# 主程序入口
if __name__ == "__main__":
    # 创建存放整数的盒子
    # Box[int] 表示这个盒子存放整数
    int_box: Box[int] = Box(42)
    print(f"整数盒子：{int_box.get()}")

    # 创建存放字符串的盒子
    # Box[str] 表示这个盒子存放字符串
    str_box: Box[str] = Box[str]("Hello")
    print(f"字符串盒子：{str_box.get()}")

    # 创建存放列表的盒子
    # Box[list] 表示这个盒子存放列表
    list_box: Box[list] = Box[list]([1, 2, 3])
    print(f"列表盒子：{list_box.get()}")
