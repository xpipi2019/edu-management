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
            v-model="searchForm.role_name"
            placeholder="请输入角色名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="角色代码">
          <el-input
            v-model="searchForm.role_code"
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
        <el-table-column prop="role_name" label="角色名称" min-width="120" />

        <el-table-column prop="role_code" label="角色代码" min-width="120" />

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
      :before-close="handleFormBeforeClose"
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
        <el-button @click="handleFormCancel">取消</el-button>
        <el-button type="primary" @click="handleFormSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 权限分配弹窗 -->
    <el-dialog
      v-model="showPermissionDialog"
      title="分配权限"
      width="900px"
      :before-close="handlePermissionBeforeClose"
      class="permission-dialog"
    >
      <div class="permission-assignment">
        <div class="permission-info">
          <p><strong>角色：</strong>{{ currentRole?.role_name }}</p>
          <p><strong>代码：</strong>{{ currentRole?.role_code }}</p>
        </div>

        <el-divider />

        <div class="permission-container">
          <div class="permission-header">
            <h4>权限列表</h4>
            <div class="permission-stats">
              <span>已选择 {{ selectedPermissions.length }} 项权限</span>
            </div>
          </div>

          <div class="permission-tree-wrapper" v-loading="permissionLoading">
            <div class="permission-tree">
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
                    class="module-checkbox"
                  >
                    <span class="module-name">{{ module }}</span>
                    <span class="module-count">{{ Array.isArray(permissions) ? permissions.length : 0 }}项权限</span>
                  </el-checkbox>
                </div>

                <div class="module-permissions" v-if="Array.isArray(permissions)">
                  <el-checkbox-group v-model="selectedPermissions">
                    <div
                      v-for="permission in permissions"
                      :key="permission.permission_id"
                      class="permission-item"
                    >
                      <el-checkbox :value="permission.permission_id" class="permission-checkbox">
                        <div class="permission-content">
                          <span class="permission-name">{{ permission.permission_name }}</span>
                          <span class="permission-code">({{ permission.permission_code }})</span>
                          <div class="permission-desc" v-if="permission.description">
                            {{ permission.description }}
                          </div>
                        </div>
                      </el-checkbox>
                    </div>
                  </el-checkbox-group>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="handlePermissionCancel">取消</el-button>
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
import type { Role, Permission, RoleQuery, CreateRoleData, UpdateRoleData } from '@/types/database'
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
  role_name: '',
  role_code: '',
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
const roleForm = reactive<{
  name: string;
  code: string;
  description: string;
  permissionIds: number[]
}>({
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
  if (!Array.isArray(modulePermissions)) {
    return false
  }
  return modulePermissions.length > 0 && modulePermissions.every(p => selectedPermissions.value.includes(p.permission_id))
}

const isModuleIndeterminate = (module: string) => {
  const modulePermissions = permissionsByModule.value[module] || []
  if (!Array.isArray(modulePermissions)) {
    return false
  }
  const selectedCount = modulePermissions.filter(p => selectedPermissions.value.includes(p.permission_id)).length
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
    const response = await roleApi.getList(params)
    roleList.value = response.data.list
    total.value = response.data.total
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
      permissionApi.getAll(),
      permissionApi.getByModule()
    ])
    allPermissions.value = allPermsResponse.data

    if (modulePermsResponse.data) {
      permissionsByModule.value = modulePermsResponse.data
    }
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
    role_name: '',
    role_code: '',
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
    name: role.role_name,
    code: role.role_code,
    description: role.description || '',
    permissionIds: role.permissions?.map((p: any) => p.permission_id) || []
  })
  showRoleForm.value = true
}

const handleDelete = async (role: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${role.role_name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await roleApi.delete(role.role_id)
    ElMessage.success('删除成功')
    fetchRoles()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('Failed to delete role:', error)
    }
  }
}

const handleFormBeforeClose = () => {
  // 立即清空表单数据，避免关闭时闪烁
  Object.assign(roleForm, {
    name: '',
    code: '',
    description: '',
    permissionIds: []
  })
  // 重置表单验证状态
  roleFormRef.value?.resetFields()
  // 清空当前角色引用
  currentRole.value = null
  isEdit.value = false
  // 关闭弹窗
  showRoleForm.value = false
}

const handleFormCancel = () => {
  handleFormBeforeClose()
}

const handleFormSubmit = async () => {
  if (!roleFormRef.value) return

  try {
    await roleFormRef.value.validate()
    submitLoading.value = true

    if (isEdit.value && currentRole.value) {
      const updateData: UpdateRoleData = {
        role_name: roleForm.name,
        description: roleForm.description
      }
      await roleApi.update(currentRole.value.role_id, updateData)
      ElMessage.success('更新成功')
    } else {
      const createData: CreateRoleData = {
        role_name: roleForm.name,
        role_code: roleForm.code,
        description: roleForm.description
      }
      await roleApi.create(createData)
      ElMessage.success('创建成功')
    }

    handleFormBeforeClose()
    fetchRoles()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    console.error('Failed to submit role form:', error)
  } finally {
    submitLoading.value = false
  }
}

const handleAssignPermissions = async (role: Role) => {
  currentRole.value = role
  selectedPermissions.value = role.permissions?.map((p: any) => p.permission_id) || []

  if (Object.keys(permissionsByModule.value).length === 0) {
    permissionLoading.value = true
    await fetchPermissions()
    permissionLoading.value = false
  }

  showPermissionDialog.value = true
}

const handleModuleSelect = (checked: boolean, module: string) => {
  const modulePermissions = permissionsByModule.value[module] || []
  if (!Array.isArray(modulePermissions)) {
    return
  }
  const modulePermissionIds = modulePermissions.map(p => p.permission_id)

  if (checked) {
    const newIds = modulePermissionIds.filter(id => !selectedPermissions.value.includes(id))
    selectedPermissions.value.push(...newIds)
  } else {
    selectedPermissions.value = selectedPermissions.value.filter(id => !modulePermissionIds.includes(id))
  }
}

const handlePermissionBeforeClose = () => {
  // 立即清空数据
  selectedPermissions.value = []
  currentRole.value = null
  // 关闭弹窗
  showPermissionDialog.value = false
}

const handlePermissionCancel = () => {
  handlePermissionBeforeClose()
}

const handlePermissionSubmit = async () => {
  if (!currentRole.value) return

  try {
    submitLoading.value = true
    await roleApi.assignPermissions(currentRole.value.role_id, selectedPermissions.value)
    ElMessage.success('权限分配成功')
    // 提交成功后关闭弹窗
    handlePermissionBeforeClose()
    fetchRoles()
  } catch (error) {
    ElMessage.error('权限分配失败')
    console.error('Failed to assign permissions:', error)
  } finally {
    submitLoading.value = false
  }
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

    const roleIds = roles.map(role => role.role_id)
    await Promise.all(roleIds.map(id => roleApi.delete(id)))
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
  searchForm.role_name = keyword
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

    .permission-container {
      .permission-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-md;

        h4 {
          margin: 0;
          color: $text-primary;
          font-size: 16px;
          font-weight: 600;
        }

        .permission-stats {
          color: $text-secondary;
          font-size: 14px;

          span {
            background: #e1f3d8;
            color: #529b2e;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
          }
        }
      }

      .permission-tree-wrapper {
        height: 450px;
        overflow-y: auto;
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        background: #fafafa;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;

          &:hover {
            background: #a8a8a8;
          }
        }
      }

      .permission-tree {
        padding: $spacing-md;

        .permission-module {
          background: white;
          border-radius: 8px;
          margin-bottom: $spacing-md;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;

          &:last-child {
            margin-bottom: 0;
          }

          .module-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: $spacing-md;
            margin: 0;

            .module-checkbox {
              :deep(.el-checkbox__label) {
                color: white;
                font-weight: 500;
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
              }

              :deep(.el-checkbox__inner) {
                border-color: rgba(255, 255, 255, 0.6);

                &::after {
                  border-color: #667eea;
                }
              }

              :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
                background-color: white;
                border-color: white;
              }

              :deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
                background-color: rgba(255, 255, 255, 0.8);
                border-color: white;

                &::before {
                  background-color: #667eea;
                }
              }

              .module-name {
                font-size: 16px;
                font-weight: 600;
              }

              .module-count {
                font-size: 12px;
                opacity: 0.9;
                background: rgba(255, 255, 255, 0.2);
                padding: 2px 8px;
                border-radius: 12px;
                margin-left: auto;
              }
            }
          }

          .module-permissions {
            padding: $spacing-md;

            .permission-item {
              margin-bottom: $spacing-sm;
              padding: $spacing-sm;
              border-radius: 6px;
              transition: all 0.2s ease;

              &:hover {
                background-color: #f8f9ff;
              }

              &:last-child {
                margin-bottom: 0;
              }

              .permission-checkbox {
                width: 100%;

                :deep(.el-checkbox__label) {
                  width: 100%;
                  color: $text-primary;
                }

                .permission-content {
                  width: 100%;

                  .permission-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: $text-primary;
                  }

                  .permission-code {
                    font-size: 12px;
                    color: $text-secondary;
                    margin-left: $spacing-xs;
                    font-family: 'Courier New', monospace;
                    background: #f0f0f0;
                    padding: 1px 4px;
                    border-radius: 3px;
                  }

                  .permission-desc {
                    font-size: 12px;
                    color: $text-secondary;
                    margin-top: 4px;
                    line-height: 1.4;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
// 权限分配弹窗的全局样式
.permission-dialog {
  .el-dialog__header {
    //background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    //color: white;
    margin: 0;
    padding: 20px 24px;

    .el-dialog__title {
      color:black;
      font-weight: 600;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: white;
        font-size: 18px;

        &:hover {
          color: black;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 24px;
    max-height: 70vh;
    overflow: hidden;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    text-align: right;
  }
}
</style>
