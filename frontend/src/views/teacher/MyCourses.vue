<template>
  <div class="my-courses">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>我的课程</h2>
      <p>查看和管理我的开课情况</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #409eff20">
              <el-icon color="#409eff" size="24">
                <Document />
              </el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.totalCourses }}</div>
              <div class="stats-label">总课程数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #67c23a20">
              <el-icon color="#67c23a" size="24">
                <Reading />
              </el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.activeCourses }}</div>
              <div class="stats-label">进行中课程</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #e6a23c20">
              <el-icon color="#e6a23c" size="24">
                <User />
              </el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.totalStudents }}</div>
              <div class="stats-label">学生总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon" style="background: #f56c6c20">
              <el-icon color="#f56c6c" size="24">
                <Trophy />
              </el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ stats.completedCourses }}</div>
              <div class="stats-label">已完成课程</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索筛选 -->
    <el-card class="search-card" shadow="never">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="80px"
        class="search-form"
      >
        <el-form-item label="学期">
          <el-input
            v-model="searchForm.semester"
            placeholder="请输入学期"
            clearable
            style="width: 150px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已发布" value="PUBLISHED" />
            <el-option label="选课中" value="ENROLLMENT" />
            <el-option label="教学中" value="TEACHING" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 课程列表 -->
    <el-card class="table-card" shadow="never">
      <BaseTable
        :data="courseList"
        :loading="loading"
        :total="total"
        :page="queryParams.page"
        :page-size="queryParams.pageSize"
        @refresh="fetchMyCourses"
        @search="handleTableSearch"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        :show-add="false"
        :show-batch-delete="false"
      >
        <el-table-column prop="course" label="课程信息" min-width="200">
          <template #default="{ row }">
            <div>
              <div class="course-code">{{ row.course?.code }}</div>
              <div class="course-name">{{ row.course?.name }}</div>
              <div class="course-credits">{{ row.course?.credits }}学分 / {{ row.course?.hours }}学时</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="semester" label="学期" width="100" align="center" />

        <el-table-column prop="academicYear" label="学年" width="100" align="center" />

        <el-table-column prop="enrollment" label="选课情况" width="120" align="center">
          <template #default="{ row }">
            <div>
              <div :class="{ 'text-danger': row.currentStudents >= row.maxStudents }">
                {{ row.currentStudents }}/{{ row.maxStudents }}
              </div>
              <el-progress
                :percentage="getEnrollmentPercentage(row)"
                :color="getProgressColor(row)"
                :stroke-width="6"
                :show-text="false"
                style="margin-top: 4px"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="classroom" label="教室" width="120" align="center">
          <template #default="{ row }">
            {{ row.classroom || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="schedules" label="上课时间" min-width="200">
          <template #default="{ row }">
            <div v-if="row.schedules && row.schedules.length > 0">
              <el-tag
                v-for="schedule in row.schedules"
                :key="schedule.id"
                size="small"
                style="margin-right: 4px; margin-bottom: 4px"
              >
                周{{ getDayText(schedule.dayOfWeek) }} 第{{ schedule.startTime }}-{{ schedule.endTime }}节
              </el-tag>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getOfferingStatusColor(row.status)"
              size="small"
            >
              {{ getOfferingStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 自定义操作列 -->
        <template #actions="{ row }">
          <el-button
            type="primary"
            size="small"
            link
            @click="handleViewDetails(row)"
          >
            详情
          </el-button>

          <el-button
            v-if="row.status === 'ENROLLMENT' || row.status === 'TEACHING'"
            type="success"
            size="small"
            link
            @click="handleViewEnrollments(row)"
          >
            学生名单
          </el-button>

          <el-button
            v-if="row.status === 'TEACHING' || row.status === 'COMPLETED'"
            type="warning"
            size="small"
            link
            @click="handleGradeManagement(row)"
          >
            成绩管理
          </el-button>

          <el-button
            v-if="row.status === 'ENROLLMENT'"
            type="info"
            size="small"
            link
            @click="handleStartTeaching(row)"
          >
            开始教学
          </el-button>
        </template>
      </BaseTable>
    </el-card>

    <!-- 课程详情弹窗 -->
    <CourseDetailDialog
      v-model="showDetailDialog"
      :offering="currentOffering"
      :key="currentOffering?.offering_id || 'detail'"
    />

    <!-- 学生名单弹窗 -->
    <StudentListDialog
      v-model="showStudentDialog"
      :offering="currentOffering"
      :key="currentOffering?.offering_id || 'student'"
    />

    <!-- 成绩管理弹窗 -->
    <GradeManagementDialog
      v-model="showGradeDialog"
      :offering="currentOffering"
      :key="currentOffering?.offering_id || 'grade'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Document, Reading, User, Trophy } from '@element-plus/icons-vue'
import BaseTable from '@/components/common/BaseTable/index.vue'
import CourseDetailDialog from '@/views/teacher/components/CourseDetailDialog.vue'
import StudentListDialog from '@/views/teacher/components/StudentListDialog.vue'
import GradeManagementDialog from '@/views/teacher/components/GradeManagementDialog.vue'
import { courseOfferingApi } from '@/api/modules/course'
import { OfferingStatus } from '@/types/database'
import type {
  CourseOffering,
  CourseOfferingQuery
} from '@/types/database'

// 添加统计类型定义
interface TeacherCourseStats {
  totalCourses: number
  activeCourses: number
  completedCourses: number
  totalStudents: number
}

// 表单引用
const searchFormRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 课程列表数据
const courseList = ref<CourseOffering[]>([])
const total = ref(0)

// 统计数据
const stats = ref<TeacherCourseStats>({
  totalCourses: 0,
  activeCourses: 0,
  completedCourses: 0,
  totalStudents: 0
})

// 弹窗相关
const showDetailDialog = ref(false)
const showStudentDialog = ref(false)
const showGradeDialog = ref(false)
const currentOffering = ref<CourseOffering | null>(null)

// 搜索表单
const searchForm = reactive({
  semester: '',
  status: undefined as OfferingStatus | undefined
})

// 查询参数
const queryParams = reactive<CourseOfferingQuery>({
  page: 1,
  pageSize: 10,
  semester: '',
  status: undefined
})

// 工具函数
const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getDayText = (dayOfWeek: number): string => {
  const dayMap = ['', '一', '二', '三', '四', '五', '六', '日']
  return dayMap[dayOfWeek] || ''
}

const getOfferingStatusColor = (status: OfferingStatus) => {
  const colorMap: Record<number, string> = {
    [OfferingStatus.INACTIVE]: 'info',
    [OfferingStatus.ACTIVE]: 'success'
  }
  return colorMap[status] || 'info'
}

const getOfferingStatusText = (status: OfferingStatus) => {
  const textMap: Record<number, string> = {
    [OfferingStatus.INACTIVE]: '未开放',
    [OfferingStatus.ACTIVE]: '开放中'
  }
  return textMap[status] || '未知'
}

const getEnrollmentPercentage = (offering: CourseOffering): number => {
  return Math.round((offering.current_students / offering.max_students) * 100)
}

const getProgressColor = (offering: CourseOffering): string => {
  const percentage = getEnrollmentPercentage(offering)
  if (percentage >= 100) return '#f56c6c'
  if (percentage >= 80) return '#e6a23c'
  return '#67c23a'
}

// 数据获取函数
const fetchMyCourses = async () => {
  try {
    loading.value = true
    const response = await courseOfferingApi.getList()
    const courses = response.data.list || []

    // 模拟分页处理
    const page = queryParams.page || 1
    const pageSize = queryParams.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize
    courseList.value = courses.slice(start, end)
    total.value = courses.length
  } catch (error: any) {
    ElMessage.error(error.message || '获取我的课程失败')
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    // 模拟统计数据
    stats.value = {
      totalCourses: 8,
      activeCourses: 3,
      completedCourses: 5,
      totalStudents: 120
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 事件处理函数
const handleSearch = () => {
  Object.assign(queryParams, {
    page: 1,
    semester: searchForm.semester,
    status: searchForm.status
  })
  fetchMyCourses()
}

const handleReset = () => {
  searchFormRef.value?.resetFields()
  Object.assign(searchForm, {
    semester: '',
    status: undefined
  })
  Object.assign(queryParams, {
    page: 1,
    pageSize: 10,
    semester: '',
    status: undefined
  })
  fetchMyCourses()
}

const handleTableSearch = (keyword: string) => {
  queryParams.keyword = keyword
  queryParams.page = 1
  fetchMyCourses()
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchMyCourses()
}

const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.page = 1
  fetchMyCourses()
}

const handleViewDetails = (offering: CourseOffering) => {
  currentOffering.value = offering
  showDetailDialog.value = true
}

const handleViewEnrollments = (offering: CourseOffering) => {
  currentOffering.value = offering
  showStudentDialog.value = true
}

const handleGradeManagement = (offering: CourseOffering) => {
  currentOffering.value = offering
  showGradeDialog.value = true
}

const handleStartTeaching = async (offering: CourseOffering) => {
  try {
    await ElMessageBox.confirm(
      `确定要开始课程 "${offering.course?.course_name}" 的教学？`,
      '开始教学确认',
      {
        type: 'warning',
        confirmButtonText: '确定开始',
        cancelButtonText: '取消'
      }
    )

    await courseOfferingApi.update(offering.offering_id, { status: OfferingStatus.ACTIVE })
    ElMessage.success('开始教学成功')
    fetchMyCourses()
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '开始教学失败')
    }
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchMyCourses()
  fetchStats()
})
</script>

<style lang="scss" scoped>
.my-courses {
  padding: $spacing-lg;

  .page-header {
    margin-bottom: $spacing-xl;

    h2 {
      margin: 0 0 $spacing-sm 0;
      font-size: 24px;
      font-weight: 600;
      color: $text-primary;
    }

    p {
      margin: 0;
      color: $text-secondary;
      font-size: 14px;
    }
  }

  .stats-row {
    margin-bottom: $spacing-lg;
  }

  .stats-card {
    .stats-content {
      display: flex;
      align-items: center;
      padding: 10px 0;

      .stats-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
      }

      .stats-info {
        flex: 1;

        .stats-number {
          font-size: 24px;
          font-weight: 600;
          color: $text-primary;
          line-height: 1;
        }

        .stats-label {
          font-size: 12px;
          color: $text-secondary;
          margin-top: 4px;
        }
      }
    }
  }

  .search-card {
    margin-bottom: $spacing-lg;

    .search-form {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  .table-card {
    :deep(.el-card__body) {
      padding-top: 0;
    }
  }

  .course-code {
    font-weight: 600;
    color: $primary-color;
    font-size: 14px;
  }

  .course-name {
    color: $text-primary;
    margin: 4px 0 2px 0;
    font-size: 13px;
  }

  .course-credits {
    font-size: 12px;
    color: $text-secondary;
  }

  .text-danger {
    color: $danger-color;
    font-weight: 600;
  }
}
</style>
