<template>
  <div class="course-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>课程管理</h2>
      <p>管理系统中的所有课程信息</p>
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
              <el-input
                v-model="searchForm.course_name"
                placeholder="请输入课程名称"
                clearable
                style="width: 180px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>

            <el-form-item label="课程代码">
              <el-input
                v-model="searchForm.course_code"
                placeholder="请输入课程代码"
                clearable
                style="width: 180px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>

            <el-form-item label="课程类型">
              <el-select
                v-model="searchForm.course_type"
                placeholder="请选择课程类型"
                clearable
                style="width: 140px"
              >
                <el-option label="必修" :value="CourseType.REQUIRED" />
                <el-option label="选修" :value="CourseType.ELECTIVE" />
                <el-option label="公选" :value="CourseType.PUBLIC_ELECTIVE" />
              </el-select>
            </el-form-item>

            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
                style="width: 130px"
              >
                <el-option label="停用" :value="CourseStatus.INACTIVE" />
                <el-option label="启用" :value="CourseStatus.ACTIVE" />
              </el-select>
            </el-form-item>

            <el-form-item label="学分">
              <el-input-number
                v-model="searchForm.credits"
                :min="0"
                :max="20"
                controls-position="right"
                style="width: 110px"
              />
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

    <!-- 课程表格 -->
    <el-card class="table-card" shadow="never">
      <BaseTable
        :data="courseList"
        :loading="loading"
        :total="pagination.total"
        :page="pagination.page"
        :page-size="pagination.pageSize"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
        @refresh="fetchCourses"
        @search="handleTableSearch"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        add-text="新增"
      >
        <el-table-column prop="course_code" label="课程代码" min-width="120" />

        <el-table-column prop="course_name" label="课程名称" min-width="200" />

        <el-table-column prop="course_type" label="课程类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getCourseTypeColor(row.course_type)"
              size="small"
            >
              {{ getCourseTypeText(row.course_type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="credits" label="学分" width="80" align="center" />

        <el-table-column prop="hours" label="学时" width="80" align="center" />

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getCourseStatusColor(row.status)"
              size="small"
            >
              {{ getCourseStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="课程描述" min-width="150">
          <template #default="{ row }">
            <span>{{ row.description || '-' }}</span>
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
            v-if="row.status === CourseStatus.INACTIVE"
            type="success"
            size="small"
            link
            @click="handleActivate(row)"
          >
            启用
          </el-button>

          <el-button
            v-else-if="row.status === CourseStatus.ACTIVE"
            type="warning"
            size="small"
            link
            @click="handleDeactivate(row)"
          >
            停用
          </el-button>

          <el-button
            type="danger"
            size="small"
            link
            @click="handleDelete(row)"
            :disabled="row.status === CourseStatus.ACTIVE"
          >
            删除
          </el-button>
        </template>
      </BaseTable>
    </el-card>

    <!-- 课程表单弹窗 -->
    <CourseForm
      v-model="showCourseForm"
      :course="currentCourse"
      :key="currentCourse?.course_id || 'add'"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import BaseTable from '@/components/common/BaseTable/index.vue'
import CourseForm from './components/CourseForm.vue'
import { courseApi } from '@/api/modules/course'
import type { Course, CourseQuery } from '@/types/database'
import { CourseType, CourseStatus } from '@/types/database'

// 表单引用
const searchFormRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 课程列表数据
const courseList = ref<Course[]>([])

// 弹窗相关
const showCourseForm = ref(false)
const currentCourse = ref<Course | null>(null)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  course_name: '',
  course_code: '',
  course_type: undefined as CourseType | undefined,
  status: undefined as CourseStatus | undefined,
  credits: undefined as number | undefined
})

// 格式化日期时间函数
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

// 获取课程类型颜色
const getCourseTypeColor = (type: CourseType) => {
  const colorMap = {
    [CourseType.REQUIRED]: 'danger',
    [CourseType.ELECTIVE]: 'primary',
    [CourseType.PUBLIC_ELECTIVE]: 'success'
  }
  return colorMap[type] || 'info'
}

// 获取课程类型文本
const getCourseTypeText = (type: CourseType) => {
  return type || '未知'
}

// 获取课程状态颜色
const getCourseStatusColor = (status: CourseStatus) => {
  const colorMap = {
    [CourseStatus.INACTIVE]: 'danger',
    [CourseStatus.ACTIVE]: 'success'
  }
  return colorMap[status] || 'info'
}

// 获取课程状态文本
const getCourseStatusText = (status: CourseStatus) => {
  const textMap = {
    [CourseStatus.INACTIVE]: '停用',
    [CourseStatus.ACTIVE]: '启用'
  }
  return textMap[status] || '未知'
}

// 获取课程列表
const fetchCourses = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      course_name: searchForm.course_name,
      course_code: searchForm.course_code,
      course_type: searchForm.course_type,
      status: searchForm.status
    }
    const response = await courseApi.getList(params)
    courseList.value = response.data.list
    pagination.total = response.data.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取课程列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.page = 1
  fetchCourses()
}

// 处理重置
const handleReset = () => {
  searchFormRef.value?.resetFields()
  Object.assign(searchForm, {
    course_name: '',
    course_code: '',
    course_type: undefined,
    status: undefined,
    credits: undefined
  })
  pagination.page = 1
  fetchCourses()
}

// 处理表格搜索
const handleTableSearch = (keyword: string) => {
  searchForm.course_name = keyword
  pagination.page = 1
  fetchCourses()
}

// 处理页码变化
const handlePageChange = (page: number) => {
  pagination.page = page
  fetchCourses()
}

// 处理页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchCourses()
}

// 处理新增
const handleAdd = () => {
  currentCourse.value = null
  showCourseForm.value = true
}

// 处理编辑
const handleEdit = (course: Course) => {
  currentCourse.value = course
  showCourseForm.value = true
}

// 处理删除
const handleDelete = async (course: Course) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课程 "${course.course_name}"？此操作不可恢复。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )

    await courseApi.delete(course.course_id)
    ElMessage.success('删除课程成功')
    fetchCourses()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除课程失败')
    }
  }
}

// 处理启用课程
const handleActivate = async (course: Course) => {
  try {
    await ElMessageBox.confirm(
      `确定要启用课程 "${course.course_name}"？启用后课程将对学生可见。`,
      '启用确认',
      {
        type: 'warning',
        confirmButtonText: '确定启用',
        cancelButtonText: '取消'
      }
    )

    await courseApi.update(course.course_id, { status: CourseStatus.ACTIVE })
    ElMessage.success('启用课程成功')
    fetchCourses()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '启用课程失败')
    }
  }
}

// 处理停用课程
const handleDeactivate = async (course: Course) => {
  try {
    await ElMessageBox.confirm(
      `确定要停用课程 "${course.course_name}"？停用后课程将不再对学生可见。`,
      '停用确认',
      {
        type: 'warning',
        confirmButtonText: '确定停用',
        cancelButtonText: '取消'
      }
    )

    await courseApi.update(course.course_id, { status: CourseStatus.INACTIVE })
    ElMessage.success('停用课程成功')
    fetchCourses()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '停用课程失败')
    }
  }
}

// 处理表单提交成功
const handleFormSuccess = () => {
  fetchCourses()
}

// 页面加载时获取数据
onMounted(() => {
  fetchCourses()
})
</script>

<style lang="scss" scoped>
.course-management {
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
}
</style>
