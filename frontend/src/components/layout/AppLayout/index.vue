<!--
  @fileoverview 教育管理系统前端应用主布局组件
  @description 应用的主要布局结构，包含头部、侧边栏和主内容区域
  @author XPIPI
  @version 1.0.0
  @date 2025-06-09
  @license MIT
  @copyright © 2025 XPIPI. All rights reserved.
-->

<template>
  <div class="app-container">
    <AppHeader />
    <div class="app-main">
      <AppSidebar />
      <main class="main-content">
        <div class="content-header">
          <Breadcrumb />
        </div>
        <div class="content-body">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '../AppHeader/index.vue'
import AppSidebar from '../AppSidebar/index.vue'
import Breadcrumb from '@/components/common/Breadcrumb/index.vue'
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

.content-header {
  padding: 16px 24px 0;
  background-color: $bg-white;
  border-bottom: 1px solid $border-light;
}

.content-body {
  padding: 24px;
}
</style>
