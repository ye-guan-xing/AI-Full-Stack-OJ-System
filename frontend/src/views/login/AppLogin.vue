<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>OJ平台登录</h2>
        <p>欢迎回来，请登录您的账号</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="formData"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
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
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            size="large"
            class="login-btn"
            @click="handleLogin"
          >
            {{ loading ? "登录中..." : "登录" }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>还没有账号？<a href="#" @click="handleRegister">立即注册</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";

const router = useRouter();
const route = useRoute();
const store = useStore();

const loading = ref(false);
const formData = reactive({
  username: "",
  password: "",
});
const loginFormRef = ref(null);

const loginRules = {
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
};

const handleLogin = async () => {
  if (loading.value) return;
  try {
    loading.value = true;
    await loginFormRef.value.validate();
    // 1. 登录
    await store.dispatch("user/login", {
      username: formData.username,
      password: formData.password,
    });
    // 2. 关键：登录后调用getInfo，获取包含roles的完整用户信息！
    // console.log(formData.username, formData.password);
    const userInfo = await store.dispatch("user/getInfo");
    ElMessage.success(`登录成功，欢迎您，${userInfo.username}！`);
    const redirect = route.query.redirect || "/home";
    router.push(redirect);
  } catch (error) {
    ElMessage.error(error.message || "登录失败，请检查用户名和密码");
  } finally {
    loading.value = false;
  }
};

const handleRegister = () => {
  router.push("/register");
};
</script>

<style scoped>
@import "@/assets/styles/Applogin.css";
</style>
