<template>
  <div class="classroom-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>教室管理</h2>
      <p>管理系统中的所有教室信息</p>
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
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="请输入教室名称或建筑名称"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>

            <el-form-item label="建筑">
              <el-select
                v-model="searchForm.building"
                placeholder="选择建筑"
                clearable
                style="width: 120px"
              >
                <el-option
                  v-for="building in buildingOptions"
                  :key="building"
                  :label="building"
                  :value="building"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="类型">
              <el-select
                v-model="searchForm.type"
                placeholder="选择类型"
                clearable
                style="width: 140px"
              >
                <el-option
                  v-for="(label, value) in roomTypeOptions"
                  :key="value"
                  :label="label"
                  :value="value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="选择状态"
                clearable
                style="width: 120px"
              >
                <el-option
                  v-for="status in statusOptions"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
                />
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

    <!-- 教室表格 -->
    <el-card class="table-card" shadow="never">
      <BaseTable
        :data="classroomList"
        :loading="loading"
        :total="pagination.total"
        :page="pagination.page"
        :page-size="pagination.pageSize"
        :show-selection="false"
        :show-index="true"
        @add="handleAdd"
        @edit="handleEdit"
        @delete="handleDelete"
        @refresh="fetchClassrooms"
        @search="handleTableSearch"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        add-text="新增教室"
        search-placeholder="搜索教室名称或建筑"
      >
        <el-table-column prop="room_no" label="教室名称" min-width="120" />

        <el-table-column prop="building" label="建筑" width="100" />

        <el-table-column prop="floor" label="楼层" width="80" align="center" />

        <el-table-column prop="capacity" label="容量" width="80" align="center" />

        <el-table-column prop="room_type" label="类型" width="120" />

        <el-table-column label="设备" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="equipment in row.equipment"
              :key="equipment"
              size="small"
              style="margin-right: 5px; margin-bottom: 2px;"
            >
              {{ equipment }}
            </el-tag>
            <span v-if="!row.equipment || row.equipment.length === 0">-</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updated_at) }}
          </template>
        </el-table-column>

        <!-- 自定义操作列 -->
        <template #actions="{ row }" v-if="authStore.hasPermission('classroom:manage')">
          <el-button
            type="primary"
            size="small"
            link
            @click="handleEdit(row)"
          >
            编辑
          </el-button>

          <el-popconfirm
            title="确定要删除这个教室吗？"
            @confirm="handleDelete(row)"
          >
            <template #reference>
              <el-button
                type="danger"
                size="small"
                link
              >
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </BaseTable>
    </el-card>

    <!-- 新增/编辑教室对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="教室名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入教室名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所在建筑" prop="building">
              <el-input v-model="form.building" placeholder="请输入建筑名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="楼层" prop="floor">
              <el-input-number
                v-model="form.floor"
                :min="1"
                :max="20"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="容量" prop="capacity">
              <el-input-number
                v-model="form.capacity"
                :min="1"
                :max="500"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="教室类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
                <el-option
                  v-for="(label, value) in roomTypeOptions"
                  :key="value"
                  :label="label"
                  :value="value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status" v-if="isEdit">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option
                  v-for="status in statusOptions"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="设备清单">
          <div class="equipment-section">
            <el-tag
              v-for="(equipment, index) in form.equipment"
              :key="index"
              closable
              @close="removeEquipment(index)"
              style="margin-right: 8px; margin-bottom: 8px;"
            >
              {{ equipment }}
            </el-tag>
            <el-input
              v-if="inputVisible"
              ref="equipmentInputRef"
              v-model="inputValue"
              size="small"
              style="width: 100px; margin-right: 8px;"
              @keyup.enter="handleInputConfirm"
              @blur="handleInputConfirm"
            />
            <el-button
              v-else
              size="small"
              @click="showInput"
              :icon="Plus"
            >
              添加设备
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Search, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'
import BaseTable from '@/components/common/BaseTable/index.vue'
import { classroomApi } from '@/api/modules/classroom'
import { useAuthStore } from '@/stores/auth'
import { ClassroomStatus, ClassroomType } from '@/types/database'
import type { Classroom } from '@/types/database'
import type { FormRules } from 'element-plus'
import type { ApiResponse, PageResponse } from '@/types/common'

// 扩展教室类型，包含额外的显示字段
interface ExtendedClassroom extends Omit<Classroom, 'equipment'> {
  equipment?: string[]
}

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)

// 表单引用
const searchFormRef = ref<FormInstance>()
const formRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  building: '',
  type: '',
  status: ''
})

// 编辑表单
const form = reactive({
  id: 0,
  name: '',
  building: '',
  floor: 1,
  capacity: 30,
  type: '',
  equipment: [] as string[],
  status: ClassroomStatus.ACTIVE
})

// 设备输入
const inputVisible = ref(false)
const inputValue = ref('')
const equipmentInputRef = ref<HTMLInputElement>()

// 表格数据
const classroomList = ref<ExtendedClassroom[]>([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 权限检查
const authStore = useAuthStore()

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑教室' : '新增教室')

// 选项数据
const buildingOptions = ['教学楼A', '教学楼B', '教学楼C', '实验楼', '图书馆']
const roomTypeOptions = {
  [ClassroomType.NORMAL]: '普通教室',
  [ClassroomType.MULTIMEDIA]: '多媒体教室',
  [ClassroomType.LAB]: '实验室',
  [ClassroomType.COMPUTER]: '机房'
}
const statusOptions = [
  { label: '停用', value: ClassroomStatus.INACTIVE },
  { label: '可用', value: ClassroomStatus.ACTIVE },
  { label: '维护中', value: ClassroomStatus.MAINTENANCE }
]

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入教室名称', trigger: 'blur' },
    { min: 1, max: 50, message: '教室名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  building: [
    { required: true, message: '请输入建筑名称', trigger: 'blur' },
    { min: 1, max: 50, message: '建筑名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  floor: [
    { required: true, message: '请输入楼层', trigger: 'blur' },
    { type: 'number', min: 1, max: 50, message: '楼层必须在 1 到 50 之间', trigger: 'blur' }
  ],
  capacity: [
    { required: true, message: '请输入容量', trigger: 'blur' },
    { type: 'number', min: 1, max: 1000, message: '容量必须在 1 到 1000 之间', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择教室类型', trigger: 'change' }
  ]
}

// 方法
const fetchClassrooms = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      room_no: searchForm.keyword,
      building: searchForm.building,
      room_type: searchForm.type as ClassroomType | undefined,
      status: searchForm.status ? Number(searchForm.status) as ClassroomStatus : undefined
    }

    const response = await classroomApi.getList(params)
    classroomList.value = response.data.list.map(item => ({
      ...item,
      equipment: typeof item.equipment === 'string' ? item.equipment.split(',').filter(Boolean) : []
    }))
    pagination.total = response.data.total
  } catch (error) {
    ElMessage.error('获取教室列表失败')
    console.error('获取教室列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchClassrooms()
}

const handleReset = () => {
  searchFormRef.value?.resetFields()
  Object.assign(searchForm, {
    keyword: '',
    building: '',
    type: '',
    status: ''
  })
  handleSearch()
}

// 处理表格搜索
const handleTableSearch = (keyword: string) => {
  searchForm.keyword = keyword
  pagination.page = 1
  fetchClassrooms()
}

// 处理页码变化
const handlePageChange = (page: number) => {
  pagination.page = page
  fetchClassrooms()
}

// 处理页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchClassrooms()
}

const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

const handleEdit = (row: ExtendedClassroom) => {
  isEdit.value = true
  dialogVisible.value = true
  Object.assign(form, {
    id: row.classroom_id,
    name: row.room_no,
    building: row.building,
    floor: row.floor || 1,
    capacity: row.capacity,
    type: row.room_type || '',
    equipment: row.equipment || [],
    status: row.status
  })
}

const handleDelete = async (row: ExtendedClassroom) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除教室 "${row.room_no}"？此操作不可恢复。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )

    await classroomApi.delete(row.classroom_id)
    ElMessage.success('删除教室成功')
    fetchClassrooms()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除教室失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const data = {
      room_no: form.name,
      building: form.building,
      floor: form.floor,
      capacity: form.capacity,
      room_type: form.type as ClassroomType,
      equipment: form.equipment.join(','),
      ...(isEdit.value && { status: form.status })
    }

    if (isEdit.value) {
      await classroomApi.update(form.id, data)
      ElMessage.success('更新成功')
    } else {
      await classroomApi.create(data)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    fetchClassrooms()
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    }
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleDialogClose = () => {
  resetForm()
  formRef.value?.clearValidate()
}

const resetForm = () => {
  Object.assign(form, {
    id: 0,
    name: '',
    building: '',
    floor: 1,
    capacity: 30,
    type: '',
    equipment: [],
    status: ClassroomStatus.ACTIVE
  })
}

// 设备管理
const removeEquipment = (index: number) => {
  form.equipment.splice(index, 1)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    equipmentInputRef.value?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value && !form.equipment.includes(inputValue.value)) {
    form.equipment.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

// 工具方法
const getStatusType = (status: ClassroomStatus) => {
  const typeMap = {
    [ClassroomStatus.INACTIVE]: 'danger',
    [ClassroomStatus.ACTIVE]: 'success',
    [ClassroomStatus.MAINTENANCE]: 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: ClassroomStatus) => {
  const textMap = {
    [ClassroomStatus.INACTIVE]: '停用',
    [ClassroomStatus.ACTIVE]: '可用',
    [ClassroomStatus.MAINTENANCE]: '维护中'
  }
  return textMap[status] || '未知'
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  fetchClassrooms()
})
</script>

<style lang="scss" scoped>
.classroom-management {
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

  .equipment-section {
    min-height: 32px;
    .el-tag {
      margin-right: 8px;
      margin-bottom: 8px;
    }
  }

  .dialog-footer {
    text-align: right;
  }
}
</style>
