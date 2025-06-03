<template>
  <div class="course-offering-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>开课管理</h2>
      <p>管理系统中的开课申请和排课安排</p>
    </div>

    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="80px"
        class="search-form"
      >
        <div class="search-form-content">
          <div class="search-form-items">
            <el-form-item label="课程名称">
              <el-select
                v-model="searchForm.course_id"
                placeholder="请选择课程"
                clearable
                filterable
                style="width: 180px"
                :loading="coursesLoading"
              >
                <el-option
                  v-for="course in courseOptions"
                  :key="course.course_id"
                  :label="`${course.course_code} - ${course.course_name}`"
                  :value="course.course_id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="任课教师">
              <el-select
                v-model="searchForm.teacher_id"
                placeholder="请选择教师"
                clearable
                filterable
                style="width: 160px"
                :loading="teachersLoading"
              >
                <el-option
                  v-for="teacher in teacherOptions"
                  :key="teacher.teacher_id"
                  :label="teacher.real_name"
                  :value="teacher.teacher_id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="学期">
              <el-input
                v-model="searchForm.semester"
                placeholder="请输入学期"
                clearable
                style="width: 120px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>

            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
                style="width: 130px"
              >
                <el-option label="草稿" value="DRAFT" />
                <el-option label="已发布" value="PUBLISHED" />
                <el-option label="选课中" value="ENROLLMENT" />
                <el-option label="教学中" value="TEACHING" />
                <el-option label="已完成" value="COMPLETED" />
                <el-option label="已取消" value="CANCELLED" />
              </el-select>
            </el-form-item>
          </div>

          <div class="search-form-actions">
            <el-button type="primary" @click="handleSearch" :loading="loading">
              搜索
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 开课表格 -->
    <el-card class="table-card" shadow="never">
      <BaseTable
        :data="offeringList"
        :loading="loading"
        :total="total"
        :page="queryParams.page"
        :page-size="queryParams.pageSize"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
        @refresh="fetchOfferings"
        @search="handleTableSearch"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        add-text="新增"
      >
        <el-table-column prop="course" label="课程信息" min-width="200">
          <template #default="{ row }">
            <div>
              <div class="course-code">{{ row.course?.course_code }}</div>
              <div class="course-name">{{ row.course?.course_name }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="teacher" label="任课教师" width="120">
          <template #default="{ row }">
            {{ row.teacher?.user?.real_name || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="semester" label="学期" width="100" align="center" />

        <el-table-column prop="academic_year" label="学年" width="100" align="center" />

        <el-table-column prop="max_students" label="容量" width="80" align="center" />

        <el-table-column prop="current_students" label="已选" width="80" align="center">
          <template #default="{ row }">
            <span :class="{ 'text-danger': row.current_students >= row.max_students }">
              {{ row.current_students }}
            </span>
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
                周{{ getDayText(schedule.day_of_week) }} 第{{ schedule.start_time }}-{{ schedule.end_time }}节
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

        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>

        <!-- 自定义操作列 -->
        <template #actions="{ row }">
          <el-button
            type="primary"
            size="small"
            link
            @click="handleEdit(row)"
          >
            编辑
          </el-button>

          <el-button
            v-if="row.status === 'DRAFT'"
            type="success"
            size="small"
            link
            @click="handlePublish(row)"
          >
            发布
          </el-button>

          <el-button
            v-if="row.status === 'PUBLISHED'"
            type="warning"
            size="small"
            link
            @click="handleStartEnrollment(row)"
          >
            开放选课
          </el-button>

          <el-button
            type="info"
            size="small"
            link
            @click="handleViewEnrollments(row)"
          >
            选课名单
          </el-button>

          <el-button
            type="danger"
            size="small"
            link
            @click="handleDelete(row)"
            :disabled="['TEACHING', 'COMPLETED'].includes(row.status)"
          >
            删除
          </el-button>
        </template>
      </BaseTable>
    </el-card>

    <!-- 开课表单弹窗 -->
    <CourseOfferingForm
      v-model="showOfferingForm"
      :offering="currentOffering"
      :key="currentOffering?.offering_id || 'add'"
      @success="handleFormSuccess"
    />

    <!-- 选课名单弹窗 -->
    <EnrollmentDialog
      v-model="showEnrollmentDialog"
      :offering="currentOffering"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import BaseTable from '@/components/common/BaseTable/index.vue'
import CourseOfferingForm from './components/CourseOfferingForm.vue'
import EnrollmentDialog from './components/EnrollmentDialog.vue'
import { courseOfferingApi, courseApi } from '@/api/modules/course'
import { teacherApi } from '@/api/modules/teacher'
import type {
  CourseOffering,
  Course,
  CourseOfferingQuery,
  TeacherInfo
} from '@/types/database'
import { OfferingStatus } from '@/types/database'

// 接口定义
interface Schedule {
  schedule_id: number
  day_of_week: number
  start_time: string
  end_time: string
  classroom?: {
    room_no: string
    building: string
  }
  weeks: string
}

// 表单引用
const searchFormRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)
const coursesLoading = ref(false)
const teachersLoading = ref(false)

// 开课列表数据
const offeringList = ref<CourseOffering[]>([])
const total = ref(0)

// 选项数据
const courseOptions = ref<Course[]>([])
const teacherOptions = ref<TeacherInfo[]>([])

// 弹窗相关
const showOfferingForm = ref(false)
const showEnrollmentDialog = ref(false)
const currentOffering = ref<CourseOffering | null>(null)

// 搜索表单
const searchForm = reactive({
  course_id: undefined as number | undefined,
  teacher_id: undefined as number | undefined,
  semester: '',
  status: undefined as OfferingStatus | undefined
})

// 查询参数
const queryParams = reactive<CourseOfferingQuery>({
  page: 1,
  pageSize: 10,
  course_id: undefined,
  teacher_id: undefined,
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
  const colorMap = {
    [OfferingStatus.INACTIVE]: 'danger',
    [OfferingStatus.ACTIVE]: 'success'
  }
  return colorMap[status] || 'info'
}

const getOfferingStatusText = (status: OfferingStatus) => {
  const textMap = {
    [OfferingStatus.INACTIVE]: '停用',
    [OfferingStatus.ACTIVE]: '开放'
  }
  return textMap[status] || '未知'
}

// 数据获取函数
const fetchOfferings = async () => {
  try {
    loading.value = true
    const response = await courseOfferingApi.getList(queryParams)

    offeringList.value = response.data.list
    total.value = response.data.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取开课列表失败')
  } finally {
    loading.value = false
  }
}

const fetchCourses = async () => {
  try {
    coursesLoading.value = true
    const response = await courseApi.getAll()
    courseOptions.value = response.data
  } catch (error) {
    console.error('获取课程列表失败:', error)
  } finally {
    coursesLoading.value = false
  }
}

const fetchTeachers = async () => {
  try {
    teachersLoading.value = true
    const response = await teacherApi.getInfoList()
    teacherOptions.value = response.data.list
  } catch (error) {
    console.error('获取教师列表失败:', error)
  } finally {
    teachersLoading.value = false
  }
}

// 事件处理函数
const handleSearch = () => {
  Object.assign(queryParams, {
    page: 1,
    course_id: searchForm.course_id,
    teacher_id: searchForm.teacher_id,
    semester: searchForm.semester,
    status: searchForm.status
  })
  fetchOfferings()
}

const handleReset = () => {
  searchFormRef.value?.resetFields()
  Object.assign(searchForm, {
    course_id: undefined,
    teacher_id: undefined,
    semester: '',
    status: undefined
  })
  Object.assign(queryParams, {
    page: 1,
    pageSize: 10,
    course_id: undefined,
    teacher_id: undefined,
    semester: '',
    status: undefined
  })
  fetchOfferings()
}

const handleTableSearch = (keyword: string) => {
  queryParams.keyword = keyword
  queryParams.page = 1
  fetchOfferings()
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchOfferings()
}

const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.page = 1
  fetchOfferings()
}

const handleAdd = () => {
  currentOffering.value = null
  showOfferingForm.value = true
}

const handleEdit = (offering: CourseOffering) => {
  currentOffering.value = offering
  showOfferingForm.value = true
}

const handleDelete = async (offering: CourseOffering) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除开课 "${offering.course?.course_name}"？此操作不可恢复。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )

    await courseOfferingApi.delete(offering.offering_id)
    ElMessage.success('删除开课成功')
    fetchOfferings()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除开课失败')
    }
  }
}

const handlePublish = async (offering: CourseOffering) => {
  try {
    await ElMessageBox.confirm(
      `确定要发布开课 "${offering.course?.course_name}"？`,
      '发布确认',
      {
        type: 'warning',
        confirmButtonText: '确定发布',
        cancelButtonText: '取消'
      }
    )

    await courseOfferingApi.update(offering.offering_id, { status: OfferingStatus.ACTIVE })
    ElMessage.success('发布开课成功')
    fetchOfferings()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '发布开课失败')
    }
  }
}

const handleStartEnrollment = async (offering: CourseOffering) => {
  try {
    await ElMessageBox.confirm(
      `确定要开放课程 "${offering.course?.course_name}" 的选课？`,
      '开放选课确认',
      {
        type: 'warning',
        confirmButtonText: '确定开放',
        cancelButtonText: '取消'
      }
    )

    await courseOfferingApi.update(offering.offering_id, { status: OfferingStatus.ACTIVE })
    ElMessage.success('开放选课成功')
    fetchOfferings()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '开放选课失败')
    }
  }
}

const handleViewEnrollments = (offering: CourseOffering) => {
  currentOffering.value = offering
  showEnrollmentDialog.value = true
}

const handleFormSuccess = () => {
  fetchOfferings()
}

// 页面加载时获取数据
onMounted(() => {
  fetchOfferings()
  fetchCourses()
  fetchTeachers()
})
</script>

<style lang="scss" scoped>
.course-offering-management {
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

  .search-card {
    margin-bottom: $spacing-lg;

    .search-form {
      .search-form-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        min-height: 40px;
      }

      .search-form-items {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        flex: 1;

        .el-form-item {
          margin-bottom: 0;
          margin-right: $spacing-md;
          flex-shrink: 0;
        }
      }

      .search-form-actions {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        flex-shrink: 0;
        min-width: 140px;
      }

      // 响应式处理
      @media (max-width: 1200px) {
        .search-form-content {
          flex-direction: column;
          align-items: stretch;
        }

        .search-form-items {
          margin-bottom: $spacing-md;
        }

        .search-form-actions {
          justify-content: flex-end;
        }
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
  }

  .course-name {
    font-size: 12px;
    color: $text-secondary;
    margin-top: 2px;
  }

  .text-danger {
    color: $danger-color;
    font-weight: 600;
  }
}
</style>
