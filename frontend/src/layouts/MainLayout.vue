<!-- src/layouts/MainLayout.vue -->
<script setup>
import AppNavbar from "@/components/common/AppNavbar.vue";
import AppFooter from "@/components/common/AppFooter.vue";
</script>

<template>
  <div class="main-layout">
    <AppNavbar />
    <!-- 子路由内容会渲染到这里 -->
    <main class="content">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
  padding: 20px;
}
</style>
