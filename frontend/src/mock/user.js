export default [
  // 用户登录
  {
    url: "/api/user/login",
    method: "post",
    response: ({ body }) => {
      const { username, password } = body;
      if (username === "admin" && password === "123456") {
        return {
          code: 1,
          message: "登录成功",
          token: "temp-admin-token-123",
          username: "admin",
          id: "1",
          roles: "admin",
          status: "active",
        };
      } else if (username === "user" && password === "123456") {
        return {
          code: 1,
          message: "登录成功",
          token: "temp-user-token-456",
          username: "user",
          id: "2",
          roles: "user",
          status: "active",
        };
      } else {
        return {
          code: 0,
          message: "用户名或密码错误",
        };
      }
    },
  },
  // 获取用户信息
  {
    url: "/api/user/stats",
    method: "get",
    response: ({ headers }) => {
      // 简单根据 token 判断用户身份
      const token = headers.authorization;
      if (token === "temp-admin-token-123") {
        return {
          username: "admin",
          id: "1",
          roles: "admin",
          permissions: ["problem:manage", "user:manage"],
        };
      } else if (token === "temp-user-token-456") {
        return {
          username: "user",
          id: "2",
          roles: "user",
          permissions: ["problem:view"],
        };
      } else {
        return {
            username: "admin",
            id: "1",
            roles: "admin",
            permissions: ["problem:manage", "user:manage"],
        }
      }
    },
  },
  // 退出登录
  {
    url: "/api/user/logout",
    method: "post",
    response: () => {
      return {
        code: 1,
        message: "success",
      };
    },
  },
];
