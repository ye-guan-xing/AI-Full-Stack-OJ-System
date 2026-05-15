<template>
  <div class="not-found">
    <h1>404 - 页面不存在</h1>
    <p>您访问的页面不存在，请检查路径是否正确～</p>
    <router-link to="/" class="btn">返回首页</router-link>
  </div>
</template>

<script setup>
// 暂无业务逻辑
</script>

<style scoped>
.not-found {
  text-align: center;
  padding: 2rem 0;
}
</style>
