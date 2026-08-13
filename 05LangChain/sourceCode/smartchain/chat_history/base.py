from abc import ABC, abstractmethod
from ..messages import BaseMessage, HumanMessage, AIMessage


# 聊天消息历史的抽象基类
class BaseChatMessageHistory(ABC):
    # 定义抽象属性messages返回消息列表，需要子类实现
    @property
    @abstractmethod
    def messages(self):
        pass

    # 定义抽象方法，子类需要实现消息添加逻辑
    @abstractmethod
    def _add_message_impl(self, message, expires_in=None):
        pass

    # 定义抽象方法， 清空历史消息
    @abstractmethod
    def clear(self):
        pass

    # 添加单个消息，可以接收BaseMessage的实例
    def add_message(self, message, expires_in=None):
        self._add_message_impl(message, expires_in)

    # 添加用户消息的便捷方法，可以接收HumanMessage实例或字符串
    def add_user_message(self, message, expires_in=None):
        if isinstance(message, BaseMessage):
            self.add_message(message, expires_in)
        else:
            self.add_message(HumanMessage(message), expires_in=None)

    # 添加AI消息的便捷方法，可以接收AIMessage实例或字符串
    def add_ai_message(self, message, expires_in=None):
        if isinstance(message, BaseMessage):
            self.add_message(message, expires_in)
        else:
            self.add_message(AIMessage(message), expires_in)
