<template>
  <div class="role-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>角色管理</h2>
      <p>管理系统角色和权限分配</p>
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
        <el-form-item label="角色名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入角色名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="角色代码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入角色代码"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 角色表格 -->
    <el-card class="table-card" shadow="never">
      <BaseTable
        :data="roleList"
        :loading="loading"
        :total="total"
        :page="queryParams.page"
        :page-size="queryParams.pageSize"
        add-text="新增"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
        @batch-delete="handleBatchDelete"
        @refresh="fetchRoles"
        @search="handleTableSearch"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      >
        <el-table-column prop="name" label="角色名称" min-width="120" />

        <el-table-column prop="code" label="角色代码" min-width="120" />

        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="permissions" label="权限数量" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.permissions?.length || 0 }}</el-tag>
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
            @click="handleAssignPermissions(row)"
          >
            分配权限
          </el-button>

          <el-button
            type="primary"
            size="small"
            link
            @click="handleEdit(row)"
          >
            编辑
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

    <!-- 角色表单弹窗 -->
    <el-dialog
      v-model="showRoleForm"
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="600px"
      :before-close="handleFormClose"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleFormRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input
            v-model="roleForm.name"
            placeholder="请输入角色名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="角色代码" prop="code">
          <el-input
            v-model="roleForm.code"
            placeholder="请输入角色代码"
            maxlength="50"
            show-word-limit
            :disabled="isEdit"
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            placeholder="请输入角色描述"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleFormClose">取消</el-button>
        <el-button type="primary" @click="handleFormSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 权限分配弹窗 -->
    <el-dialog
      v-model="showPermissionDialog"
      title="分配权限"
      width="800px"
      :before-close="handlePermissionDialogClose"
    >
      <div class="permission-assignment">
        <div class="permission-info">
          <p><strong>角色：</strong>{{ currentRole?.name }}</p>
          <p><strong>代码：</strong>{{ currentRole?.code }}</p>
        </div>

        <el-divider />

        <div class="permission-tree">
          <h4>权限列表</h4>
          <div v-loading="permissionLoading" style="min-height: 300px">
            <div
              v-for="(permissions, module) in permissionsByModule"
              :key="module"
              class="permission-module"
            >
              <div class="module-header">
                <el-checkbox
                  :model-value="isModuleAllSelected(module)"
                  :indeterminate="isModuleIndeterminate(module)"
                  @change="handleModuleSelect($event, module)"
                >
                  <strong>{{ module }}</strong>
                </el-checkbox>
              </div>

              <div class="module-permissions">
                <el-checkbox-group v-model="selectedPermissions">
                  <div
                    v-for="permission in permissions"
                    :key="permission.id"
                    class="permission-item"
                  >
                    <el-checkbox :label="permission.id">
                      {{ permission.name }}
                      <span class="permission-desc">{{ permission.description }}</span>
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="handlePermissionDialogClose">取消</el-button>
        <el-button type="primary" @click="handlePermissionSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { roleApi } from '@/api/modules/role'
import { permissionApi } from '@/api/modules/permission'
import type { Role, Permission, RoleQuery, CreateRoleData, UpdateRoleData } from '@/types/user'
import BaseTable from '@/components/common/BaseTable/index.vue'

// 表单引用
const searchFormRef = ref<FormInstance>()
const roleFormRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)
const submitLoading = ref(false)
const permissionLoading = ref(false)

// 数据
const roleList = ref<Role[]>([])
const total = ref(0)
const allPermissions = ref<Permission[]>([])
const permissionsByModule = ref<Record<string, Permission[]>>({})

// 搜索表单
const searchForm = reactive<RoleQuery>({
  name: '',
  code: '',
  page: 1,
  pageSize: 10
})

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10
})

// 角色表单
const showRoleForm = ref(false)
const isEdit = ref(false)
const currentRole = ref<Role | null>(null)
const roleForm = reactive<CreateRoleData>({
  name: '',
  code: '',
  description: '',
  permissionIds: []
})

// 权限分配
const showPermissionDialog = ref(false)
const selectedPermissions = ref<number[]>([])

// 表单验证规则
const roleFormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度为2-50个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色代码', trigger: 'blur' },
    { min: 2, max: 50, message: '角色代码长度为2-50个字符', trigger: 'blur' },
    { pattern: /^[A-Z_][A-Z0-9_]*$/, message: '角色代码只能包含大写字母、数字和下划线，且以大写字母或下划线开头', trigger: 'blur' }
  ]
}

// 计算属性
const isModuleAllSelected = (module: string) => {
  const modulePermissions = permissionsByModule.value[module] || []
  return modulePermissions.length > 0 && modulePermissions.every(p => selectedPermissions.value.includes(p.id))
}

const isModuleIndeterminate = (module: string) => {
  const modulePermissions = permissionsByModule.value[module] || []
  const selectedCount = modulePermissions.filter(p => selectedPermissions.value.includes(p.id)).length
  return selectedCount > 0 && selectedCount < modulePermissions.length
}

// 方法
const fetchRoles = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: queryParams.page,
      pageSize: queryParams.pageSize
    }
    const response = await roleApi.getRoles(params)
    roleList.value = response.list
    total.value = response.total
  } catch (error) {
    ElMessage.error('获取角色列表失败')
    console.error('Failed to fetch roles:', error)
  } finally {
    loading.value = false
  }
}

const fetchPermissions = async () => {
  try {
    permissionLoading.value = true
    const [allPermsResponse, modulePermsResponse] = await Promise.all([
      permissionApi.getAllPermissions(),
      permissionApi.getPermissionsByModule()
    ])
    allPermissions.value = allPermsResponse
    permissionsByModule.value = modulePermsResponse
  } catch (error) {
    ElMessage.error('获取权限列表失败')
    console.error('Failed to fetch permissions:', error)
  } finally {
    permissionLoading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchRoles()
}

const handleReset = () => {
  searchFormRef.value?.resetFields()
  Object.assign(searchForm, {
    name: '',
    code: '',
    page: 1,
    pageSize: 10
  })
  queryParams.page = 1
  fetchRoles()
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchRoles()
}

const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.page = 1
  fetchRoles()
}

const handleAdd = () => {
  isEdit.value = false
  currentRole.value = null
  Object.assign(roleForm, {
    name: '',
    code: '',
    description: '',
    permissionIds: []
  })
  showRoleForm.value = true
}

const handleEdit = (role: Role) => {
  isEdit.value = true
  currentRole.value = role
  Object.assign(roleForm, {
    name: role.name,
    code: role.code,
    description: role.description || '',
    permissionIds: role.permissions?.map(p => p.id) || []
  })
  showRoleForm.value = true
}

const handleDelete = async (role: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${role.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await roleApi.deleteRole(role.id)
    ElMessage.success('删除成功')
    fetchRoles()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('Failed to delete role:', error)
    }
  }
}

const handleFormSubmit = async () => {
  if (!roleFormRef.value) return

  try {
    await roleFormRef.value.validate()
    submitLoading.value = true

    if (isEdit.value && currentRole.value) {
      await roleApi.updateRole(currentRole.value.id, roleForm)
      ElMessage.success('更新成功')
    } else {
      await roleApi.createRole(roleForm)
      ElMessage.success('创建成功')
    }

    showRoleForm.value = false
    fetchRoles()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    console.error('Failed to submit role form:', error)
  } finally {
    submitLoading.value = false
  }
}

const handleFormClose = () => {
  roleFormRef.value?.resetFields()
  showRoleForm.value = false
}

const handleAssignPermissions = async (role: Role) => {
  currentRole.value = role
  selectedPermissions.value = role.permissions?.map(p => p.id) || []

  if (Object.keys(permissionsByModule.value).length === 0) {
    permissionLoading.value = true
    await fetchPermissions()
    permissionLoading.value = false
  }

  showPermissionDialog.value = true
}

const handleModuleSelect = (checked: boolean, module: string) => {
  const modulePermissions = permissionsByModule.value[module] || []
  const modulePermissionIds = modulePermissions.map(p => p.id)

  if (checked) {
    // 添加模块下所有权限
    const newIds = modulePermissionIds.filter(id => !selectedPermissions.value.includes(id))
    selectedPermissions.value.push(...newIds)
  } else {
    // 移除模块下所有权限
    selectedPermissions.value = selectedPermissions.value.filter(id => !modulePermissionIds.includes(id))
  }
}

const handlePermissionSubmit = async () => {
  if (!currentRole.value) return

  try {
    submitLoading.value = true
    await roleApi.assignPermissions(currentRole.value.id, selectedPermissions.value)
    ElMessage.success('权限分配成功')
    showPermissionDialog.value = false
    fetchRoles()
  } catch (error) {
    ElMessage.error('权限分配失败')
    console.error('Failed to assign permissions:', error)
  } finally {
    submitLoading.value = false
  }
}

const handlePermissionDialogClose = () => {
  showPermissionDialog.value = false
  selectedPermissions.value = []
}

// 处理批量删除
const handleBatchDelete = async (roles: Role[]) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${roles.length} 个角色？此操作不可恢复。`,
      '批量删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )

    const roleIds = roles.map(role => role.id)
    // 这里需要后端支持批量删除API
    await Promise.all(roleIds.map(id => roleApi.deleteRole(id)))
    ElMessage.success('批量删除成功')
    fetchRoles()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error('Failed to batch delete roles:', error)
    }
  }
}

// 处理表格搜索
const handleTableSearch = (keyword: string) => {
  // 简单的本地搜索实现，可根据需要改为服务端搜索
  searchForm.name = keyword
  handleSearch()
}

// 格式化日期时间
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

// 初始化
onMounted(() => {
  fetchRoles()
})
</script>

<style lang="scss" scoped>
.role-management {
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

  .permission-assignment {
    .permission-info {
      background-color: #f5f7fa;
      padding: $spacing-md;
      border-radius: $border-radius-large;
      margin-bottom: $spacing-md;

      p {
        margin: 0 0 $spacing-sm 0;
        color: $text-regular;

        &:last-child {
          margin-bottom: 0;
        }

        strong {
          color: $text-primary;
        }
      }
    }

    .permission-tree {
      .permission-module {
        margin-bottom: $spacing-lg;

        .module-header {
          margin-bottom: $spacing-sm;
        }

        .module-permissions {
          padding-left: $spacing-lg;

          .permission-item {
            margin-bottom: $spacing-sm;

            .permission-desc {
              margin-left: $spacing-sm;
              font-size: 12px;
              color: $text-secondary;
            }
          }
        }
      }
    }
  }
}
</style>
