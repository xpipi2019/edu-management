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
            v-model="searchForm.roleId"
            placeholder="请选择角色"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
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

        <el-table-column prop="realName" label="真实姓名" min-width="100" />

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
              :key="role.id"
              size="small"
              style="margin-right: 4px"
            >
              {{ role.name }}
            </el-tag>
            <span v-if="row.roles.length === 0">-</span>
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
import type { User, Role, UserQuery } from '@/types/user'
import { UserStatus } from '@/types/user'
import { useTableManagement } from '@/composables/useTableManagement'
import { formatDateTime } from '@/utils/format'
import { userStatusMapper } from '@/utils/enum'

// 角色选项
const roleOptions = ref<Role[]>([])

// 弹窗相关
const showUserForm = ref(false)
const currentUser = ref<User | null>(null)

// 搜索表单
const searchForm = reactive({
  username: '',
  email: '',
  status: undefined as UserStatus | undefined,
  roleId: undefined as number | undefined
})

// 使用表格管理Hook
const {
  loading,
  dataList,
  total,
  queryParams,
  searchFormRef,
  handleSearch: baseHandleSearch,
  handleReset: baseHandleReset,
  handlePageChange,
  handleSizeChange,
  handleTableSearch,
  handleDelete,
  handleBatchDelete,
  refresh
} = useTableManagement<User, UserQuery>({
  fetchApi: userApi.getUsers,
  deleteApi: userApi.deleteUser,
  batchDeleteApi: userApi.batchDeleteUsers
})

// 获取角色列表
const fetchRoles = async () => {
  try {
    const roles = await roleApi.getAllRoles()
    roleOptions.value = roles
  } catch (error) {
    ElMessage.error('获取角色列表失败')
    console.error('获取角色列表失败:', error)
  }
}

// 处理搜索
const handleSearch = () => {
  Object.assign(queryParams, {
    page: 1,
    username: searchForm.username,
    email: searchForm.email,
    status: searchForm.status,
    roleId: searchForm.roleId
  })
  baseHandleSearch()
}

// 处理重置
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    email: '',
    status: undefined,
    roleId: undefined
  })
  Object.assign(queryParams, {
    username: '',
    email: '',
    status: undefined,
    roleId: undefined
  })
  baseHandleReset()
}

// 处理新增
const handleAdd = () => {
  currentUser.value = null
  showUserForm.value = true
}

// 处理编辑
const handleEdit = (user: User) => {
  currentUser.value = user
  showUserForm.value = true
}

// 处理切换状态
const handleToggleStatus = async (user: User) => {
  try {
    const action = user.status === UserStatus.ACTIVE ? '禁用' : '启用'
    await ElMessageBox.confirm(
      `确定要${action}用户 "${user.realName}"？`,
      `${action}确认`,
      {
        type: 'warning',
        confirmButtonText: `确定${action}`,
        cancelButtonText: '取消'
      }
    )

    await userApi.toggleUserStatus(user.id)
    ElMessage.success(`${action}用户成功`)
    refresh()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 处理重置密码
const handleResetPassword = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 "${user.realName}" 的密码？`,
      '重置密码确认',
      {
        type: 'warning',
        confirmButtonText: '确定重置',
        cancelButtonText: '取消'
      }
    )

    const result = await userApi.resetPassword(user.id)
    await ElMessageBox.alert(
      `新密码：${result.password}`,
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
  refresh()
}

// 页面加载时获取数据
onMounted(() => {
  fetchRoles()
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
