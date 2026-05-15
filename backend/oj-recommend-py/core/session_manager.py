import json
import uuid
from datetime import datetime
from typing import List, Dict, Optional
from utils.db_connector import redis_conn
from loguru import logger


class SessionManager:
    """多轮对话会话管理器"""
    
    def __init__(self, max_history: int = 10, session_ttl: int = 3600):
        """
        初始化会话管理器
        :param max_history: 每个会话保留的最大历史消息数
        :param session_ttl: 会话过期时间（秒），默认1小时
        """
        self.max_history = max_history
        self.session_ttl = session_ttl
    
    def _get_session_key(self, session_id: str) -> str:
        """获取会话信息的Redis key"""
        return f"session:{session_id}:info"
    
    def _get_messages_key(self, session_id: str) -> str:
        """获取会话消息历史的Redis key"""
        return f"session:{session_id}:messages"
    
    def _get_user_sessions_key(self, user_id: str) -> str:
        """获取用户所有会话的Redis key"""
        return f"user:{user_id}:sessions"
    
    def _get_active_session_key(self, user_id: str) -> str:
        """获取用户当前活跃会话的Redis key"""
        return f"user:{user_id}:active_session"
    
    def create_session(self, user_id: str) -> str:
        """
        为用户创建新会话
        :param user_id: 用户ID
        :return: 新会话ID
        """
        session_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        session_info = {
            "user_id": user_id,
            "created_at": now,
            "last_active": now,
            "message_count": 0
        }
        
        try:
            pipe = redis_conn.pipeline()
            pipe.hset(self._get_session_key(session_id), mapping=session_info)
            pipe.expire(self._get_session_key(session_id), self.session_ttl)
            pipe.sadd(self._get_user_sessions_key(user_id), session_id)
            pipe.expire(self._get_user_sessions_key(user_id), self.session_ttl * 24)
            pipe.set(self._get_active_session_key(user_id), session_id)
            pipe.expire(self._get_active_session_key(user_id), self.session_ttl)
            pipe.execute()
            
            logger.info(f"用户 {user_id} 创建新会话: {session_id}")
            return session_id
        except Exception as e:
            logger.error(f"创建会话失败: {e}")
            raise
    
    def get_active_session(self, user_id: str) -> Optional[str]:
        """
        获取用户当前活跃会话ID
        :param user_id: 用户ID
        :return: 会话ID，如果不存在则返回None
        """
        # 从redis里面获取活跃会话
        try:
            session_id = redis_conn.get(self._get_active_session_key(user_id))
            if session_id:
                session_id = session_id.decode('utf-8')
                session_key = self._get_session_key(session_id)
                if redis_conn.exists(session_key):
                    return session_id
            return None
        except Exception as e:
            logger.error(f"获取活跃会话失败: {e}")
            return None
    
    def get_or_create_session(self, user_id: str) -> str:
        """
        获取用户当前活跃会话，如果不存在则创建新会话
        :param user_id: 用户ID
        :return: 会话ID
        """
        session_id = self.get_active_session(user_id)
        if not session_id:
            session_id = self.create_session(user_id)
        return session_id
    
    def add_message(self, session_id: str, role: str, content: str, user_id: str = None):
        """
        向会话添加消息
        :param session_id: 会话ID
        :param role: 消息角色（user/assistant）
        :param content: 消息内容
        :param user_id: 用户ID（用于更新活跃会话）
        """
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            pipe = redis_conn.pipeline()
            messages_key = self._get_messages_key(session_id)
            
            pipe.lpush(messages_key, json.dumps(message))
            pipe.ltrim(messages_key, 0, self.max_history - 1)
            pipe.expire(messages_key, self.session_ttl)
            
            session_key = self._get_session_key(session_id)
            pipe.hincrby(session_key, "message_count", 1)
            pipe.hset(session_key, "last_active", datetime.now().isoformat())
            pipe.expire(session_key, self.session_ttl)
            
            if user_id:
                pipe.set(self._get_active_session_key(user_id), session_id)
                pipe.expire(self._get_active_session_key(user_id), self.session_ttl)
            
            pipe.execute()
            logger.info(f"会话 {session_id} 添加 {role} 消息")
        except Exception as e:
            logger.error(f"添加消息失败: {e}")
            raise
    
    def get_history(self, session_id: str, limit: int = None) -> List[Dict]:
        """
        获取会话历史消息（按时间正序）
        :param session_id: 会话ID
        :param limit: 返回的消息数量限制
        :return: 消息列表
        """
        try:
            messages_key = self._get_messages_key(session_id)
            messages = redis_conn.lrange(messages_key, 0, -1)
            
            history = []
            for msg in reversed(messages):
                history.append(json.loads(msg))
            
            if limit:
                history = history[-limit:]
            
            return history
        except Exception as e:
            logger.error(f"获取历史消息失败: {e}")
            return []
    
    def clear_session(self, session_id: str, user_id: str = None):
        """
        清空会话历史
        :param session_id: 会话ID
        :param user_id: 用户ID
        """
        try:
            pipe = redis_conn.pipeline()
            pipe.delete(self._get_messages_key(session_id))
            pipe.hset(self._get_session_key(session_id), "message_count", 0)
            pipe.hset(self._get_session_key(session_id), "last_active", datetime.now().isoformat())
            pipe.execute()
            logger.info(f"会话 {session_id} 历史已清空")
        except Exception as e:
            logger.error(f"清空会话失败: {e}")
            raise
    
    def delete_session(self, session_id: str, user_id: str):
        """
        删除会话
        :param session_id: 会话ID
        :param user_id: 用户ID
        """
        try:
            pipe = redis_conn.pipeline()
            pipe.delete(self._get_session_key(session_id))
            pipe.delete(self._get_messages_key(session_id))
            pipe.srem(self._get_user_sessions_key(user_id), session_id)
            
            if redis_conn.get(self._get_active_session_key(user_id)) == session_id.encode():
                pipe.delete(self._get_active_session_key(user_id))
            
            pipe.execute()
            logger.info(f"会话 {session_id} 已删除")
        except Exception as e:
            logger.error(f"删除会话失败: {e}")
            raise
    
    def get_user_sessions(self, user_id: str) -> List[Dict]:
        """
        获取用户所有会话
        :param user_id: 用户ID
        :return: 会话信息列表
        """
        try:
            session_ids = redis_conn.smembers(self._get_user_sessions_key(user_id))
            sessions = []
            
            for session_id in session_ids:
                session_id = session_id.decode('utf-8')
                info = redis_conn.hgetall(self._get_session_key(session_id))
                if info:
                    sessions.append({
                        "session_id": session_id,
                        "user_id": info.get(b"user_id", b"").decode('utf-8'),
                        "created_at": info.get(b"created_at", b"").decode('utf-8'),
                        "last_active": info.get(b"last_active", b"").decode('utf-8'),
                        "message_count": int(info.get(b"message_count", 0))
                    })
            
            return sorted(sessions, key=lambda x: x["last_active"], reverse=True)
        except Exception as e:
            logger.error(f"获取用户会话列表失败: {e}")
            return []


session_manager = SessionManager(max_history=10, session_ttl=3600)
