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
                v-model="searchForm.name"
                placeholder="请输入课程名称"
                clearable
                style="width: 180px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>

            <el-form-item label="课程代码">
              <el-input
                v-model="searchForm.code"
                placeholder="请输入课程代码"
                clearable
                style="width: 180px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>

            <el-form-item label="课程类型">
              <el-select
                v-model="searchForm.type"
                placeholder="请选择课程类型"
                clearable
                style="width: 140px"
              >
                <el-option label="必修课" :value="CourseType.REQUIRED" />
                <el-option label="选修课" :value="CourseType.ELECTIVE" />
                <el-option label="公共课" :value="CourseType.PUBLIC" />
                <el-option label="专业课" :value="CourseType.PROFESSIONAL" />
              </el-select>
            </el-form-item>

            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
                style="width: 130px"
              >
                <el-option label="草稿" :value="CourseStatus.DRAFT" />
                <el-option label="已发布" :value="CourseStatus.PUBLISHED" />
                <el-option label="已归档" :value="CourseStatus.ARCHIVED" />
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
        :total="total"
        :page="queryParams.page"
        :page-size="queryParams.pageSize"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
        @refresh="fetchCourses"
        @search="handleTableSearch"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        add-text="新增"
      >
        <el-table-column prop="code" label="课程代码" min-width="120" />

        <el-table-column prop="name" label="课程名称" min-width="200" />

        <el-table-column prop="type" label="课程类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getCourseTypeColor(row.type)"
              size="small"
            >
              {{ getCourseTypeText(row.type) }}
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

        <el-table-column prop="prerequisites" label="先修课程" min-width="150">
          <template #default="{ row }">
            <el-tag
              v-for="prerequisite in row.prerequisites"
              :key="prerequisite.id"
              size="small"
              style="margin-right: 4px"
            >
              {{ prerequisite.name }}
            </el-tag>
            <span v-if="!row.prerequisites || row.prerequisites.length === 0">-</span>
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
            v-if="row.status === CourseStatus.DRAFT"
            type="success"
            size="small"
            link
            @click="handlePublish(row)"
          >
            发布
          </el-button>

          <el-button
            v-else-if="row.status === CourseStatus.PUBLISHED"
            type="warning"
            size="small"
            link
            @click="handleArchive(row)"
          >
            归档
          </el-button>

          <el-button
            type="danger"
            size="small"
            link
            @click="handleDelete(row)"
            :disabled="row.status === CourseStatus.PUBLISHED"
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
import type { Course, CourseQuery } from '@/types/course'
import { CourseType, CourseStatus } from '@/types/course'

// 表单引用
const searchFormRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 课程列表数据
const courseList = ref<Course[]>([])
const total = ref(0)

// 弹窗相关
const showCourseForm = ref(false)
const currentCourse = ref<Course | null>(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  type: undefined as CourseType | undefined,
  status: undefined as CourseStatus | undefined,
  credits: undefined as number | undefined
})

// 查询参数
const queryParams = reactive<CourseQuery>({
  page: 1,
  pageSize: 10,
  name: '',
  code: '',
  type: undefined,
  status: undefined,
  credits: undefined
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
    [CourseType.PUBLIC]: 'success',
    [CourseType.PROFESSIONAL]: 'warning'
  }
  return colorMap[type] || 'info'
}

// 获取课程类型文本
const getCourseTypeText = (type: CourseType) => {
  const textMap = {
    [CourseType.REQUIRED]: '必修课',
    [CourseType.ELECTIVE]: '选修课',
    [CourseType.PUBLIC]: '公共课',
    [CourseType.PROFESSIONAL]: '专业课'
  }
  return textMap[type] || '未知'
}

// 获取课程状态颜色
const getCourseStatusColor = (status: CourseStatus) => {
  const colorMap = {
    [CourseStatus.DRAFT]: 'info',
    [CourseStatus.PUBLISHED]: 'success',
    [CourseStatus.ARCHIVED]: 'warning'
  }
  return colorMap[status] || 'info'
}

// 获取课程状态文本
const getCourseStatusText = (status: CourseStatus) => {
  const textMap = {
    [CourseStatus.DRAFT]: '草稿',
    [CourseStatus.PUBLISHED]: '已发布',
    [CourseStatus.ARCHIVED]: '已归档'
  }
  return textMap[status] || '未知'
}

// 获取课程列表
const fetchCourses = async () => {
  try {
    loading.value = true
    const response = await courseApi.getCourses(queryParams)
    courseList.value = response.list
    total.value = response.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取课程列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  Object.assign(queryParams, {
    page: 1,
    name: searchForm.name,
    code: searchForm.code,
    type: searchForm.type,
    status: searchForm.status,
    credits: searchForm.credits
  })
  fetchCourses()
}

// 处理重置
const handleReset = () => {
  searchFormRef.value?.resetFields()
  Object.assign(searchForm, {
    name: '',
    code: '',
    type: undefined,
    status: undefined,
    credits: undefined
  })
  Object.assign(queryParams, {
    page: 1,
    pageSize: 10,
    name: '',
    code: '',
    type: undefined,
    status: undefined,
    credits: undefined
  })
  fetchCourses()
}

// 处理表格搜索
const handleTableSearch = (keyword: string) => {
  queryParams.keyword = keyword
  queryParams.page = 1
  fetchCourses()
}

// 处理页码变化
const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchCourses()
}

// 处理页大小变化
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.page = 1
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
      `确定要删除课程 "${course.name}"？此操作不可恢复。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )

    await courseApi.deleteCourse(course.id)
    ElMessage.success('删除课程成功')
    fetchCourses()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除课程失败')
    }
  }
}

// 处理发布课程
const handlePublish = async (course: Course) => {
  try {
    await ElMessageBox.confirm(
      `确定要发布课程 "${course.name}"？发布后课程将对学生可见。`,
      '发布确认',
      {
        type: 'warning',
        confirmButtonText: '确定发布',
        cancelButtonText: '取消'
      }
    )

    await courseApi.updateCourse(course.id, { status: CourseStatus.PUBLISHED })
    ElMessage.success('发布课程成功')
    fetchCourses()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '发布课程失败')
    }
  }
}

// 处理归档课程
const handleArchive = async (course: Course) => {
  try {
    await ElMessageBox.confirm(
      `确定要归档课程 "${course.name}"？归档后课程将不再对学生可见。`,
      '归档确认',
      {
        type: 'warning',
        confirmButtonText: '确定归档',
        cancelButtonText: '取消'
      }
    )

    await courseApi.updateCourse(course.id, { status: CourseStatus.ARCHIVED })
    ElMessage.success('归档课程成功')
    fetchCourses()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '归档课程失败')
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
