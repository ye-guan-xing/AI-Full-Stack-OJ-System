const getters = {
  token: (state) => state.user.token, // 快捷获取用户Token
  userInfo: (state) => state.user.userInfo, // 快捷获取用户信息
  isLogin: (state) => !!state.user.token, // 快捷判断是否登录（!!把Token转成布尔值：有Token就是true，没就是false）
};

export default getters;
