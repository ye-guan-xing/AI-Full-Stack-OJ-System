import os


LLM_CONFIG = {
    "model": os.getenv("DASHSCOPE_MODEL", "qwen-turbo"),
    "api_key": os.getenv("DASHSCOPE_API_KEY"),
    "base_url": os.getenv(
        "DASHSCOPE_BASE_URL",
        "https://dashscope.aliyuncs.com/compatible-mode/v1",
    ),
    "temperature": 0.1,
}

AI_CHAT_ENABLED = os.getenv("AI_CHAT_ENABLED", "").lower() in ("1", "true", "yes")

REDIS_CONFIG = {
    "host": "localhost",
    "port": 6379,
    "db": 0,
    "decode_responses": True,
    "password": None,
    "socket_timeout": 5,
}

MYSQL_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "1234",
    "database": "oj",
    "charset": "utf8"
}


# API配置
API_CONFIG = {
    "host": os.getenv("API_HOST", "127.0.0.1"),
    "port": int(os.getenv("API_PORT", "8000")),
    "workers": 1,
}