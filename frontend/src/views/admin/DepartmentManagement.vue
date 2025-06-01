<template>
  <div class="department-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>部门管理</h2>
      <p>管理组织架构和部门层级结构</p>
    </div>

    <!-- 操作工具栏 -->
    <el-card class="table-card" shadow="never">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增部门
          </el-button>
          <el-button @click="expandAll">
            <el-icon><FolderOpened /></el-icon>
            展开全部
          </el-button>
          <el-button @click="collapseAll">
            <el-icon><Folder /></el-icon>
            收起全部
          </el-button>
        </div>

        <div class="toolbar-right">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索部门名称"
            style="width: 240px"
            clearable
            @input="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
          <el-button @click="fetchDepartments" :loading="loading" circle>
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="filteredDepartments"
        style="width: 100%"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
      >
        <el-table-column type="index" label="序号" width="70" align="center" />

        <el-table-column prop="name" label="部门名称" min-width="250">
          <template #default="{ row }">
            <div class="department-name">
              <el-icon class="department-icon"><OfficeBuilding /></el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="code" label="部门代码" width="150" />

        <el-table-column prop="description" label="部门描述" min-width="200">
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="success"
              size="small"
              link
              @click="handleAddChild(row)"
            >
              添加子部门
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
              :disabled="row.children && row.children.length > 0"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 部门表单弹窗 -->
    <el-dialog
      v-model="showDepartmentForm"
      :title="dialogTitle"
      width="600px"
      :before-close="handleFormClose"
    >
      <el-form
        ref="departmentFormRef"
        :model="departmentForm"
        :rules="departmentFormRules"
        label-width="100px"
      >
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
            v-model="departmentForm.parentId"
            :data="departmentTreeOptions"
            :props="{ label: 'name', value: 'id' }"
            placeholder="请选择上级部门"
            node-key="id"
            check-strictly
            clearable
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="部门名称" prop="name">
          <el-input
            v-model="departmentForm.name"
            placeholder="请输入部门名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="部门代码" prop="code">
          <el-input
            v-model="departmentForm.code"
            placeholder="请输入部门代码"
            maxlength="50"
            show-word-limit
            :disabled="isEdit"
          />
        </el-form-item>

        <el-form-item label="部门描述" prop="description">
          <el-input
            v-model="departmentForm.description"
            type="textarea"
            placeholder="请输入部门描述"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  FolderOpened,
  Folder,
  OfficeBuilding
} from '@element-plus/icons-vue'
import { departmentApi } from '@/api/modules/department'
import type { Department, CreateDepartmentData, UpdateDepartmentData } from '@/types/user'
import { formatDateTime } from '@/utils/common'

// 表单引用
const tableRef = ref()
const departmentFormRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)
const submitLoading = ref(false)

// 数据
const departmentTree = ref<Department[]>([])
const searchKeyword = ref('')

// 表单
const showDepartmentForm = ref(false)
const isEdit = ref(false)
const isAddChild = ref(false)
const currentDepartment = ref<Department | null>(null)
const parentDepartment = ref<Department | null>(null)

const departmentForm = reactive<CreateDepartmentData>({
  name: '',
  code: '',
  parentId: undefined,
  description: ''
})

// 表单验证规则
const departmentFormRules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 50, message: '部门名称长度为2-50个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入部门代码', trigger: 'blur' },
    { min: 2, max: 50, message: '部门代码长度为2-50个字符', trigger: 'blur' },
    { pattern: /^[A-Z0-9_]+$/, message: '部门代码只能包含大写字母、数字和下划线', trigger: 'blur' }
  ]
}

// 计算属性
const dialogTitle = computed(() => {
  if (isAddChild.value && parentDepartment.value) {
    return `为"${parentDepartment.value.name}"添加子部门`
  }
  return isEdit.value ? '编辑部门' : '新增部门'
})

const filteredDepartments = computed(() => {
  if (!searchKeyword.value) {
    return departmentTree.value
  }
  return filterTree(departmentTree.value, searchKeyword.value)
})

const departmentTreeOptions = computed(() => {
  return buildTreeOptions(departmentTree.value, currentDepartment.value?.id)
})

// 方法
const fetchDepartments = async () => {
  loading.value = true
  try {
    const response = await departmentApi.getDepartmentTree()
    departmentTree.value = response
  } catch (error) {
    ElMessage.error('获取部门列表失败')
    console.error('Failed to fetch departments:', error)
  } finally {
    loading.value = false
  }
}

const filterTree = (tree: Department[], keyword: string): Department[] => {
  const result: Department[] = []

  for (const node of tree) {
    if (node.name.toLowerCase().includes(keyword.toLowerCase())) {
      // 如果当前节点匹配，包含所有子节点
      result.push({ ...node })
    } else if (node.children && node.children.length > 0) {
      // 如果当前节点不匹配，递归检查子节点
      const filteredChildren = filterTree(node.children, keyword)
      if (filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren
        })
      }
    }
  }

  return result
}

const buildTreeOptions = (tree: Department[], excludeId?: number): Department[] => {
  const result: Department[] = []

  for (const node of tree) {
    if (node.id === excludeId) {
      // 排除当前编辑的部门（避免选择自己作为父级）
      continue
    }

    const option: Department = {
      ...node,
      children: node.children ? buildTreeOptions(node.children, excludeId) : undefined
    }

    result.push(option)
  }

  return result
}

const handleSearch = () => {
  // 搜索时自动展开所有节点
  nextTick(() => {
    if (tableRef.value) {
      tableRef.value.store.states.expandAll.value = true
    }
  })
}

const expandAll = () => {
  if (tableRef.value) {
    // 获取所有节点的key，然后展开
    const getAllKeys = (data: Department[]): number[] => {
      let keys: number[] = []
      data.forEach(item => {
        keys.push(item.id)
        if (item.children && item.children.length > 0) {
          keys = keys.concat(getAllKeys(item.children))
        }
      })
      return keys
    }

    const keys = getAllKeys(departmentTree.value)
    keys.forEach(key => {
      tableRef.value.toggleRowExpansion({ id: key }, true)
    })
  }
}

const collapseAll = () => {
  if (tableRef.value) {
    // 收起所有节点
    const getAllKeys = (data: Department[]): number[] => {
      let keys: number[] = []
      data.forEach(item => {
        keys.push(item.id)
        if (item.children && item.children.length > 0) {
          keys = keys.concat(getAllKeys(item.children))
        }
      })
      return keys
    }

    const keys = getAllKeys(departmentTree.value)
    keys.forEach(key => {
      tableRef.value.toggleRowExpansion({ id: key }, false)
    })
  }
}

const handleAdd = () => {
  isEdit.value = false
  isAddChild.value = false
  currentDepartment.value = null
  parentDepartment.value = null
  Object.assign(departmentForm, {
    name: '',
    code: '',
    parentId: undefined,
    description: ''
  })
  showDepartmentForm.value = true
}

const handleAddChild = (department: Department) => {
  isEdit.value = false
  isAddChild.value = true
  currentDepartment.value = null
  parentDepartment.value = department
  Object.assign(departmentForm, {
    name: '',
    code: '',
    parentId: department.id,
    description: ''
  })
  showDepartmentForm.value = true
}

const handleEdit = (department: Department) => {
  isEdit.value = true
  isAddChild.value = false
  currentDepartment.value = department
  parentDepartment.value = null
  Object.assign(departmentForm, {
    name: department.name,
    code: department.code,
    parentId: department.parentId,
    description: department.description || ''
  })
  showDepartmentForm.value = true
}

const handleDelete = async (department: Department) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除部门"${department.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await departmentApi.deleteDepartment(department.id)
    ElMessage.success('删除成功')
    fetchDepartments()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('Failed to delete department:', error)
    }
  }
}

const handleFormSubmit = async () => {
  if (!departmentFormRef.value) return

  try {
    await departmentFormRef.value.validate()
    submitLoading.value = true

    if (isEdit.value && currentDepartment.value) {
      const updateData: UpdateDepartmentData = {
        name: departmentForm.name,
        parentId: departmentForm.parentId,
        description: departmentForm.description
      }
      await departmentApi.updateDepartment(currentDepartment.value.id, updateData)
      ElMessage.success('更新成功')
    } else {
      await departmentApi.createDepartment(departmentForm)
      ElMessage.success('创建成功')
    }

    showDepartmentForm.value = false
    fetchDepartments()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    console.error('Failed to submit department form:', error)
  } finally {
    submitLoading.value = false
  }
}

const handleFormClose = () => {
  departmentFormRef.value?.resetFields()
  showDepartmentForm.value = false
}

// 初始化
onMounted(() => {
  fetchDepartments()
})
</script>

<style lang="scss" scoped>
.department-management {
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

  .table-card {
    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-md;

      .toolbar-left {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
      }

      .toolbar-right {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
      }
    }

    .department-name {
      display: flex;
      align-items: center;
      gap: $spacing-sm;

      .department-icon {
        color: $primary-color;
        font-size: 16px;
      }
    }

    :deep(.el-card__body) {
      padding-top: 0;
    }
  }
}

:deep(.el-table__expand-icon) {
  color: $primary-color;
}

:deep(.el-table__placeholder) {
  color: transparent;
}
</style>
