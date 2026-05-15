# 初始化题目标签到Redis（仅首次运行）
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import pymysql
from typing import List, Dict, Optional
from utils.db_connector import redis_conn, mysql_conn


def init_question_tags(questions: Optional[List[Dict]] = None):
    """
    从MySQL读取题目，初始化标签到Redis
    结构：
    - question:{qid}:tags → 题目标签集合（Set）
    - tag:{tag}:questions → 标签对应的题目ID（Set）
    - question:{qid}:meta → 题目元信息（JSON格式）
    """
    if questions is None:
        cursor = mysql_conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute("SELECT id, label FROM questions")
        questions = cursor.fetchall()
        cursor.close()

    if not questions:
        print("无题目数据，无需初始化")
        return

    pipe = redis_conn.pipeline()
    for q in questions:
        qid = q["id"]
        tags = q["label"].split(",") if (isinstance(q["label"], str) and q["label"]) else []

        meta = json.dumps({
            "qid": qid,
            "label": tags
        })

        pipe.sadd(f"question:{qid}:tags", *tags)
        pipe.set(f"question:{qid}:meta", meta)

        for tag in tags:
            pipe.sadd(f"tag:{tag}:questions", qid)

    pipe.execute()
    print(f"初始化{len(questions)}道题的标签完成")


def get_questions_by_tag(tag: str) -> List[Dict]:
    """
    根据标签查询所有题目（如查询array标签的所有题目）
    :param tag: 标签名（如array、easy）
    :return: 题目信息列表
    """
    try:
        sql = f"SELECT id, label FROM questions WHERE label LIKE '%{tag}%'"
        cursor = mysql_conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute(sql)
        result = cursor.fetchall()
        # 打印日志
        logging.info(f"查询标签为{tag}的题目，结果为{result}")  # 打印日志

        return result
    except Exception as e:
        print(f"Error: {e}")
        return []
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()


def get_all_questions() -> List[Dict]:
    """
    获取所有题目数据
    :return: 题目信息列表
    """
    try:
        sql = "SELECT id, label FROM questions"
        cursor = mysql_conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute(sql)
        result = cursor.fetchall()
        return result
    except Exception as e:
        print(f"Error: {e}")
        return []
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()


def clear_redis_data():
    """
    清空Redis中的题目相关数据（谨慎使用）
    """
    try:
        keys = redis_conn.keys("question:*")
        keys += redis_conn.keys("tag:*")
        if keys:
            redis_conn.delete(*keys)
            print(f"已清空{len(keys)}个Redis键")
        else:
            print("Redis中无相关数据")
    except Exception as e:
        print(f"清空Redis数据失败：{e}")


if __name__ == "__main__":
    all_questions = get_all_questions()
    print(f"从MySQL获取到{len(all_questions)}道题目")
    init_question_tags(all_questions)
