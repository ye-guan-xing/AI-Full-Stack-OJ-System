import MainLayout from "@/layouts/MainLayout.vue";

// 公共路由（无需登录）
const publicRoutes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/AppLogin.vue"),
    meta: {
      title: "登录",
      requiresGuest: true, // 仅未登录用户可访问
    },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/login/AppRegister.vue"),
    meta: {
      title: "注册",
      requiresGuest: true, // 仅未登录用户可访问
    },
  },
  {
    path: "/",
    component: MainLayout,
    redirect: "/home",
    children: [
      // 公共子路由（无需登录）
      {
        path: "home",
        name: "Home",
        component: () => import("@/views/AppHome.vue"),
        meta: { title: "首页" },
      },
      {
        path: "problems",
        name: "ProblemList",
        component: () => import("@/views/problem/ProblemList.vue"),
        meta: { title: "题目列表" },
      },
      {
        path: "problems/:id",
        name: "ProblemDetail",
        component: () => import("@/views/problem/ProblemDetailView.vue"),
        meta: { title: "题目详情" },
      },
      // 评论页面
      {
        path: "problems/:id/comments",
        name: "ProblemComments",
        component: () => import("@/views/problem/Comment.vue"),
        meta: { title: "题目评论" },
      },
      // 需要登录的子路由
      {
        path: "submissions",
        name: "SubmissionHistory",
        component: () => import("@/views/submission/SubmissionHistory.vue"),
        meta: { title: "提交历史", requiresAuth: true },
      },
      // {
      //   path: "chat",
      //   name: "AIChat",
      //   component: () => import("@/views/chat/ChatView.vue"),
      //   meta: { title: "AI助手", requiresAuth: true },
      // },
    ],
  },
  {
    path: "/user",
    component: MainLayout,
    meta: { requiresAuth: true }, // 需登录访问
    children: [
      {
        path: "profile", // 完整路径：/user/profile
        name: "UserProfile",
        component: () => import("@/views/user/UserProfile.vue"),
        meta: { title: "个人中心" },
      },
      {
        path: "setting", // 可选：账号设置路由（匹配导航栏的/user/setting）
        name: "UserSetting",
        component: () => import("@/views/user/UserSetting.vue"),
        meta: { title: "账号设置" },
      },
    ],
  },
];

// 管理员路由（独立嵌套，避免冲突）
const adminRoutes = [
  {
    path: "/admin",
    component: MainLayout, // 共用MainLayout布局
    meta: { requiresAuth: true, requiresAdmin: true }, // 管理员权限
    children: [
      // 题目管理（路径统一为problems，与组件匹配）
      {
        path: "problems", // 访问路径：/admin/problems
        name: "AdminProblemList",
        component: () => import("@/views/admin/ProblemManagement.vue"), // 确认组件实际路径！
        meta: { title: "题目管理" },
      },
      {
        path: "problems/create", // 访问路径：/admin/problems/create
        name: "AdminProblemCreate",
        component: () => import("@/views/admin/ProblemEdit.vue"), // 确认组件实际路径！
        meta: { title: "创建题目" },
      },
      {
        path: "problems/:id/edit", // 访问路径：/admin/problems/1/edit
        name: "AdminProblemEdit",
        component: () => import("@/views/admin/ProblemEdit.vue"), // 确认组件实际路径！
        meta: { title: "编辑题目" },
      },
    ],
  },
];

// 404路由
const notFoundRoute = {
  path: "/:pathMatch(.*)*",
  name: "NotFound",
  component: () => import("@/views/NotFound.vue"),
  meta: { title: "页面未找到 - OJ平台" },
};

// 合并所有路由（顺序：公共→管理员→404）
const routes = [...publicRoutes, ...adminRoutes, notFoundRoute];

export default routes;
