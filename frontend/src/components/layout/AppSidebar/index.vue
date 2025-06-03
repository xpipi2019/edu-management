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
      <!-- 仪表盘 -->
      <el-menu-item index="/dashboard">
        <el-icon><House /></el-icon>
        <template #title>仪表盘</template>
      </el-menu-item>

      <!-- 系统管理 -->
      <el-sub-menu
        index="admin"
        v-if="isSuperAdmin"
      >
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </template>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/roles">
          <el-icon><UserFilled /></el-icon>
          <template #title>角色管理</template>
        </el-menu-item>
        <el-menu-item index="/admin/departments">
          <el-icon><OfficeBuilding /></el-icon>
          <template #title>部门管理</template>
        </el-menu-item>
      </el-sub-menu>

      <!-- 教务管理 -->
      <el-sub-menu
        index="academic"
        v-if="isSuperAdmin || isAcademicAdmin"
      >
        <template #title>
          <el-icon><Reading /></el-icon>
          <span>教务管理</span>
        </template>
        <el-menu-item index="/academic/courses">
          <el-icon><Document /></el-icon>
          <template #title>课程管理</template>
        </el-menu-item>
        <el-menu-item index="/academic/course-offerings">
          <el-icon><Postcard /></el-icon>
          <template #title>开课管理</template>
        </el-menu-item>
        <el-menu-item index="/academic/schedules">
          <el-icon><Calendar /></el-icon>
          <template #title>排课管理</template>
        </el-menu-item>
        <el-menu-item index="/academic/classrooms">
          <el-icon><OfficeBuilding /></el-icon>
          <template #title>教室管理</template>
        </el-menu-item>
        <el-menu-item index="/academic/student-status">
          <el-icon><School /></el-icon>
          <template #title>学籍管理</template>
        </el-menu-item>
        <el-menu-item index="/academic/reward-punishment">
          <el-icon><Trophy /></el-icon>
          <template #title>奖惩管理</template>
        </el-menu-item>
      </el-sub-menu>

      <!-- 教师功能 -->
      <el-sub-menu
        index="teacher"
        v-if="isTeacher"
      >
        <template #title>
          <el-icon><Avatar /></el-icon>
          <span>教师功能</span>
        </template>
        <el-menu-item index="/teacher/my-courses">
          <el-icon><Document /></el-icon>
          <template #title>我的课程</template>
        </el-menu-item>
        <el-menu-item index="/teacher/grades">
          <el-icon><EditPen /></el-icon>
          <template #title>成绩管理</template>
        </el-menu-item>
      </el-sub-menu>

      <!-- 学生功能 -->
      <el-sub-menu
        index="student"
        v-if="isStudent"
      >
        <template #title>
          <el-icon><User /></el-icon>
          <span>学生功能</span>
        </template>
        <el-menu-item index="/student/courses">
          <el-icon><Plus /></el-icon>
          <template #title>选课</template>
        </el-menu-item>
        <el-menu-item index="/student/grades">
          <el-icon><View /></el-icon>
          <template #title>成绩查询</template>
        </el-menu-item>
        <el-menu-item index="/student/profile">
          <el-icon><UserFilled /></el-icon>
          <template #title>个人信息</template>
        </el-menu-item>
      </el-sub-menu>
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
import { usePermission } from '@/composables/usePermission'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const appStore = useAppStore()
const { isTeacher, isStudent, isSuperAdmin, isAcademicAdmin } = usePermission()

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
