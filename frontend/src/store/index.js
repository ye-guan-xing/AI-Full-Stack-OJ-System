import { createStore } from "vuex"; // 导入Vuex的核心函数
import getters from "./getters"; // 导入全局快捷访问
import user from "./modules/user"; // 导入用户模块
import problem from "./modules/problem"; // 导入题目模块（比如题目列表）
import submission from "./modules/submission"; // 导入提交记录模块

// 创建并导出Vuex仓库
export default createStore({
  modules: {
    user,
    problem,
    submission,
  },
  getters, // 注册全局快捷访问
});
