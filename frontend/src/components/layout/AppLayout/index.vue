<template>
  <div class="app-container">
    <AppHeader />
    <div class="app-main">
      <AppSidebar />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '../AppHeader/index.vue'
import AppSidebar from '../AppSidebar/index.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // 初始化认证状态
  authStore.initAuth()
})
</script>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: auto;
  background-color: $bg-page;
}
</style>
