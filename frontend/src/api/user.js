import request from "@/utils/request";

//登录
export function login(data) {
  return request({
    url: "/user/login",
    method: "post",
    data,
  });
}

// 注册

export function register(data) {
  return request({
    url: "/user/register",
    method: "post",
    data,
  });
}

//更新
export function updateUserInfo(data) {
  return request({
    url: "/user/info",
    method: "put",
    data,
  });
}

//// 退出登录
export function logout() {
  return request({
    url: "/user/logout",
    method: "post",
  });
}

//获取用户信息
export function getUserInfo() {
  return request({
    url: `/user/stats`,
    method: "get",
  });
}
