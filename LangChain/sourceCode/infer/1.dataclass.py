# 导入 dataclass 装饰器
from dataclasses import dataclass

"""

# 定义点坐标类
@dataclass
class Point:
    # 声明字段及类型
    x: float
    y: float


#    def __init__(self, x, y):
#        self.x = x
#        self.y = y
#
#    def __eq__(self, other):
#        return self.x == other.x and self.y == other.y
     def __repr__():
        return f"Point(x=self.x,y=self.y)"


# 创建实例
p1 = Point(1.0, 2.0)
p2 = Point(1.0, 2.0)

# 打印对象（自动生成 __repr__）
print(p1)  # Point(x=1.0, y=2.0)
# 比较对象（自动生成 __eq__）
print(p1 == p2)  # True


from dataclasses import dataclass


@dataclass(order=True)
class Foo:
    x: int
    y: int


a = Foo(1, 2)
b = Foo(1, 2)
print(repr(a))  # Foo(x=1, y=2)
print(a == b)  # True
print(a is b)  # False（不同对象，内容相同）



from dataclasses import dataclass, field
from typing import List


@dataclass
class Person:
    name: str
    tags: List[str] = field(default_factory=list)  # 正确做法，每个实例有独立列表
    age: int = 20  # 简单默认值


from dataclasses import dataclass, field


@dataclass
class Example:
    # 不在 __init__ 参数列表，实例化时不能传入，内部自动赋值
    created_by: str = field(default="system", init=False)
    # 不参与比较和哈希
    token: str = field(default="", compare=False, hash=False)
    # 自定义元信息
    desc: str = field(default="示例", metadata={"info": "用途"})
    # 不在 repr 显示
    secret: str = field(default="123", repr=False)
    # 可变类型用 default_factory
    tags: list = field(default_factory=list)


example1 = Example(desc="example1")
print(example1)
example1.tags.append("1")
print(example1)
example2 = Example(desc="example2")
print(example1)
print(example2)




# 导入 dataclass 装饰器和类型工具
from dataclasses import dataclass
from typing import Generic, TypeVar

# 定义一个类型变量 T，用于泛型
T = TypeVar("T")

# 定义通用的 API 响应数据结构，支持泛型
@dataclass
class ApiResponse(Generic[T]):
    # 请求是否成功
    success: bool
    # 返回数据，类型为 T
    data: T
    # 响应消息，默认为空字符串
    message: str = ""
    # 状态码，默认 200
    code: int = 200

# 创建一个返回字典数据的 API 响应实例
resp = ApiResponse[dict](
    success=True,
    data={"user_id": 123, "name": "Alice"},
    message="获取成功"
)
# 打印响应结果
print(resp)
"""
from typing import Generic, TypeVar

# 先生成类型变量 ，代表任意类型
T = TypeVar("T")


# 定义通用的API响应的数据结构，支持泛型
class ApiResponse(Generic[T]):
    success: bool
    data: T
    message: str = ""
    code: int = 200


response = ApiResponse(
    success=True, data={"user_id": 100, "name": "Bob"}, message="成功"
)
data = response.data

print(response.data)
