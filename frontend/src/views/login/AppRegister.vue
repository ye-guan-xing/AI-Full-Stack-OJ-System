<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>OJ平台注册</h2>
        <p>请创建您的账号</p>
      </div>

      <el-form
        ref="registerFormRef"
        :model="formData"
        :rules="registerRules"
        class="login-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="el-icon-user"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="el-icon-lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请确认密码"
            size="large"
            prefix-icon="el-icon-lock"
            show-password
            @keyup.enter="handleRegister"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            size="large"
            class="login-btn"
            @click="handleRegister"
          >
            {{ loading ? "注册中..." : "注册" }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>已有账号？<a href="#" @click="handleLogin">立即登录</a></p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { register } from "@/api/user";

const router = useRouter();

const loading = ref(false);
const formData = reactive({
  username: "",
  password: "",
  confirmPassword: "",
});
const registerFormRef = ref(null);

const registerRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    {
      min: 3,
      max: 20,
      message: "用户名长度在 3 到 20 个字符",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度在 6 到 20 个字符", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.password) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

const handleRegister = async () => {
  if (loading.value) return;
  try {
    loading.value = true;
    // 1. 先校验表单
    await registerFormRef.value.validate();

    // 2. 调用注册接口
    const response = await register({
      username: formData.username,
      password: formData.password,
    });
    console.log("注册接口响应：", response);

    // 3. 核心修改：根据后端实际响应判断成功（有id即代表注册成功）
    const isSuccess = !!response.id; // 只要id存在且不为空，就是成功

    if (isSuccess) {
      // 后端message为null，给默认成功提示
      ElMessage.success(response.message || "注册成功，请登录");
      router.push("/login");
    } else {
      ElMessage.error(response.message || "注册失败");
    }
  } catch (error) {
    // 捕获网络异常/接口报错
    console.error("注册请求异常：", error);
    ElMessage.error("网络异常或请求处理失败，请刷新重试");
  } finally {
    loading.value = false;
  }
};

const handleLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
@import "@/assets/styles/Applogin.css";
</style>
