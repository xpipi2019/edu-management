<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>仪表盘</h1>
      <p>欢迎使用教务管理系统</p>
    </div>

    <div class="dashboard-content">
      <!-- 只有管理员可以看到系统统计 -->
      <div v-if="isAdmin" class="system-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <h3>活跃用户</h3>
                <p class="stat-number">{{ stats.activeUsers || 0 }}</p>
              </div>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <h3>活跃课程</h3>
                <p class="stat-number">{{ stats.activeCourses || 0 }}</p>
              </div>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon><Avatar /></el-icon>
              </div>
              <div class="stat-info">
                <h3>活跃教师</h3>
                <p class="stat-number">{{ stats.activeTeachers || 0 }}</p>
              </div>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="stat-info">
                <h3>学生总数</h3>
                <p class="stat-number">{{ stats.totalStudents || 0 }}</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-row :gutter="20" :style="{ marginTop: isAdmin ? '20px' : '0' }">
        <el-col :span="12">
          <el-card header="最近通知">
            <div class="notice-list">
              <div class="notice-item">
                <h4>关于期末考试安排的通知</h4>
                <p>2024年春季学期期末考试将于6月15日开始...</p>
                <span class="notice-time">2024-05-20</span>
              </div>
              <div class="notice-item">
                <h4>选课系统维护通知</h4>
                <p>选课系统将于本周六进行维护升级...</p>
                <span class="notice-time">2024-05-18</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card header="快捷操作">
            <div class="quick-actions">
              <el-button v-if="isAdmin" type="primary" @click="$router.push('/admin/users')">
                用户管理
              </el-button>
              <el-button v-if="isAdmin || isTeacher" type="success" @click="$router.push('/academic/courses')">
                课程管理
              </el-button>
              <el-button v-if="isAdmin || isTeacher" type="warning" @click="$router.push('/academic/schedules')">
                排课管理
              </el-button>
              <el-button type="info" @click="$router.push('/student/grades')">
                成绩查询
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { User, Document, Avatar, UserFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { statisticsApi } from '@/api/modules/statistics'
import type { SystemOverview } from '@/api/modules/statistics'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()

// 权限判断
const isAdmin = computed(() => authStore.hasRole('admin'))
const isTeacher = computed(() => authStore.hasRole('teacher'))
const isStudent = computed(() => authStore.hasRole('student'))

// 统计数据
const stats = ref<SystemOverview>({
  activeUsers: 0,
  totalStudents: 0,
  activeTeachers: 0,
  activeCourses: 0,
  currentOfferings: 0,
  totalEnrollments: 0
})

// 获取统计数据
const fetchStats = async () => {
  if (!isAdmin.value) return

  try {
    const response = await statisticsApi.getSystemOverview()
    if (response.code === 0) {
      stats.value = response.data
    } else {
      ElMessage.error(response.message || '获取统计数据失败')
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style lang="scss" scoped>
.dashboard {
  padding: $spacing-lg;
}

.dashboard-header {
  margin-bottom: $spacing-xl;

  h1 {
    font-size: 28px;
    color: $text-primary;
    margin: 0 0 $spacing-sm 0;
  }

  p {
    color: $text-secondary;
    margin: 0;
  }
}

.stat-card {
  background: $bg-white;
  border-radius: $border-radius-base;
  padding: $spacing-lg;
  box-shadow: $box-shadow-base;
  display: flex;
  align-items: center;
  gap: $spacing-md;

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba($primary-color, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;

    .el-icon {
      font-size: 24px;
      color: $primary-color;
    }
  }

  .stat-info {
    flex: 1;

    h3 {
      font-size: 14px;
      color: $text-secondary;
      margin: 0 0 $spacing-xs 0;
    }

    .stat-number {
      font-size: 24px;
      font-weight: 600;
      color: $text-primary;
      margin: 0;
    }
  }
}

.notice-list {
  .notice-item {
    padding: $spacing-md 0;
    border-bottom: 1px solid $border-lighter;

    &:last-child {
      border-bottom: none;
    }

    h4 {
      font-size: 14px;
      color: $text-primary;
      margin: 0 0 $spacing-xs 0;
    }

    p {
      font-size: 12px;
      color: $text-secondary;
      margin: 0 0 $spacing-xs 0;
      line-height: 1.4;
    }

    .notice-time {
      font-size: 12px;
      color: $text-placeholder;
    }
  }
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md;

  .el-button {
    flex: 1;
    min-width: 120px;
  }
}
</style>
