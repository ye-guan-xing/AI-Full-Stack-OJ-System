<template>
  <div class="home-page">
    <div class="hero">
      <h1>欢迎使用在线编程评测平台</h1>
      <p>提升算法能力，从这里开始</p>
      <el-button type="primary" size="large" @click="$router.push('/problems')">
        开始刷题
      </el-button>
    </div>
  </div>
</template>

<script setup>
// 首页逻辑
</script>

<style scoped>
.home-page {
  padding: 40px 20px;
  text-align: center;
}

.hero {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 36px;
  color: #333;
  margin-bottom: 20px;
}

p {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}
</style>
