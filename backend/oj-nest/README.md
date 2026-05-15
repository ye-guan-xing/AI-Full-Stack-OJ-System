# AI校园OJ后端（nest.js）

## 简介

Nest 是一个用于构建高效、可扩展的 Node.js 服务端应用的渐进式框架。它基于 TypeScript 构建，结合了面向对象编程、函数式编程和响应式编程的思想。

## 项目安装

```bash
$ npm install
```

## 编译并运行项目

```bash
# 开发环境
$ npm run start

# 监听文件变化模式
$ npm run start:dev

# 生产环境
$ npm run start:prod
```

## 运行测试

```bash
# 单元测试
$ npm run test

# e2e 测试
$ npm run test:e2e

# 测试覆盖率
$ npm run test:cov
```

## 部署

当你准备将 Nest 应用部署到生产环境时，可以采取一些关键步骤来确保应用尽可能高效地运行。
查看 [部署文档](https://docs.nestjs.com/deployment) 了解更多信息。

如果你正在寻找基于云平台的部署方案，可以使用 **Mau** —— 官方推荐的 Nest 应用 AWS 部署平台。
Mau 让部署变得简单快捷，只需几步操作：

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

使用 Mau，你可以一键完成部署，专注于业务功能开发，无需关心基础设施管理。

## 常用资源

- [Nest 官方文档](https://docs.nestjs.com) - 学习框架的详细使用
- [Discord 社区](https://discord.gg/G7Qnnhy) - 提问、交流、获取支持
- [官方视频课程](https://courses.nestjs.com/) - 深入学习 Nest
- [Nest Mau 部署平台](https://mau.nestjs.com) - 快速部署到 AWS
- [Nest Devtools](https://devtools.nestjs.com) - 实时可视化调试应用
- [企业级技术支持](https://enterprise.nestjs.com) - 项目合作与技术支持
- [官方招聘平台](https://jobs.nestjs.com) - 求职 / 招聘

## 支持

Nest 是基于 MIT 协议的开源项目，它的发展离不开所有支持者和赞助商的支持。
如果你想加入支持行列，可以在官网查看详细说明。

## 联系我们

- 作者 - Kamil Myśliwiec
- 官网 - https://nestjs.com/
- Twitter - @nestframework

## 开源协议

Nest 基于 [MIT 开源协议](https://github.com/nestjs/nest/blob/master/LICENSE) 发布。

```

### 翻译说明
- 保留所有**徽章、链接、格式**不变
- 专业术语统一（如 `e2e`、`production`、`interceptor` 等）
- 语言简洁、符合国内开发者阅读习惯
- 可直接替换原 README.md 使用
```
