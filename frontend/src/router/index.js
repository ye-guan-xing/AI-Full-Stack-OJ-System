import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";
import store from "@/store";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition ? savedPosition : { top: 0 };
  },
});

// 白名单 - 不需要登录就能访问的页面
const WHITE_LIST = ["/login", "/register", "/forgot-password"];

// 设置页面标题
const setDocumentTitle = (to) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - OJ平台`;
  } else {
    document.title = "OJ平台";
  }
};

// 检查用户权限
const checkPermission = (to) => {
  const userInfo = store.getters.userInfo;

  // 需要管理员权限
  if (to.meta.requiresAdmin) {
    const isAdmin = userInfo?.roles?.includes("admin");
    return {
      allowed: isAdmin,
      redirectPath: isAdmin ? null : "/",
    };
  }

  return { allowed: true, redirectPath: null };
};

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    await store.dispatch("user/getInfo");
    return { success: true, error: null };
  } catch (error) {
    await store.dispatch("user/resetToken");
    return {
      success: false,
      error,
      message: "获取用户信息失败，请重新登录",
    };
  }
};

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 1. 设置页面标题
  setDocumentTitle(to);

  // 2. 获取token状态
  const hasToken = store.getters.token;

  // 情况1: 用户已登录
  if (hasToken) {
    // 已登录用户访问登录页，重定向到首页
    if (to.path === "/login") {
      next({ path: "/" });
      return;
    }

    // 检查是否有用户信息
    if (!store.getters.userInfo) {
      try {
        // 获取用户信息
        const { success } = await fetchUserInfo();

        if (!success) {
          // 获取用户信息失败，跳转到登录页
          next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
          return;
        }
      } catch (error) {
        console.error("获取用户信息异常:", error);
        next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
        return;
      }
    }

    // 检查权限
    const permission = checkPermission(to);
    if (!permission.allowed) {
      // 权限不足，跳转到指定页面
      next({ path: permission.redirectPath });
      return;
    }

    // 所有检查通过，放行
    next();
    return;
  }

  // 情况2: 用户未登录
  // 检查是否在白名单中
  if (WHITE_LIST.includes(to.path)) {
    next();
    return;
  }

  // 需要登录但未登录，跳转到登录页
  const redirectPath =
    to.fullPath === "/" ? "" : `?redirect=${encodeURIComponent(to.fullPath)}`;
  next(`/login${redirectPath}`);
});

// 路由错误处理
router.onError((error) => {
  console.error("路由错误:", error);
  // 可以根据错误类型跳转到不同页面
  // 例如：404页面、500错误页面等
});

export default router;
