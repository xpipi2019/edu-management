<template>
  <div class="classroom-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>教室管理</span>
          <el-button
            type="primary"
            :icon="Plus"
            @click="handleAdd"
            v-if="hasPermission(Permission.CLASSROOM_MANAGE)"
          >
            新增教室
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选区域 -->
      <div class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchForm.keyword"
              placeholder="请输入教室名称或建筑名称"
              :prefix-icon="Search"
              clearable
              @input="debouncedSearch"
            />
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="searchForm.building"
              placeholder="选择建筑"
              clearable
              @change="handleSearch"
            >
              <el-option
                v-for="building in buildingOptions"
                :key="building"
                :label="building"
                :value="building"
              />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="searchForm.type"
              placeholder="选择类型"
              clearable
              @change="handleSearch"
            >
              <el-option
                v-for="type in typeOptions"
                :key="type"
                :label="type"
                :value="type"
              />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="searchForm.status"
              placeholder="选择状态"
              clearable
              @change="handleSearch"
            >
              <el-option
                v-for="status in statusOptions"
                :key="status.value"
                :label="status.label"
                :value="status.value"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" :icon="Search" @click="handleSearch">
              搜索
            </el-button>
            <el-button :icon="Refresh" @click="handleReset">
              重置
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 教室列表 -->
      <el-table
        v-loading="loading"
        :data="classroomList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="教室名称" width="120" />
        <el-table-column prop="building" label="建筑" width="100" />
        <el-table-column prop="floor" label="楼层" width="80" />
        <el-table-column prop="capacity" label="容量" width="80" />
        <el-table-column prop="type" label="类型" width="120" />
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
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="180"
          fixed="right"
          v-if="hasPermission(Permission.CLASSROOM_MANAGE)"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除这个教室吗？"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
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
                  v-for="type in typeOptions"
                  :key="type"
                  :label="type"
                  :value="type"
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'
import { classroomApi } from '@/api/modules/classroom'
import { usePermission } from '@/composables/usePermission'
import { Permission } from '@/constants/permission'
import { ClassroomStatus } from '@/types/course'
import type { Classroom } from '@/types/course'
import type { FormInstance, FormRules } from 'element-plus'
import type { ApiResponse, PageResponse } from '@/types/common'

// 扩展教室类型以包含可选的floor和equipment字段
interface ExtendedClassroom extends Classroom {
  floor?: number
  equipment?: string[]
}

const { hasPermission } = usePermission()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const inputVisible = ref(false)
const inputValue = ref('')

const classroomList = ref<ExtendedClassroom[]>([])
const searchForm = reactive({
  keyword: '',
  building: '',
  type: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: 0,
  name: '',
  building: '',
  floor: 1,
  capacity: 30,
  type: '',
  equipment: [] as string[],
  status: ClassroomStatus.AVAILABLE
})

// 表单引用
const formRef = ref<FormInstance>()
const equipmentInputRef = ref()

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑教室' : '新增教室')

// 选项数据
const buildingOptions = ['A栋', 'B栋', 'C栋', 'D栋', 'E栋']
const typeOptions = ['普通教室', '阶梯教室', '实验室', '机房', '多媒体教室']
const statusOptions = [
  { label: '可用', value: ClassroomStatus.AVAILABLE },
  { label: '占用中', value: ClassroomStatus.OCCUPIED },
  { label: '维护中', value: ClassroomStatus.MAINTENANCE },
  { label: '停用', value: ClassroomStatus.DISABLED }
]

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入教室名称', trigger: 'blur' },
    { min: 2, max: 20, message: '教室名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  building: [
    { required: true, message: '请输入建筑名称', trigger: 'blur' }
  ],
  floor: [
    { required: true, message: '请选择楼层', trigger: 'blur' }
  ],
  capacity: [
    { required: true, message: '请输入容量', trigger: 'blur' },
    { type: 'number', min: 1, max: 500, message: '容量范围在 1 到 500', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择教室类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 防抖搜索
const debouncedSearch = debounce(() => {
  handleSearch()
}, 300)

// 方法
const fetchClassrooms = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      name: searchForm.keyword,
      building: searchForm.building,
      type: searchForm.type,
      status: searchForm.status as ClassroomStatus || undefined
    }

    const response = await classroomApi.getClassrooms(params)
    classroomList.value = response.list
    pagination.total = response.total
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
  Object.assign(searchForm, {
    keyword: '',
    building: '',
    type: '',
    status: ''
  })
  handleSearch()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchClassrooms()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
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
    id: row.id,
    name: row.name,
    building: row.building,
    floor: row.floor || 1,
    capacity: row.capacity,
    type: row.type || '',
    equipment: [...(row.equipment || [])],
    status: row.status
  })
}

const handleDelete = async (id: number) => {
  try {
    await classroomApi.deleteClassroom(id)
    ElMessage.success('删除成功')
    fetchClassrooms()
  } catch (error) {
    ElMessage.error('删除失败')
    console.error('删除教室失败:', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const data = {
      name: form.name,
      building: form.building,
      floor: form.floor,
      capacity: form.capacity,
      type: form.type,
      equipment: form.equipment,
      ...(isEdit.value && { status: form.status })
    }

    if (isEdit.value) {
      await classroomApi.updateClassroom(form.id, data)
      ElMessage.success('更新成功')
    } else {
      await classroomApi.createClassroom(data)
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
    status: ClassroomStatus.AVAILABLE
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
    [ClassroomStatus.AVAILABLE]: 'success',
    [ClassroomStatus.OCCUPIED]: 'warning',
    [ClassroomStatus.MAINTENANCE]: 'info',
    [ClassroomStatus.DISABLED]: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: ClassroomStatus) => {
  const textMap = {
    [ClassroomStatus.AVAILABLE]: '可用',
    [ClassroomStatus.OCCUPIED]: '占用中',
    [ClassroomStatus.MAINTENANCE]: '维护中',
    [ClassroomStatus.DISABLED]: '停用'
  }
  return textMap[status] || '未知'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  fetchClassrooms()
})
</script>

<style scoped lang="scss">
.classroom-management {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
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
