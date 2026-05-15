# main.py 完整正确版本
import sys
import os

from scripts.init_tags import init_question_tags, get_questions_by_tag

# 强制将项目根目录加入Python搜索路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# 绝对导入api的路由
from api.endpoints import router
from config.settings import API_CONFIG, AI_CHAT_ENABLED

# 创建FastAPI应用实例
app = FastAPI(title="OJ智能推荐API")

# 跨域配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if AI_CHAT_ENABLED:
    app.include_router(router)

# 启动服务
if __name__ == "__main__":
    import uvicorn

    # 初始化
    init_question_tags()
    # 连接数据库

    # get_questions_by_tag("%")

    uvicorn.run("main:app", **API_CONFIG)