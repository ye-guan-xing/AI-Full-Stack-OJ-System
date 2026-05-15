// 导入必要的接口和工具函数（根据useMock决定是否启用真实接口）
import { getToken, setToken, removeToken, getUserInfo as getStoredUserInfo, setUserInfo as setStoredUserInfo, removeUserInfo } from "@/utils/auth";
import { login as apiLogin, logout as apiLogout } from "@/api/user";
import { getUserInfo } from "@/api/user"; // 按需启用

// const useMock = false; // 切换模拟或真实接口

const state = {
  token: getToken(),
  userInfo: getStoredUserInfo(),
};

// 2. 同步修改 state 的唯一入口
const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token; // 小写 token，与 state 定义一致
  },
  SET_USER_INFO: (state, userInfo) => {
    state.userInfo = userInfo;
    setStoredUserInfo(userInfo);
  },
  CLEAR_USER: (state) => {
    state.token = ""; // 小写 token
    state.userInfo = null;
    removeToken(); // 执行删除 Token 的函数（加括号）
    removeUserInfo(); // 执行删除用户信息的函数
  },
};

// 3. 处理异步操作（通过useMock切换模式）
const actions = {
  // 登录操作（通过useMock切换模式）
  login({ commit }, userInfo) {
    const { username, password } = userInfo;
    return new Promise((resolve, reject) => {
      /*
      // ========== 模拟登录逻辑 ==========
      if (useMock) {
        if (username === "admin" && password === "123456") {
          const tempToken = "temp-admin-token-123"; // 临时 Token
          commit("SET_TOKEN", tempToken);
          setToken(tempToken);
          const mockUserInfo = {
            username: "admin",
            id: "1",
            status: "active",
            roles: "admin", // 管理员角色
          };
          commit("SET_USER_INFO", mockUserInfo);
          resolve(mockUserInfo);
        } else if (username === "user" && password === "123456") {
          const tempToken = "temp-user-token-456";
          commit("SET_TOKEN", tempToken);
          setToken(tempToken);
          const mockUserInfo = {
            username: "user",
            id: "2",
            status: "active",
            roles: "user", // 普通用户角色
          };
          commit("SET_USER_INFO", mockUserInfo);
          resolve(mockUserInfo);
        } else {
          reject("用户名或密码错误（模拟：admin/123456 或 user/123456）");
        }
        return;
      }
      */

      // ========== 真实接口登录逻辑（适配后端返回格式） ==========
      apiLogin({ username, password })
        .then((response) => {
          console.log("前端实际拿到的响应：", response);
          //mockuserinfo
          // 响应拦截器已经返回了 response.data，所以 response 就是数据对象本身
          // 后端直接返回 {message: '登录成功', token: '...', id: '1', username: 'admin', roles: 'admin'}
          const loginData = response;

          // 1. 校验登录状态（以message为判断依据）
          if (loginData.message !== "登录成功" || !loginData.token) {
            reject(loginData.message || "登录失败，未获取到Token");
            return;
          }

          // 2. 设置Token
          commit("SET_TOKEN", loginData.token);
          setToken(loginData.token);

          // 3. 构造用户信息并存储
          const basicUserInfo = {
            username: loginData.username,
            id: loginData.id,
            status: loginData.status || "active",
            roles: loginData.roles || (username === "admin" ? "admin" : "user"),
          };
          commit("SET_USER_INFO", basicUserInfo);
          resolve(basicUserInfo); // 返回用户信息，供登录组件使用
        })
        .catch((error) => {
          console.log("登录失败的原因：", error);
          reject(error.message || "登录请求异常，请重试");
        });
    });
  },

  // 获取用户信息（通过useMock切换模式）
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      /*
      // ========== 模拟获取用户信息逻辑 ==========
      if (useMock) {
        if (!state.token) {
          reject("未登录，请先登录");
          return;
        }

        // 根据模拟Token返回对应用户信息
        if (state.token === "temp-admin-token-123") {
          const tempAdminInfo = {
            username: "管理员",
            id: "1",
            roles: "admin",
            permissions: ["problem:manage", "user:manage"], // 管理员权限
          };
          commit("SET_USER_INFO", tempAdminInfo);
          resolve(tempAdminInfo);
        } else if (state.token === "temp-user-token-456") {
          const tempUserInfo = {
            username: "普通用户",
            id: "2",
            roles: "user",
            permissions: ["problem:view"], // 普通用户权限
          };
          commit("SET_USER_INFO", tempUserInfo);
          resolve(tempUserInfo);
        } else {
          reject("无效的Token，请重新登录");
        }
        return;
      }
      */

      // ========== 真实接口获取用户信息逻辑（适配后端返回格式） ==========
      // 先判断当前userInfo是否已有roles
      const currentUser = state.userInfo;
      if (currentUser?.roles) {
        // 已有roles字段，直接使用
        commit("SET_USER_INFO", currentUser);
        resolve(currentUser);
        return;
      }

      // 正常逻辑：先校验Token是否存在
      if (!state.token) {
        reject("未登录，请先登录");
        return;
      }

      // 尝试从localStorage获取用户信息
      const storedUserInfo = getStoredUserInfo();
      if (storedUserInfo?.username) {
        // 确保roles字段存在
        const userInfoWithRoles = {
          ...storedUserInfo,
          roles:
            storedUserInfo.roles ||
            (storedUserInfo.username === "admin" ? "admin" : "user"),
        };
        commit("SET_USER_INFO", userInfoWithRoles);
        resolve(userInfoWithRoles);
        return;
      }

      // 调用接口获取用户信息（确保请求携带Token）
      getUserInfo()
        .then((response) => {
          // 后端直接返回用户信息对象：{id: '1', username: 'admin', roles: 'admin', ...}
          const userData = response;

          // 校验核心字段
          if (!userData.username) {
            reject("用户信息无效，请重新登录");
            return;
          }

          // 确保roles字段存在
          const userInfoWithRoles = {
            ...userData,
            roles:
              userData.roles ||
              (userData.username === "admin" ? "admin" : "user"),
          };
          commit("SET_USER_INFO", userInfoWithRoles);
          resolve(userInfoWithRoles);
        })
        .catch((error) => {
          console.error("获取用户信息失败:", error);
          // 如果API调用失败，尝试使用登录时存储的用户信息
          const loginUserInfo = state.userInfo;
          if (loginUserInfo?.username) {
            commit("SET_USER_INFO", loginUserInfo);
            resolve(loginUserInfo);
          } else {
            reject(error.message || "获取用户信息失败");
          }
        });
    });
  },

  // 退出登录（通过useMock切换模式）
  logout({ commit }) {
    return new Promise((resolve, reject) => {
      /*
      // ========== 模拟退出逻辑 ==========
      if (useMock) {
        commit("CLEAR_USER");
        resolve();
        return;
      }
      */

      // ========== 真实接口退出逻辑 ==========
      apiLogout()
        .then(() => {
          commit("CLEAR_USER");
          resolve();
        })
        .catch((error) => {
          // 即使退出接口失败，也强制清空本地状态
          commit("CLEAR_USER");
          reject(error);
        });
    });
  },

  // 强制清除 Token
  resetToken({ commit }) {
    return new Promise((resolve) => {
      commit("CLEAR_USER");
      // 新增：清除 localStorage 中的 Token
      localStorage.removeItem("TOKEN_KEY"); // 注意与 auth.js 中的 TOKEN_KEY 一致
      resolve();
    });
  },
};

// 导出模块
export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
