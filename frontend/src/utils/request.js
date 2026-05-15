import axios from "axios";
import { getToken, removeToken } from "./auth";
import { ElMessage } from "element-plus";
// import { request } from "express";

// 创建axios实例
//发送请求时自动带上Token
const request = axios.create({
  baseURL: import.meta.env.VUE_APP_BASE_API || '/api',
  timeout: 15000, // 增加超时时间到 15s
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      // config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["token"] = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 1) {
      return res.data;
    } else {
      // ElMessage.error(res.message || "请求失败");
      console.error(res.message || "请求失败");
      return Promise.reject(new Error(res.message || "请求失败"));
    }
  },
  (error) => {
    // HTTP错误
    const { status, data } = error.response || {};

    switch (status) {
      case 401:
        ElMessage.error("登录已过期，请重新登录");
        removeToken();
        // 跳转到登录页
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        break;
      case 403:
        ElMessage.error("没有权限访问");
        break;
      case 404:
        ElMessage.error("请求资源不存在");
        break;
      case 500:
        ElMessage.error("服务器内部错误");
        break;
      default:
        ElMessage.error(data?.message || "网络错误");
    }

    return Promise.reject(error);
  }
);

export default request;
