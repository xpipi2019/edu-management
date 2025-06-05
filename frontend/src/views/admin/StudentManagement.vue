<template>
  <div class="student-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>学生管理</h2>
      <p>管理系统中的所有学生信息</p>
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
        <el-form-item label="学号">
          <el-input
            v-model="searchForm.student_no"
            placeholder="请输入学号"
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

        <el-form-item label="班级">
          <el-input
            v-model="searchForm.class_name"
            placeholder="请输入班级"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="年级">
          <el-select
            v-model="searchForm.grade"
            placeholder="请选择年级"
            clearable
            style="width: 150px"
          >
            <el-option label="2024级" :value="2024" />
            <el-option label="2023级" :value="2023" />
            <el-option label="2022级" :value="2022" />
            <el-option label="2021级" :value="2021" />
          </el-select>
        </el-form-item>

        <el-form-item label="入学年份">
          <el-select
            v-model="searchForm.enrollment_year"
            placeholder="请选择入学年份"
            clearable
            style="width: 150px"
          >
            <el-option label="2024年" :value="2024" />
            <el-option label="2023年" :value="2023" />
            <el-option label="2022年" :value="2022" />
            <el-option label="2021年" :value="2021" />
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

    <!-- 学生表格 -->
    <el-card class="table-card" shadow="never">
      <BaseTable
        :data="dataList"
        :loading="loading"
        :total="total"
        :page="queryParams.page"
        :page-size="queryParams.pageSize"
        add-text="新增学生"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
        @batch-delete="handleBatchDelete"
        @refresh="refresh"
        @search="handleTableSearch"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <el-table-column prop="student_no" label="学号" min-width="120" />

        <el-table-column prop="real_name" label="姓名" min-width="100" />

        <el-table-column prop="dept_name" label="所属部门" min-width="150">
          <template #default="{ row }">
            {{ row.department?.dept_name || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="class_name" label="班级" min-width="120">
          <template #default="{ row }">
            {{ row.class_name || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="grade" label="年级" min-width="80">
          <template #default="{ row }">
            {{ row.grade ? `${row.grade}级` : '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="enrollment_year" label="入学年份" min-width="100">
          <template #default="{ row }">
            {{ row.enrollment_year ? `${row.enrollment_year}年` : '-' }}
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

    <!-- 学生表单弹窗 -->
    <StudentForm
      v-model="showStudentForm"
      :student="currentStudent"
      :key="currentStudent?.student_id || 'add'"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import BaseTable from '@/components/common/BaseTable/index.vue'
import StudentForm from './components/StudentForm.vue'
import { studentApi } from '@/api/modules/student'
import { departmentApi } from '@/api/modules/department'
import { userApi } from '@/api/modules/user'
import type { Student, Department, StudentQuery } from '@/types/database'
import { UserStatus } from '@/types/database'

// 类型定义
interface StudentWithId extends Student {
  id: number
  name: string
  real_name: string
  dept_name?: string
}

// 部门选项
const departmentOptions = ref<Department[]>([])

// 弹窗相关
const showStudentForm = ref(false)
const currentStudent = ref<Student | null>(null)

// 数据状态
const loading = ref(false)
const dataList = ref<StudentWithId[]>([])
const total = ref(0)

// 表单引用
const searchFormRef = ref()

// 查询参数
const queryParams = reactive<StudentQuery>({
  page: 1,
  pageSize: 10,
  student_no: '',
  real_name: '',
  dept_id: undefined,
  class_name: '',
  grade: undefined,
  enrollment_year: undefined
})

// 搜索表单
const searchForm = reactive({
  student_no: '',
  real_name: '',
  dept_id: undefined as number | undefined,
  class_name: '',
  grade: undefined as number | undefined,
  enrollment_year: undefined as number | undefined
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

// 获取学生列表
const fetchData = async () => {
  try {
    loading.value = true
    const response = await studentApi.getList(queryParams)
    // 转换数据格式以适配 BaseTable 组件
    dataList.value = response.data.list.map(student => ({
      ...student,
      id: student.student_id,
      name: student.user?.real_name || '',
      real_name: student.user?.real_name || '',
      dept_name: student.department?.dept_name
    } as StudentWithId))
    total.value = response.data.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取学生列表失败')
    console.error('Failed to fetch students:', error)
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  Object.assign(queryParams, {
    page: 1,
    student_no: searchForm.student_no,
    real_name: searchForm.real_name,
    dept_id: searchForm.dept_id,
    class_name: searchForm.class_name,
    grade: searchForm.grade,
    enrollment_year: searchForm.enrollment_year
  })
  fetchData()
}

// 处理重置
const handleReset = () => {
  searchFormRef.value?.resetFields()
  Object.assign(searchForm, {
    student_no: '',
    real_name: '',
    dept_id: undefined,
    class_name: '',
    grade: undefined,
    enrollment_year: undefined
  })
  Object.assign(queryParams, {
    page: 1,
    pageSize: 10,
    student_no: '',
    real_name: '',
    dept_id: undefined,
    class_name: '',
    grade: undefined,
    enrollment_year: undefined
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
  currentStudent.value = null
  showStudentForm.value = true
}

// 处理编辑
const handleEdit = (student: StudentWithId) => {
  currentStudent.value = student
  showStudentForm.value = true
}

// 处理删除
const handleDelete = async (student: StudentWithId) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除学生 "${student.real_name}"？此操作将同时删除相关用户账户，不可恢复。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )

    await studentApi.delete(student.student_id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
      console.error('Failed to delete student:', error)
    }
  }
}

// 处理批量删除
const handleBatchDelete = async (students: StudentWithId[]) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${students.length} 个学生？此操作将同时删除相关用户账户，不可恢复。`,
      '批量删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )

    // 逐个删除学生
    for (const student of students) {
      await studentApi.delete(student.student_id)
    }
    ElMessage.success('批量删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败')
      console.error('Failed to batch delete students:', error)
    }
  }
}

// 处理切换状态
const handleToggleStatus = async (student: StudentWithId) => {
  try {
    const action = student.user?.status === UserStatus.ACTIVE ? '禁用' : '启用'
    const newStatus = student.user?.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE

    await ElMessageBox.confirm(
      `确定要${action}学生 "${student.real_name}" 的账户？`,
      `${action}确认`,
      {
        type: 'warning',
        confirmButtonText: `确定${action}`,
        cancelButtonText: '取消'
      }
    )

    if (student.user) {
      await userApi.toggleStatus(student.user.user_id, {
        user_id: student.user.user_id,
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
const handleResetPassword = async (student: StudentWithId) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置学生 "${student.real_name}" 的密码？`,
      '重置密码确认',
      {
        type: 'warning',
        confirmButtonText: '确定重置',
        cancelButtonText: '取消'
      }
    )

    if (student.user) {
      const result = await userApi.resetPassword(student.user.user_id, { user_id: student.user.user_id })
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
.student-management {
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
