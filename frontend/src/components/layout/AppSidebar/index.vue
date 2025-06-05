<template>
  <aside class="app-sidebar" :class="{ collapsed: isCollapsed }">
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :collapse="isCollapsed"
      :unique-opened="true"
      :collapse-transition="true"
      router
    >
      <template v-for="menu in filteredMenus" :key="menu.title">
        <!-- 有子菜单的项目 -->
        <el-sub-menu
          v-if="menu.children && menu.children.length > 0"
          :index="menu.path || menu.title"
        >
          <template #title>
            <el-icon v-if="menu.icon">
              <component :is="getIconComponent(menu.icon)" />
            </el-icon>
            <span>{{ menu.title }}</span>
          </template>

          <template v-for="child in menu.children" :key="child.title">
            <el-menu-item
              v-if="child.path"
              :index="child.path"
            >
              <el-icon v-if="child.icon">
                <component :is="getIconComponent(child.icon)" />
              </el-icon>
              <template #title>{{ child.title }}</template>
            </el-menu-item>
          </template>
        </el-sub-menu>

        <!-- 没有子菜单的项目 -->
        <el-menu-item
          v-else-if="menu.path"
          :index="menu.path"
        >
          <el-icon v-if="menu.icon">
            <component :is="getIconComponent(menu.icon)" />
          </el-icon>
          <template #title>{{ menu.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  House,
  Setting,
  User,
  UserFilled,
  OfficeBuilding,
  Reading,
  Document,
  Calendar,
  Avatar,
  EditPen,
  Plus,
  View,
  Postcard,
  School,
  Trophy
} from '@element-plus/icons-vue'
import { useMenu } from '@/composables/useMenu'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const appStore = useAppStore()
const { filteredMenus } = useMenu()

// 图标组件映射
const iconComponents = {
  House,
  Setting,
  User,
  UserFilled,
  OfficeBuilding,
  Reading,
  Document,
  Calendar,
  Avatar,
  EditPen,
  Plus,
  View,
  Postcard,
  School,
  Trophy
}

// 获取图标组件
const getIconComponent = (iconName: string) => {
  return iconComponents[iconName as keyof typeof iconComponents] || Document
}

// 侧边栏是否折叠（从store获取）
const isCollapsed = computed(() => appStore.sidebarCollapsed)

// 当前激活的菜单
const activeMenu = computed(() => route.path)
</script>

<style lang="scss" scoped>
.app-sidebar {
  width: $sidebar-width;
  background: $bg-white;
  border-right: 1px solid $border-light;
  transition: width 0.3s;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }
}

.sidebar-menu {
  border-right: none;
  height: 100%;

  :deep(.el-menu-item) {
    height: 48px;
    line-height: 48px;

    &.is-active {
      background-color: rgba($primary-color, 0.1);
      color: $primary-color;

      &::before {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background-color: $primary-color;
      }
    }
  }

  :deep(.el-sub-menu__title) {
    height: 48px;
    line-height: 48px;
  }
}
</style>
