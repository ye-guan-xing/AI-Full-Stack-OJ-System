---
name: Java OJ to NestJS
overview: 将 Java Spring Boot OJ 系统（backend/oj-docker-java）完整迁移为 NestJS 框架，保持所有接口、业务逻辑和数据库结构不变。
todos:
  - id: init
    content: 初始化 NestJS 项目 (nest new oj-nest)，安装全部依赖
    status: completed
  - id: entities
    content: 创建 7 个 TypeORM 实体类，对应现有 MySQL 表结构
    status: completed
  - id: common
    content: 实现公共层：TokenGuard、全局异常 Filter、统一响应 Interceptor
    status: completed
  - id: config
    content: 配置层：DatabaseModule、RedisModule、Judge0Config，读取 .env
    status: completed
  - id: user-module
    content: User 模块：login/register/logout/changePassword/updateInfo/status
    status: completed
  - id: question-module
    content: Question 模块：管理端 + 用户端两套 Controller，共享 Service
    status: completed
  - id: comment-module
    content: Comment 模块：增删查 + 点赞/取消
    status: completed
  - id: judge-service
    content: Judge 服务：Judge0 HTTP 调用 + Bull 异步队列处理判题
    status: completed
  - id: env-docker
    content: 配置 .env、更新/新建 Docker Compose（含 NestJS 服务）
    status: completed
isProject: false
---

# Java OJ → NestJS 迁移方案

## 现有 Java 架构速览

```mermaid
flowchart TD
    Client -->|HTTP| Controller
    Controller -->|TokenInterceptor| Redis
    subgraph Spring[Spring Boot]
        Controller --> Service
        Service --> Mapper
        Service -->|RestTemplate| Judge0
        Mapper --> MySQL
        Service --> RedisUtils
    end
    Judge0 -->|Docker容器| Sandbox
```

**技术栈对比**

- Java Spring Boot → NestJS (TypeScript)
- MyBatis Plus → TypeORM
- Spring `@Async` + 线程池 → Bull 队列
- `TokenInterceptor` + Redis → NestJS `Guard` + Redis
- `RestTemplate` → `@nestjs/axios`
- Guava BloomFilter → `bloom-filters` npm 包

---

## 目标 NestJS 结构

```
backend/oj-nest/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── guards/token.guard.ts        ← 对应 TokenInterceptor
│   │   ├── filters/http-exception.filter.ts
│   │   ├── interceptors/response.interceptor.ts  ← 统一 Result<T> 格式
│   │   └── decorators/current-user.decorator.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── judge0.config.ts
│   ├── modules/
│   │   ├── user/                        ← /api/user
│   │   ├── question/                    ← /api/testQuestion + /api/user/testQuestion
│   │   ├── comment/                     ← /api/comment
│   │   └── judge/                       ← Judge0 集成服务
│   └── entities/                        ← TypeORM 实体
│       ├── user.entity.ts
│       ├── questions.entity.ts
│       ├── test-point.entity.ts
│       ├── user-submission-code.entity.ts
│       ├── user-submission-record.entity.ts
│       ├── comment.entity.ts
│       └── comment-like.entity.ts
├── .env
└── package.json
```

---

## 接口对照（完整保持不变）

**用户模块** `/api/user`

- POST `/login` — 无需 Token
- POST `/register` — 无需 Token
- POST `/logout` — Header: `token`
- POST `/changePassword` — Header: `Authorization`
- PUT `/info` — Header: `Authorization`
- GET `/status` — Header: `Authorization`

**管理题目模块** `/api/testQuestion` — 需 Token

- GET `/getTestQuestionByPage`、`/getTestQuestionCount`、`/getTestQuestionById`
- POST `/addTestQuestion`、`/updateTestQuestion`
- DELETE `/deleteTestQuestionById`
- GET `/getTestPointsListByQuestionId`

**用户题目模块** `/api/user/testQuestion` — 需 Token

- GET `/getTestQuestionByPage`、`/getTestQuestionById`、`/getTestQuestionByName`、`/getTestPointsListByQuestionId`
- POST `/submitTestQuestion`

**评论模块** `/api/comment` — 需 Token

- POST `/addComment`、`/addCommentLike`
- GET `/getComment`、`/getComments`
- DELETE `/deleteComment`、`/cancelCommentLike`

---

## Auth Token 机制（与 Java 保持一致）

```mermaid
sequenceDiagram
    Client->>+UserService: POST /login (username, password)
    UserService->>+MySQL: 查询用户
    UserService->>Redis: SET MD5(username+password) → username, TTL 1h
    UserService-->>-Client: {token: MD5值, ...UserVO}

    Client->>+TokenGuard: 请求带 Authorization: Bearer <token> 或 token header
    TokenGuard->>Redis: hasKey(token)?
    Redis-->>TokenGuard: true/false
    TokenGuard-->>-Client: 放行 or 401
```

---

## 判题异步流程（Java @Async → Bull 队列）

```mermaid
flowchart LR
    subgraph NestJS
        Controller -->|enqueue| JudgeQueue
        JudgeQueue -->|process| JudgeProcessor
        JudgeProcessor -->|POST| Judge0
        Judge0 -->|轮询token| Judge0
        JudgeProcessor -->|写结果| MySQL
    end
```

---

## 实施任务（按顺序）

1. **初始化项目** — `nest new oj-nest`，安装依赖
2. **TypeORM 实体** — 按 7 张表创建 entity，与现有 MySQL schema 对齐
3. **公共层** — Guard、Filter、Interceptor、Decorator
4. **配置层** — DB/Redis/Judge0 的 ConfigModule
5. **User 模块** — Controller + Service + DTO
6. **Question 模块** — Admin + User 两个 Controller，共享 Service
7. **Comment 模块** — Controller + Service + DTO
8. **Judge 服务** — Judge0 HTTP 调用 + Bull 异步队列
9. **环境配置** — `.env` 文件 + Docker Compose

---

## 关键依赖

```
@nestjs/typeorm  typeorm  mysql2
@nestjs/config
ioredis  @nestjs-modules/ioredis
@nestjs/axios  axios
@nestjs/bull  bull
class-validator  class-transformer
crypto-js  (MD5 token)
```

---

## 注意事项（Java 坑已排查）

- Java `logout` 未真正删除 Redis key，NestJS 版应**补全**删 key 逻辑
- `Judge0Config` 中的 URL（localhost:2380）与 `IPConstants`（Docker 容器名:2358）**不一致**，统一用环境变量 `JUDGE0_BASE_URL`
- `changePassword`/`info`/`status` 接受**裸 token**（无 `Bearer ` 前缀），Guard 需同时兼容两种格式
- Judge0 `status.id=3` → AC，`5` → TLE，其他非 3 → RE
