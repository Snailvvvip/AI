# 导入 BaseModel，这是 Pydantic 的基础类
"""
from pydantic import BaseModel


class User(BaseModel):
    id: int
    name: str
    email: str
    age: int = 18


# Input should be a valid integer, unable to parse string as an integer
user1 = User(id=1, name="张三", email="zhangsan@qq.com", age=25)
user2 = User(id=1, name="张三", email="zhangsan@qq.com")
print(user2)
user_data = {"id": 3, "name": "李四", "email": "lisi@qq.com", "age": 22}
user3 = User(**user_data)
print(user3)

try:
    user4 = User(id=1, name="张三")
except Exception as e:
    print(f"验证错误:{str(e)}")

from pydantic import BaseModel, ValidationError


class Product(BaseModel):
    name: str
    price: float
    stock: int = 10


product1 = Product(name="笔记本电脑", price=5999.99, stock=10)
# product_dict = product1.dict()
# print(product_dict)
# 模型实例转字典
product_dict = product1.model_dump()
print(product_dict, type(product_dict))
# 模型实例转JSON字符串
product_json = product1.model_dump_json(indent=2)
print(product_json, type(product_json))
# 字典转模型实例
product_model = Product(**product_dict)
print(product_model, type(product_model))
# json字符串转模型实例
product_model = Product.model_validate_json(product_json)
print(product_model, type(product_model))
import json

# 从文件中读取JSON并创建对象
with open("product.json", "r", encoding="utf-8") as f:
    product_data = json.load(f)
    product_from_file = Product(**product_data)
    print("product_from_file", product_from_file)


# 字段验证器
from pydantic import BaseModel, field_validator, ValidationError


class Product(BaseModel):
    name: str
    price: float
    stock: int = 10

    @field_validator("price")
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError(f"价格必须大于等于0")
        return v

    @field_validator("stock")
    def stock_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError(f"库存必须大于等于0")
        return v

    @field_validator("name")
    def name_must_be_positive(cls, v):
        v = v.strip()
        if not v:
            raise ValueError(f"商品名称不能为空")
        return v


product1 = Product(name="手机", price=5999.99, stock=10)
"""
# 字段配置Field  可以使用Field更灵活的配置字段
from pydantic import BaseModel, Field


class Product(BaseModel):
    # ...表示该 字段是必须的不能省略
    name: str = Field(..., min_length=1, max_length=50, description="商品名称")
    # gt greater than 大于
    price: float = Field(..., gt=0, description="商品价格")
    description: str = Field(None, max_length=50, description="商品描述")
    # le less than or equal 小于等于
    discount: float = Field(10.0, gt=0, le=100, description="商品折扣")


# product = Product(name="笔记本电脑", price=5999.99, description="游戏笔记本")
# print(product)
import json


schema = Product.model_json_schema()
schema_str = json.dumps(schema, ensure_ascii=False, indent=2)
print(schema_str)
