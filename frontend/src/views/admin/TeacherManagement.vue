<template>
  <div class="teacher-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>教师管理</h2>
      <p>管理系统中的所有教师信息</p>
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
        <el-form-item label="教师工号">
          <el-input
            v-model="searchForm.teacher_no"
            placeholder="请输入教师工号"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.real_name"
            placeholder="请输入姓名"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="所属部门">
          <el-select
            v-model="searchForm.dept_id"
            placeholder="请选择部门"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="dept in departmentOptions"
              :key="dept.dept_id"
              :label="dept.dept_name"
              :value="dept.dept_id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="职称">
          <el-select
            v-model="searchForm.title"
            placeholder="请选择职称"
            clearable
            style="width: 150px"
          >
            <el-option label="教授" value="教授" />
            <el-option label="副教授" value="副教授" />
            <el-option label="讲师" value="讲师" />
            <el-option label="助教" value="助教" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="在职" :value="1" />
            <el-option label="离职" :value="0" />
            <el-option label="休假" :value="2" />
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

    <!-- 教师表格 -->
    <el-card class="table-card" shadow="never">
      <BaseTable
        :data="dataList"
        :loading="loading"
        :total="total"
        :page="queryParams.page"
        :page-size="queryParams.pageSize"
        add-text="新增教师"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
        @batch-delete="handleBatchDelete"
        @refresh="refresh"
        @search="handleTableSearch"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <el-table-column prop="teacher_no" label="教师工号" min-width="120" />

        <el-table-column prop="real_name" label="姓名" min-width="100" />

        <el-table-column prop="dept_name" label="所属部门" min-width="150">
          <template #default="{ row }">
            {{ row.department?.dept_name || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="title" label="职称" min-width="100">
          <template #default="{ row }">
            {{ row.title || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="email" label="邮箱" min-width="180">
          <template #default="{ row }">
            {{ row.user?.email || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="手机号" min-width="130">
          <template #default="{ row }">
            {{ row.user?.phone || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="hire_date" label="入职日期" width="120">
          <template #default="{ row }">
            {{ row.hire_date ? formatDate(row.hire_date) : '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getTeacherStatusTagType(row.status)"
              size="small"
            >
              {{ getTeacherStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="user.status" label="账户状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getUserStatusTagType(row.user?.status)"
              size="small"
            >
              {{ getUserStatusText(row.user?.status) }}
            </el-tag>
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
            :type="row.user?.status === 1 ? 'warning' : 'success'"
            size="small"
            link
            @click="handleToggleStatus(row)"
          >
            {{ row.user?.status === 1 ? '禁用' : '启用' }}
          </el-button>

          <el-button
            type="info"
            size="small"
            link
            @click="handleResetPassword(row)"
          >
            重置密码
          </el-button>

          <el-button
            type="danger"
            size="small"
            link
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </BaseTable>
    </el-card>

    <!-- 教师表单弹窗 -->
    <TeacherForm
      v-model="showTeacherForm"
      :teacher="currentTeacher"
      :key="currentTeacher?.teacher_id || 'add'"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import BaseTable from '@/components/common/BaseTable/index.vue'
import TeacherForm from './components/TeacherForm.vue'
import { teacherApi } from '@/api/modules/teacher'
import { departmentApi } from '@/api/modules/department'
import { userApi } from '@/api/modules/user'
import type { Teacher, Department, TeacherQuery } from '@/types/database'
import { TeacherStatus, UserStatus } from '@/types/database'
import { formatDate } from '@/utils/format'

// 类型定义
interface TeacherWithId extends Teacher {
  id: number
  name: string
  real_name: string
  dept_name?: string
}

// 部门选项
const departmentOptions = ref<Department[]>([])

// 弹窗相关
const showTeacherForm = ref(false)
const currentTeacher = ref<Teacher | null>(null)

// 数据状态
const loading = ref(false)
const dataList = ref<TeacherWithId[]>([])
const total = ref(0)

// 表单引用
const searchFormRef = ref()

// 查询参数
const queryParams = reactive<TeacherQuery>({
  page: 1,
  pageSize: 10,
  teacher_no: '',
  real_name: '',
  dept_id: undefined,
  title: '',
  status: undefined
})

// 搜索表单
const searchForm = reactive({
  teacher_no: '',
  real_name: '',
  dept_id: undefined as number | undefined,
  title: '',
  status: undefined as number | undefined
})

// 获取部门列表
const fetchDepartments = async () => {
  try {
    const response = await departmentApi.getAll()
    departmentOptions.value = response.data
  } catch (error) {
    ElMessage.error('获取部门列表失败')
    console.error('获取部门列表失败:', error)
  }
}

// 获取教师列表
const fetchData = async () => {
  try {
    loading.value = true
    const response = await teacherApi.getList(queryParams)
    // 转换数据格式以适配 BaseTable 组件
    dataList.value = response.data.list.map(teacher => ({
      ...teacher,
      id: teacher.teacher_id,
      name: teacher.user?.real_name || '',
      real_name: teacher.user?.real_name || '',
      dept_name: teacher.department?.dept_name
    } as TeacherWithId))
    total.value = response.data.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取教师列表失败')
    console.error('Failed to fetch teachers:', error)
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  Object.assign(queryParams, {
    page: 1,
    teacher_no: searchForm.teacher_no,
    real_name: searchForm.real_name,
    dept_id: searchForm.dept_id,
    title: searchForm.title,
    status: searchForm.status
  })
  fetchData()
}

// 处理重置
const handleReset = () => {
  searchFormRef.value?.resetFields()
  Object.assign(searchForm, {
    teacher_no: '',
    real_name: '',
    dept_id: undefined,
    title: '',
    status: undefined
  })
  Object.assign(queryParams, {
    page: 1,
    pageSize: 10,
    teacher_no: '',
    real_name: '',
    dept_id: undefined,
    title: '',
    status: undefined
  })
  fetchData()
}

// 处理页码变化
const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

// 处理页大小变化
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.page = 1
  fetchData()
}

// 处理表格搜索
const handleTableSearch = (keyword: string) => {
  queryParams.real_name = keyword
  queryParams.page = 1
  fetchData()
}

// 处理新增
const handleAdd = () => {
  currentTeacher.value = null
  showTeacherForm.value = true
}

// 处理编辑
const handleEdit = (teacher: TeacherWithId) => {
  currentTeacher.value = teacher
  showTeacherForm.value = true
}

// 处理删除
const handleDelete = async (teacher: TeacherWithId) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除教师 "${teacher.real_name}"？此操作将同时删除相关用户账户，不可恢复。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )

    await teacherApi.delete(teacher.teacher_id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
      console.error('Failed to delete teacher:', error)
    }
  }
}

// 处理批量删除
const handleBatchDelete = async (teachers: TeacherWithId[]) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${teachers.length} 个教师？此操作将同时删除相关用户账户，不可恢复。`,
      '批量删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )

    // 逐个删除教师
    for (const teacher of teachers) {
      await teacherApi.delete(teacher.teacher_id)
    }
    ElMessage.success('批量删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败')
      console.error('Failed to batch delete teachers:', error)
    }
  }
}

// 处理切换状态
const handleToggleStatus = async (teacher: TeacherWithId) => {
  try {
    const action = teacher.user?.status === UserStatus.ACTIVE ? '禁用' : '启用'
    const newStatus = teacher.user?.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE

    await ElMessageBox.confirm(
      `确定要${action}教师 "${teacher.real_name}" 的账户？`,
      `${action}确认`,
      {
        type: 'warning',
        confirmButtonText: `确定${action}`,
        cancelButtonText: '取消'
      }
    )

    if (teacher.user) {
      await userApi.toggleStatus(teacher.user.user_id, {
        user_id: teacher.user.user_id,
        status: newStatus
      })
      ElMessage.success(`${action}账户成功`)
      fetchData()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 处理重置密码
const handleResetPassword = async (teacher: TeacherWithId) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置教师 "${teacher.real_name}" 的密码？`,
      '重置密码确认',
      {
        type: 'warning',
        confirmButtonText: '确定重置',
        cancelButtonText: '取消'
      }
    )

    if (teacher.user) {
      const result = await userApi.resetPassword(teacher.user.user_id, { user_id: teacher.user.user_id })
      await ElMessageBox.alert(
        `新密码：${result.data.password}`,
        '密码重置成功',
        {
          type: 'success',
          confirmButtonText: '知道了'
        }
      )
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '重置密码失败')
    }
  }
}

// 处理表单提交成功
const handleFormSuccess = () => {
  fetchData()
}

// 刷新数据
const refresh = fetchData

// 工具函数
const getTeacherStatusText = (status?: number) => {
  if (status === undefined) return '-'
  const statusMap: Record<number, string> = {
    [TeacherStatus.ACTIVE]: '在职',
    [TeacherStatus.INACTIVE]: '离职',
    [TeacherStatus.SUSPENDED]: '休假'
  }
  return statusMap[status] || '未知'
}

const getTeacherStatusTagType = (status?: number) => {
  if (status === undefined) return ''
  const typeMap: Record<number, string> = {
    [TeacherStatus.ACTIVE]: 'success',
    [TeacherStatus.INACTIVE]: 'danger',
    [TeacherStatus.SUSPENDED]: 'warning'
  }
  return typeMap[status] || ''
}

const getUserStatusText = (status?: UserStatus) => {
  if (!status) return '-'
  const statusMap: Record<UserStatus, string> = {
    [UserStatus.ACTIVE]: '正常',
    [UserStatus.INACTIVE]: '未激活',
    [UserStatus.LOCKED]: '已锁定'
  }
  return statusMap[status] || status
}

const getUserStatusTagType = (status?: UserStatus) => {
  if (!status) return ''
  const typeMap: Record<UserStatus, string> = {
    [UserStatus.ACTIVE]: 'success',
    [UserStatus.INACTIVE]: 'warning',
    [UserStatus.LOCKED]: 'danger'
  }
  return typeMap[status] || ''
}

// 页面加载时获取数据
onMounted(() => {
  fetchDepartments()
  fetchData()
})
</script>

<style lang="scss" scoped>
.teacher-management {
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
}
</style>
