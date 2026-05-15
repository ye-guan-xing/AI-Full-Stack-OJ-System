const TOKEN_KEY = "oj_user_token";
const USER_INFO_KEY = "oj_user_info";

//获取token
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

//存储Token
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

//移除 token
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

//获取用户信息
export function getUserInfo() {
  const userInfo = localStorage.getItem(USER_INFO_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
}

//存储用户信息
export function setUserInfo(userInfo) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

//移除用户信息
export function removeUserInfo() {
  localStorage.removeItem(USER_INFO_KEY);
}

//检查是否已登录
export function inAuthenticated() {
  return !!getToken();
}
