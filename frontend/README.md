# 这是一个完整的在线判题平台（前端后端开发完毕）

## OJ Platform (在线判题平台) - 后端：https://github.com/shuimo0413/oj-docker（由我的朋友shuimo0413）开发，欢迎大家使用。）

---

# OJ Platform (在线判题平台) - 前端框架

一个基于 Vue 3 和 Vite 构建的现代化、高性能在线判题（Online Judge）平台的核心前端框架。

## 项目简介

本项目是 OJ Platform 的核心前端框架，旨在为用户提供一个界面美观、交互流畅、功能强大的在线编程与算法训练环境。它作为用户与后端评测系统之间的桥梁，负责所有数据的可视化展示和用户操作的交互处理。

项目以用户体验为中心，采用业界领先的前端技术栈，确保了代码的可维护性、可扩展性以及应用的高性能。无论是初学者还是资深算法爱好者，都能在此平台上高效地进行编程练习。

## 技术栈

- **前端框架**: [Vue.js 3](https://vuejs.org/) (使用 `<script setup>` 语法，拥抱组合式 API)
- **构建工具**: [Vite](https://vitejs.dev/) (提供极速的开发体验和优化的构建产物)
- **UI 组件库**: [Element Plus](https://element-plus.org/) `^2.0.0` (或你使用的其他库，如 Ant Design Vue)
- **HTTP 客户端**: [Axios](https://axios-http.com/) (用于与后端 API 进行通信)
- **代码规范**: [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) (确保代码质量和风格统一)
- **在线编辑器**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) (由 VS Code 提供支持，实现强大的代码编辑功能)

## 快速开始

以下指南将帮助你在本地环境中快速搭建并运行项目。

### 环境准备

在开始之前，请确保你的环境中已安装以下软件：

- [Node.js](https://nodejs.org/) (推荐使用 LTS 版本，例如 v16, v18 或更高)
- [npm](https://www.npmjs.com/) (通常随 Node.js 一起安装) 或 [Yarn](https://yarnpkg.com/)

### 安装与运行

1.  **克隆仓库**

    ```sh
    git clone https://github.com/your-username/oj-platform.git
    cd oj-platform
    ```

2.  **安装项目依赖**

    ```sh
    npm install
    ```

3.  **启动开发服务器**
    启动一个本地开发服务器，并在浏览器中打开。当你修改代码时，页面会自动热更新。

    ```sh
    npm run dev
    ```

    终端会显示一个本地访问地址（例如 http://localhost:5173/），在浏览器中打开即可。

4.  **构建生产版本**
    当你准备好部署项目时，可以运行以下命令来构建优化后的静态文件。

    ```sh
    npm run build
    ```

    构建完成后，所有文件都会输出到项目根目录下的 `dist` 文件夹中。Vite 会进行代码分割、Tree-shaking 和静态资源优化，以提供最佳的加载性能。你可以将此文件夹部署到任何静态文件服务器（如 Nginx, Vercel, Netlify 等）。

5.  **代码规范检查与修复**
    在提交代码之前，建议运行以下命令来检查并自动修复代码风格问题。
    ```sh
    npm run lint
    ```

## 功能特点

- **用户系统**: 支持用户注册、登录、登出、个人信息查看与管理。
- **题目管理**: 提供分页、筛选、搜索功能的题目列表；包含详细描述、输入输出样例、时间/内存限制的题目详情页。
- **在线编辑器**: 集成强大的 Monaco Editor，支持多种编程语言（C++, Java, Python 等）的语法高亮、智能代码提示、代码格式化和错误检测。
- **代码提交与评测**: 提供无缝的代码提交体验，将代码发送至后端评测系统，并实时展示评测结果（如：通过 (AC)、答案错误 (WA)、时间超限 (TLE)、内存超限 (MLE) 等）。
- **实时评测结果反馈**: 提交后，用户无需刷新页面即可看到评测队列状态和最终结果。
- **详细的错误信息**: 当提交失败时，提供清晰的错误原因，如编译错误信息或运行时错误信息，帮助用户快速定位问题。
- **排行榜**: 展示用户的解题数量、通过的题目数和排名，激励用户竞争与学习。
- **个人提交记录**: 用户可以查看自己过去的所有提交记录，方便复习和追踪解题历程。

## 项目结构

```
oj-platform/
├── public/                  # 静态资源 (不会被打包处理)
├── src/
│   ├── api/                 # API 请求函数封装
│   ├── assets/              # 模块资源 (会被打包处理)
│   │   ├── images/
│   │   └── styles/
│   ├── components/          # 全局/公共组件
│   │   ├── common/
│   │   └── editor/
│   ├── router/              # 路由配置
│   ├── store/               # Pinia 状态管理 (如果使用)
│   ├── utils/               # 工具函数
│   ├── views/               # 页面组件
│   │   ├── Home/
│   │   ├── Problem/
│   │   ├── Submission/
│   │   └── User/
│   ├── App.vue              # 根组件
│   └── main.js              # 应用入口文件
├── .eslintrc.cjs            # ESLint 配置
├── .prettierrc.json         # Prettier 配置
├── index.html               # HTML 入口文件
├── package.json             # 项目依赖和脚本
└── vite.config.js           # Vite 配置
```

## 贡献指南

我们非常欢迎社区的贡献！如果你想为这个项目贡献代码、修复 Bug 或提出新功能，请遵循以下步骤：

1.  **Fork** 本仓库到你的 GitHub 账户。
2.  **Clone** 你 Fork 的仓库到本地。
    ```sh
    git clone https://github.com/YOUR_USERNAME/oj-platform.git
    ```
3.  创建一个新的分支来进行你的修改。
    ```sh
    git checkout -b feature/amazing-feature
    ```
4.  完成你的修改后，提交你的代码。
    ```sh
    git commit -m 'Add some amazing feature'
    ```
5.  将你的分支推送到远程仓库。
    ```sh
    git push origin feature/amazing-feature
    ```
6.  在 GitHub 上，为你的分支创建一个 **Pull Request**，并详细描述你的修改内容。

在提交 Pull Request 之前，请确保你已经运行了 `npm run lint` 来检查代码风格，并且所有测试（如果有）都已通过。

## 许可证

本项目采用 [MIT 许可证](LICENSE)。详情请参见项目根目录下的 `LICENSE` 文件。
