<template>
  <header class="app-header">
    <div class="header-left">
      <el-tooltip
        :content="appStore.sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
        placement="bottom"
      >
        <el-button
          link
          @click="toggleSidebar"
          class="sidebar-toggle"
        >
          <el-icon><Menu /></el-icon>
        </el-button>
      </el-tooltip>
      <h1 class="app-title">教务管理系统</h1>
    </div>

    <div class="header-right">
      <el-dropdown @command="handleCommand">
        <span class="user-info">
          <el-avatar :size="32" :src="userAvatar">
            {{ userInitial }}
          </el-avatar>
          <span class="username">{{ authStore.user?.real_name || '用户' }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人信息</el-dropdown-item>
            <el-dropdown-item command="settings">系统设置</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Menu, ArrowDown } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()
const { logout } = useAuth()

// 用户头像 - 新的数据库schema中没有avatar字段，使用默认头像
const userAvatar = computed(() => undefined)

// 用户名首字母
const userInitial = computed(() => {
  const name = authStore.user?.real_name || authStore.user?.username || 'U'
  return name.charAt(0).toUpperCase()
})

// 切换侧边栏
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

// 处理下拉菜单命令
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      await router.push('/profile')
      break
    case 'settings':
      await router.push('/settings')
      break
    case 'logout':
      await logout()
      break
    default:
      break
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  height: $header-height;
  background: $bg-white;
  border-bottom: 1px solid $border-light;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-lg;
  box-shadow: $box-shadow-base;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.sidebar-toggle {
  font-size: 18px;
  color: $text-regular;

  &:hover {
    color: $primary-color;
  }
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  cursor: pointer;
  padding: $spacing-sm;
  border-radius: $border-radius-base;
  transition: background-color 0.3s;

  &:hover {
    background-color: $bg-light;
  }
}

.username {
  font-size: 14px;
  color: $text-primary;
}
</style>
