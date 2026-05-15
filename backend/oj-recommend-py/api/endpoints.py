

# main.py 修正后（仅新增前4行）
import sys
import os


# 将项目根目录加入Python搜索路径（关键：解决模块导入问题）
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


from fastapi import APIRouter, HTTPException, FastAPI
from pydantic import BaseModel
from core.llm_chain import get_llm_reply
from core.session_manager import session_manager
# from utils.db_connector import get_mysql_conn

from utils.db_connector import redis_conn, mysql_conn

import pymysql
from loguru import logger




# 创建路由实例（方便后续扩展）
router = APIRouter(prefix="/api")

app = FastAPI()
app.include_router(router)

# 请求参数模型（仅user_id+text）
class UserRequest(BaseModel):
    user_id: str
    text: str
    # 用于多轮会话，可以空
    session_id: str = None

@router.post("/chat")
async def chat(req: UserRequest):
    """核心API接口（支持多轮对话）"""
    if not req.user_id:
        raise HTTPException(status_code=400, detail="user_id不能为空")

    session_id = req.session_id or session_manager.get_or_create_session(req.user_id)

    user_submissions = []
    logger.info(f"查询用户刷题记录...{req.user_id}")

    try:
        with mysql_conn.cursor() as cursor:
            user_submissions_sql = "SELECT question_id FROM user_submission_record WHERE user_id = %s and result = 'Accepted'"
            cursor.execute(user_submissions_sql, (req.user_id, ))
            user_submissions = set(cursor.fetchall())

            question_ids = tuple(item[0] for item in user_submissions) if user_submissions else ()
            logger.info(f"用户做过的题的ID：{question_ids}")

            if question_ids:
                placeholders = ', '.join(['%s'] * len(question_ids))
                user_questions_tag_sql = f"select id, label from questions where id in ({placeholders})"

                cursor.execute(user_questions_tag_sql, question_ids)
                user_questions_tag = cursor.fetchall()
                logger.info(f"用户刷过题的标签：{user_questions_tag}")
            else:
                logger.info("用户没有做过任何题")
                user_questions_tag = []

    except Exception as e:
        logger.error(f"数据库连接失败：{e}")

    reply = get_llm_reply(req.text, user_questions_tag, session_id, req.user_id)

    return {
        "code": 1,
        "msg": "success",
        "data": {
            "reply": reply,
            "session_id": session_id
        }
    }

@router.post("/chat/new")
async def chat_new(req: UserRequest):
    """创建新会话并开始对话"""
    if not req.user_id:
        raise HTTPException(status_code=400, detail="user_id不能为空")

    session_id = session_manager.create_session(req.user_id)

    user_submissions = []
    logger.info(f"查询用户刷题记录...{req.user_id}")

    try:
        with mysql_conn.cursor() as cursor:
            user_submissions_sql = "SELECT question_id FROM user_submission_record WHERE user_id = %s and result = 'Accepted'"
            cursor.execute(user_submissions_sql, (req.user_id, ))
            user_submissions = set(cursor.fetchall())

            question_ids = tuple(item[0] for item in user_submissions) if user_submissions else ()
            logger.info(f"用户做过的题的ID：{question_ids}")

            if question_ids:
                placeholders = ', '.join(['%s'] * len(question_ids))
                user_questions_tag_sql = f"select id, label from questions where id in ({placeholders})"

                cursor.execute(user_questions_tag_sql, question_ids)
                user_questions_tag = cursor.fetchall()
                logger.info(f"用户刷过题的标签：{user_questions_tag}")
            else:
                logger.info("用户没有做过任何题")
                user_questions_tag = []

    except Exception as e:
        logger.error(f"数据库连接失败：{e}")

    reply = get_llm_reply(req.text, user_questions_tag, session_id, req.user_id)

    return {
        "code": 1,
        "msg": "success",
        "data": {
            "reply": reply,
            "session_id": session_id
        }
    }

@router.get("/sessions")
async def get_sessions(user_id: str):
    """获取用户所有会话列表"""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id不能为空")

    sessions = session_manager.get_user_sessions(user_id)
    return {
        "code": 1,
        "msg": "success",
        "data": sessions
    }

@router.delete("/session/{session_id}")
async def delete_session(session_id: str, user_id: str):
    """删除指定会话"""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id不能为空")

    session_manager.delete_session(session_id, user_id)
    return {
        "code": 1,
        "msg": "success",
        "data": "会话已删除"
    }

@router.post("/session/{session_id}/clear")
async def clear_session(session_id: str, user_id: str):
    """清空会话历史"""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id不能为空")

    session_manager.clear_session(session_id, user_id)
    return {
        "code": 1,
        "msg": "success",
        "data": "会话历史已清空"
    }