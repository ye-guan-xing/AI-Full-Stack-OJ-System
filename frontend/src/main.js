import { createApp } from "vue";
//导入项目最外层的 “大盒子”（所有页面都装这里）
import App from "./App.vue";
//导入 “页面跳转管家”（管从首页跳到题库页这类操作）
import router from "./router";
//导入 “全局数据仓库”（存登录信息、题目数据等）
import store from "./store";

//导入现成的按钮 / 表格 / 表单（不用自己写）
import ElementPlus from "element-plus";
//给上面的按钮 / 表格加样式（不然会丑）
import "element-plus/dist/index.css";
//导入配套的图标（搜索、删除这些小图标）
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

const app = createApp(App);

// 全局注册Element Plus
app.use(ElementPlus);
// 全局注册图标（可选）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(store);
app.use(router);
app.mount("#app");
//一句话总结
//main.js 就干一件事：把 Vue、页面跳转、数据管理、现成的 UI 组件都拼好，然后让应用在网页上显示出来
