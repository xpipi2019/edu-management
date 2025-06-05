<template>
  <el-breadcrumb class="breadcrumb" separator="/">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbItems"
      :key="item.title"
      :to="item.path && index < breadcrumbItems.length - 1 ? item.path : undefined"
    >
      <el-icon v-if="item.icon && index === 0">
        <component :is="getIconComponent(item.icon)" />
      </el-icon>
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
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

const route = useRoute()
const { getMenuPath } = useMenu()

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

// 面包屑项目
const breadcrumbItems = computed(() => {
  const menuPath = getMenuPath(route.path)

  // 如果路径为根路径或仪表盘，只显示当前页面
  if (route.path === '/' || route.path === '/dashboard') {
    return [{ title: '仪表盘', icon: 'House', path: '/dashboard' }]
  }

  // 如果找不到菜单路径，使用路由元信息
  if (menuPath.length === 0 && route.meta.title) {
    return [
      { title: '仪表盘', icon: 'House', path: '/dashboard' },
      { title: route.meta.title as string, path: route.path }
    ]
  }

  return menuPath
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.breadcrumb {
  margin-bottom: 16px;

  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: normal;
      color: $text-regular;

      &:hover {
        color: $primary-color;
      }
    }

    &:last-child {
      .el-breadcrumb__inner {
        color: $text-primary;
        cursor: default;

        &:hover {
          color: $text-primary;
        }
      }
    }
  }
}
</style>
