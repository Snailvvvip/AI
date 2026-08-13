from .base import BaseChatMessageHistory
from datetime import datetime, timedelta


class InMemoryChatMessageHistory(BaseChatMessageHistory):
    def __init__(self):
        # 使用列表存储消息
        self._messages = []
        # 存储消息的过期时间
        self._expirations = []

    @property
    def messages(self):
        self._clean_expired()
        # 返回的是消息列表的副本，为了防止外部意外修改
        return self._messages.copy()

    def _clean_expired(self):
        now = datetime.now()
        new_messages = []
        new_expirations = []

        for msg, expiration in zip(self._messages, self._expirations):
            # 如果没有设置过期时间，或者 未到过期时间的话，就保留
            if expiration is None or expiration > now:
                new_messages.append(msg)
                new_expirations.append(expiration)
        self._messages = new_messages
        self._expirations = new_expirations

    # 定义抽象方法，子类需要实现消息添加逻辑
    def _add_message_impl(self, message, expires_in=None):
        self._messages.append(message)
        if expires_in:
            expires_at = datetime.now() + expires_in
        else:
            expires_at = None
        self._expirations.append(expires_at)

    # 定义抽象方法， 清空历史消息
    def clear(self):
        self._messages = []
        self._expirations = []
