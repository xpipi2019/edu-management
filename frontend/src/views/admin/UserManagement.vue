<template>
  <div class="user-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>用户管理</h2>
      <p>管理系统中的所有用户信息</p>
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
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input
            v-model="searchForm.email"
            placeholder="请输入邮箱"
            clearable
            style="width: 200px"
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
            <el-option label="启用" :value="UserStatus.ACTIVE" />
            <el-option label="禁用" :value="UserStatus.INACTIVE" />
            <el-option label="锁定" :value="UserStatus.LOCKED" />
          </el-select>
        </el-form-item>

        <el-form-item label="角色">
          <el-select
            v-model="searchForm.role_code"
            placeholder="请选择角色"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.role_id"
              :label="role.role_name"
              :value="role.role_code"
            />
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

    <!-- 用户表格 -->
    <el-card class="table-card" shadow="never">
      <BaseTable
        :data="dataList"
        :loading="loading"
        :total="total"
        :page="queryParams.page"
        :page-size="queryParams.pageSize"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
        @batch-delete="handleBatchDelete"
        @refresh="refresh"
        @search="handleTableSearch"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <el-table-column prop="username" label="用户名" min-width="120" />

        <el-table-column prop="real_name" label="真实姓名" min-width="100" />

        <el-table-column prop="email" label="邮箱" min-width="180" />

        <el-table-column prop="phone" label="手机号" min-width="130">
          <template #default="{ row }">
            {{ row.phone || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="userStatusMapper.getType(row.status)"
              size="small"
            >
              {{ userStatusMapper.getText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="roles" label="角色" min-width="150">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.role_id"
              size="small"
              style="margin-right: 4px"
            >
              {{ role.role_name }}
            </el-tag>
            <span v-if="!row.roles || row.roles.length === 0">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
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
            :type="row.status === UserStatus.ACTIVE ? 'warning' : 'success'"
            size="small"
            link
            @click="handleToggleStatus(row)"
          >
            {{ row.status === UserStatus.ACTIVE ? '禁用' : '启用' }}
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

    <!-- 用户表单弹窗 -->
    <UserForm
      v-model="showUserForm"
      :user="currentUser"
      :key="currentUser?.user_id || 'add'"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import BaseTable from '@/components/common/BaseTable/index.vue'
import UserForm from './components/UserForm.vue'
import { userApi } from '@/api/modules/user'
import { roleApi } from '@/api/modules/role'
import type { User, Role, UserQuery, UserStatus as UserStatusType } from '@/types/database'
import { UserStatus } from '@/types/database'
import { formatDateTime } from '@/utils/format'
import { userStatusMapper } from '@/utils/enum'

// 类型定义
interface UserWithId extends User {
  id: number
  name: string
}

interface TableResponse<T> {
  list: T[]
  total: number
}

// 角色选项
const roleOptions = ref<Role[]>([])

// 弹窗相关
const showUserForm = ref(false)
const currentUser = ref<User | null>(null)

// 数据状态
const loading = ref(false)
const dataList = ref<UserWithId[]>([])
const total = ref(0)

// 表单引用
const searchFormRef = ref()

// 查询参数
const queryParams = reactive<UserQuery>({
  page: 1,
  pageSize: 10,
  username: '',
  email: '',
  status: undefined,
  role_code: ''
})

// 搜索表单
const searchForm = reactive({
  username: '',
  email: '',
  status: undefined as UserStatusType | undefined,
  role_code: ''
})

// 获取角色列表
const fetchRoles = async () => {
  try {
    const response = await roleApi.getAll()
    roleOptions.value = response.data
  } catch (error) {
    ElMessage.error('获取角色列表失败')
    console.error('获取角色列表失败:', error)
  }
}

// 获取用户列表
const fetchData = async () => {
  try {
    loading.value = true
    const response = await userApi.getList(queryParams)
    // 转换数据格式以适配 BaseTable 组件
    dataList.value = response.data.list.map(user => ({
      ...user,
      id: user.user_id,
      name: user.real_name
    } as UserWithId))
    total.value = response.data.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户列表失败')
    console.error('Failed to fetch users:', error)
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  Object.assign(queryParams, {
    page: 1,
    username: searchForm.username,
    email: searchForm.email,
    status: searchForm.status,
    role_code: searchForm.role_code
  })
  fetchData()
}

// 处理重置
const handleReset = () => {
  searchFormRef.value?.resetFields()
  Object.assign(searchForm, {
    username: '',
    email: '',
    status: undefined,
    role_code: ''
  })
  Object.assign(queryParams, {
    page: 1,
    pageSize: 10,
    username: '',
    email: '',
    status: undefined,
    role_code: ''
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
  queryParams.keyword = keyword
  queryParams.page = 1
  fetchData()
}

// 处理新增
const handleAdd = () => {
  currentUser.value = null
  showUserForm.value = true
}

// 处理编辑
const handleEdit = (user: UserWithId) => {
  // UserWithId 已经包含了所有 User 的属性，不需要转换
  currentUser.value = user
  showUserForm.value = true
}

// 处理删除
const handleDelete = async (user: UserWithId) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.real_name}"？此操作不可恢复。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )

    await userApi.delete(user.user_id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
      console.error('Failed to delete user:', error)
    }
  }
}

// 处理批量删除
const handleBatchDelete = async (users: UserWithId[]) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${users.length} 个用户？此操作不可恢复。`,
      '批量删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )

    const userIds = users.map(user => user.user_id)
    await userApi.batchDelete({ ids: userIds })
    ElMessage.success('批量删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败')
      console.error('Failed to batch delete users:', error)
    }
  }
}

// 处理切换状态
const handleToggleStatus = async (user: UserWithId) => {
  try {
    const action = user.status === UserStatus.ACTIVE ? '禁用' : '启用'
    const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE

    await ElMessageBox.confirm(
      `确定要${action}用户 "${user.real_name}"？`,
      `${action}确认`,
      {
        type: 'warning',
        confirmButtonText: `确定${action}`,
        cancelButtonText: '取消'
      }
    )

    await userApi.toggleStatus(user.user_id, {
      user_id: user.user_id,
      status: newStatus
    })
    ElMessage.success(`${action}用户成功`)
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 处理重置密码
const handleResetPassword = async (user: UserWithId) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 "${user.real_name}" 的密码？`,
      '重置密码确认',
      {
        type: 'warning',
        confirmButtonText: '确定重置',
        cancelButtonText: '取消'
      }
    )

    const result = await userApi.resetPassword(user.user_id, { user_id: user.user_id })
    await ElMessageBox.alert(
      `新密码：${result.data.password}`,
      '密码重置成功',
      {
        type: 'success',
        confirmButtonText: '知道了'
      }
    )
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

// 页面加载时获取数据
onMounted(() => {
  fetchRoles()
  fetchData()
})
</script>

<style lang="scss" scoped>
.user-management {
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
