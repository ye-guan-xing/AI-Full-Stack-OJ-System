# Campus-OJ-Platform

全栈 AI 校园 OJ 平台：在线刷题 + Judge0 沙箱评测 + 基于 LangChain 的智能推荐对话。
**前端**

<p>
  <img src="https://skillicons.dev/icons?i=vue,vite" alt="Vue Vite" />
  <img src="https://img.shields.io/badge/Element_Plus-409EFF?style=for-the-badge&logo=elementplus&logoColor=white" alt="Element Plus" />
  <img src="https://img.shields.io/badge/Monaco_Editor-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="Monaco Editor" />
</p>

**主后端** · 用户 / 题目 / 评论 / 异步判题

<p>
  <img src="https://skillicons.dev/icons?i=nestjs,redis" alt="NestJS Redis" />
  <img src="https://img.shields.io/badge/TypeORM-FE0902?style=for-the-badge&logo=typeorm&logoColor=white" alt="TypeORM" />
  <img src="https://img.shields.io/badge/Bull-DF3828?style=for-the-badge&logo=redis&logoColor=white" alt="Bull" />
</p>

**AI 后端** · 多轮对话、个性化刷题推荐

<p>
  <img src="https://skillicons.dev/icons?i=fastapi,python" alt="FastAPI Python" />
  <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" alt="LangChain" />
  <img src="https://img.shields.io/badge/通义千问-615EFF?style=for-the-badge" alt="通义千问" />
</p>

**评测引擎** · 独立容器，Bull 队列消费

<p>
  <img src="https://img.shields.io/badge/Judge0-546E7A?style=for-the-badge&logo=docker&logoColor=white" alt="Judge0" />
</p>

**基础设施**

<p>
  <img src="https://skillicons.dev/icons?i=mysql,redis" alt="MySQL Redis" />
</p>

```mermaid
flowchart LR
  user[浏览器] --> fe[Vue3 前端]
  fe -->|REST| nest[NestJS 主后端]
  fe -->|REST| py[FastAPI AI 后端]
  nest --> mysql[(MySQL)]
  nest --> redis[(Redis)]
  nest -->|Bull 队列| judge0[Judge0 沙箱]
  py --> mysql
  py --> redis
  py --> llm[通义千问 LLM]
```

## 目录结构

```
Campus-OJ-Platform/
├── frontend/              # Vue3 前端
├── backend/
│   ├── oj-nest/           # NestJS 主后端（业务核心）
│   │   └── database/      # 本地库表初始化 SQL
│   ├── oj-recommend-py/   # FastAPI + LangChain AI 推荐
│   └── oj-docker-java/    # 旧版 Java 后端（已弃用，仅留存）
└── README.md
```

## 怎么用

需要先准备好 MySQL、Redis、Judge0。MySQL 表结构需手动导入（TypeORM `synchronize: false`）。

### 0. 本地构建数据库

```bash
cd backend/oj-nest
docker compose up -d mysql redis
```

等待 MySQL 就绪后导入建表脚本（`backend/oj-nest/database/本地构建数据库.sql`）：

```bash
# Docker 内执行
docker exec -i oj-mysql mysql -uroot -p1234 oj < database/本地构建数据库.sql

# 或本机 mysql 客户端
mysql -h127.0.0.1 -P3306 -uroot -p1234 oj < database/本地构建数据库.sql
```

| 组件 | 默认值 |
| ---- | ------ |
| MySQL | `root` / `1234`，库 `oj`，端口 `3306` |
| Redis | 无密码，端口 `6379` |
| 演示账号 | `admin` / `123456`（管理员） |

Nest `.env` 与 `oj-recommend-py/config/settings.py` 中的 `MYSQL_CONFIG` / `REDIS_*` 需与上表一致。

### 1. 启动主后端 NestJS

```bash
cd backend/oj-nest
npm install
npm run start:dev        # 默认 http://localhost:8080
```

`.env` 示例：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=1234
DB_DATABASE=oj
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
JUDGE0_BASE_URL=http://localhost:2358
TOKEN_TTL=3600
```

### 2. 启动 AI 推荐后端 FastAPI

```bash
cd backend/oj-recommend-py
uv sync
uv run python main.py    # 默认 http://localhost:8000
```

`config/settings.py` 中配置 `LLM_CONFIG` 的 `api_key` / `model` / `base_url`。

### 3. 启动前端 Vue3

```bash
cd frontend
npm install
npm run dev              # 默认 http://localhost:5173
```

### 4. 一键容器化（仅 Nest + 中间件）

```bash
cd backend/oj-nest
docker-compose up -d
```

## 端口约定

| 服务         | 端口 |
| ------------ | ---- |
| 前端 Vite    | 5173 |
| Nest 主后端  | 8080 |
| FastAPI AI   | 8000 |
| MySQL        | 3306 |
| Redis        | 6379 |
| Judge0       | 2358 |
