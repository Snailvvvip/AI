from .base import BaseChatMessageHistory
from ..messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
import mysql.connector


class MySQLChatMessageHistory(BaseChatMessageHistory):
    def __init__(
        self,
        session_id,
        host="localhost",
        user="root",
        password="",
        database: str = "chat_history",
        table_name="message_store",
    ):
        self.session_id = session_id
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.table_name = table_name
        # 初始化数据库的连接为None
        self._connection = None
        # 确保数据库表的存在
        self._ensure_table()

    def _get_connection(self):
        return mysql.connector.connect(
            host=self.host,
            user=self.user,
            password=self.password,
            database=self.database,
        )

    def execute_sql(self, sql, values=()):
        conn = self._get_connection()
        # 创建游标
        cursor = conn.cursor()
        cursor.execute(sql, values)
        conn.commit()

    def _ensure_table(self):
        self.execute_sql(
            f"""
                CREATE TABLE IF NOT EXISTS {self.table_name}(
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   session_id TEXT,
                   role TEXT,
                   content TEXT
                )
            """
        )

    @property
    def messages(self):
        conn = self._get_connection()
        # 创建一个游标对象以执行SQL语句
        cursor = conn.cursor()
        # 执行查询，按ID升序获取属于当前的会话所有的消息，包括消息角色和消息的内容
        cursor.execute(
            f"""SELECT role,content FROM {self.table_name} WHERE session_id = ? ORDER BY id ASC""",
            (self.session_id,),
        )
        #  获取所有的查询结果
        rows = cursor.fetchall()
        # 消息列表
        history_messages = []
        for role, content in rows:
            if role == "human":
                history_messages.append(HumanMessage(content=content))
            elif role == "ai":
                history_messages.append(AIMessage(content=content))
            elif role == "system":
                history_messages.append(SystemMessage(content=content))
            else:
                history_messages.append(HumanMessage(content=content))
        return history_messages

    def clear(self):
        conn = self._get_connection()
        # 创建一个游标对象以执行SQL语句
        cursor = conn.cursor()
        cursor.execute(
            f"""DELETE FROM {self.table_name} WHERE session_id = ?""",
            (self.session_id,),
        )
        conn.commit()

    def _add_message_impl(self, message, expires_in=None):
        conn = self._get_connection()
        # 创建一个游标对象以执行SQL语句
        cursor = conn.cursor()
        role = getattr(message, "type", None)
        content = getattr(message, "content", None)
        cursor.execute(
            f"""INSERT INTO {self.table_name}(session_id,role,content) VALUES(?,?,?)""",
            (self.session_id, role, content),
        )
        conn.commit()
