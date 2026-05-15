import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { viteMockServe } from "vite-plugin-mock";

export default defineConfig(({ command, mode }) => {
  // const env = loadEnv(mode, process.cwd(), ["VUE_APP_", "VITE_"]);
  // console.log("当前环境变量 VITE_USE_MOCK:", env.VITE_USE_MOCK); // 调试日志
  // console.log("当前环境变量 VITE_USE_MOCK 类型:", typeof env.VITE_USE_MOCK); // 调试日志

  const env = loadEnv(mode, process.cwd(), ["VUE_APP_", "VITE_"]);
  const VUE_APP_BASE_API = env.VUE_APP_BASE_API || "/api";
  const VUE_APP_PROXY_TARGET = env.VUE_APP_PROXY_TARGET;
  const VITE_USE_MOCK = (env.VITE_USE_MOCK || "false").trim() === "true"; // 读取 Mock 开关
  // console.log("最终 Mock 开关状态:", VITE_USE_MOCK); // 调试日志

  return {
    plugins: [
      vue(),
      viteMockServe({
        mockPath: "src/mock", // mock文件存放目录
        enable: VITE_USE_MOCK, // 通用开关（新版插件可能使用此字段）
        localEnabled: command === "serve" && VITE_USE_MOCK, // 开发环境
        prodEnabled: command !== "serve" && VITE_USE_MOCK, // 生产环境
        supportTs: false, // 是否支持 TS
        watchFiles: true, // 监听文件变化
        logger: true, // 输出日志
        injectCode: `
          import { setupProdMockServer } from './mockProdServer';
          setupProdMockServer();
        `,
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: [".js", ".vue", ".scss", ".css", ".json"],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern",
          silenceDeprecations: [
            "import",
            "global-builtin",
            "color-functions",
            "legacy-js-api",
          ],
          additionalData: `@use "@/assets/styles/variables.scss" as *;`,
        },
      },
    },
    server: {
      port: 5057,
      open: true,
      proxy: {
        // 当 Mock 开启时，让 Mock 插件处理请求；否则代理到后端
        [VUE_APP_BASE_API]: {
          target: VUE_APP_PROXY_TARGET, // 后端8080地址
          changeOrigin: true, // 必须开启，伪装Origin避免跨域
          ws: false,
          logLevel: "debug",
          bypass: (req, res, options) => {
            // 如果开启了 Mock 且请求路径匹配 Mock 规则，则不走代理
            if (VITE_USE_MOCK && req.url.startsWith(VUE_APP_BASE_API)) {
              return req.url; // 返回请求路径，让 vite-plugin-mock 拦截
            }
          },
        },
      },
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["vue", "vue-router", "vuex"],
            element: ["element-plus"],
            editor: ["monaco-editor", "@monaco-editor/loader"],
          },
        },
      },
    },
    envPrefix: ["VUE_APP_", "VITE_"],
    define: {
      "process.env": JSON.stringify(env),
    },
  };
});
