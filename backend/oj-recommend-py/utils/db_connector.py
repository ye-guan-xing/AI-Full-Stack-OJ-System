import redis
import pymysql
from config.settings import REDIS_CONFIG, MYSQL_CONFIG

def get_redis_conn():
    """获取Redis连接"""
    try:
        conn = redis.Redis(**REDIS_CONFIG)
        conn.ping()
        return conn
    except Exception as e:
        raise Exception(f"Redis连接失败：{e}")

def get_mysql_conn():
    """获取MySQL连接"""
    try:
        conn = pymysql.connect(**MYSQL_CONFIG)
        return conn
    except Exception as e:
        raise Exception(f"MySQL连接失败：{e}")

redis_conn = get_redis_conn()
mysql_conn = get_mysql_conn()
