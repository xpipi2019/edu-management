<template>
  <div class="student-status-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>学籍状态管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>
          新增学籍状态
        </el-button>
      </div>
    </div>

    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="queryForm" inline class="search-form">
        <el-form-item label="学生学号">
          <el-input
            v-model="queryForm.student_id"
            placeholder="请输入学生学号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态类型">
          <el-select
            v-model="queryForm.status_type"
            placeholder="请选择状态类型"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="(label, value) in statusTypeOptions"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生效日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 学籍状态列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="statusList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="student.student_no" label="学号" width="120" />
        <el-table-column prop="student.user.real_name" label="姓名" width="100" />
        <el-table-column prop="status_type" label="状态类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTypeTagType(row.status_type as StudentStatusType)">
              {{ row.status_type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="effective_date" label="生效日期" width="120" />
        <el-table-column prop="end_date" label="结束日期" width="120">
          <template #default="{ row }">
            {{ row.end_date || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" show-overflow-tooltip />
        <el-table-column prop="handler.real_name" label="处理人" width="100">
          <template #default="{ row }">
            {{ row.handler?.real_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              title="确定删除此记录吗？"
              @confirm="handleDelete(row.status_id)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  size="small"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingItem ? '编辑学籍状态' : '新增学籍状态'"
      width="600px"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="学生" prop="student_id">
          <UserSelector
            v-model="formData.student_id"
            user-type="student"
            @change="handleStudentChange"
          />
        </el-form-item>
        <el-form-item label="状态类型" prop="status_type">
          <el-select v-model="formData.status_type" style="width: 100%">
            <el-option
              v-for="(label, value) in statusTypeOptions"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生效日期" prop="effective_date">
          <el-date-picker
            v-model="formData.effective_date"
            type="date"
            placeholder="请选择生效日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="formData.end_date"
            type="date"
            placeholder="请选择结束日期（可选）"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="原因">
          <el-input
            v-model="formData.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="学籍状态详情"
      width="600px"
    >
      <el-descriptions v-if="currentItem" :column="2" border>
        <el-descriptions-item label="学号">
          {{ currentItem.student?.student_no }}
        </el-descriptions-item>
        <el-descriptions-item label="姓名">
          {{ currentItem.student?.user?.real_name }}
        </el-descriptions-item>
        <el-descriptions-item label="状态类型">
          {{ currentItem.status_type }}
        </el-descriptions-item>
        <el-descriptions-item label="生效日期">
          {{ currentItem.effective_date }}
        </el-descriptions-item>
        <el-descriptions-item label="结束日期">
          {{ currentItem.end_date || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="处理人">
          {{ currentItem.handler?.real_name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="原因" :span="2">
          {{ currentItem.reason || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ formatDateTime(currentItem.created_at) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import studentStatusApi from '@/api/modules/student-status'
import type {
  StudentStatus,
  StudentStatusQuery,
  CreateStudentStatusData,
  UpdateStudentStatusData
} from '@/types/database'
import { StudentStatusType } from '@/types/database'
import type { User } from '@/types/database'
import UserSelector from '@/components/business/UserSelector/index.vue'

// 状态类型选项
const statusTypeOptions: Record<StudentStatusType, string> = {
  [StudentStatusType.ENROLLED]: '在读',
  [StudentStatusType.SUSPENDED]: '休学',
  [StudentStatusType.GRADUATED]: '毕业'
}

// 响应式数据
const loading = ref(false)
const statusList = ref<StudentStatus[]>([])
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const editingItem = ref<StudentStatus | null>(null)
const currentItem = ref<StudentStatus | null>(null)
const submitting = ref(false)

// 搜索表单
const queryForm = reactive<StudentStatusQuery>({
  page: 1,
  pageSize: 20
})

const dateRange = ref<[Date, Date] | null>(null)

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 表单数据
const formData = reactive<CreateStudentStatusData>({
  student_id: 0,
  status_type: StudentStatusType.ENROLLED,
  effective_date: '',
  end_date: undefined,
  reason: ''
})

// 表单引用
const formRef = ref<FormInstance>()

// 表单验证规则
const formRules = {
  student_id: [{ required: true, message: '请选择学生', trigger: 'change' }],
  status_type: [{ required: true, message: '请选择状态类型', trigger: 'change' }],
  effective_date: [{ required: true, message: '请选择生效日期', trigger: 'change' }]
}

// 计算属性
const getStatusTypeTagType = (type: StudentStatusType) => {
  const typeMap = {
    [StudentStatusType.ENROLLED]: 'success',
    [StudentStatusType.SUSPENDED]: 'warning',
    [StudentStatusType.GRADUATED]: 'success'
  }
  return typeMap[type] || 'info'
}

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 获取学籍状态列表
const fetchStatusList = async () => {
  loading.value = true
  try {
    const params = {
      ...queryForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    }

    // 处理日期范围
    if (dateRange.value) {
      params.start_date = dateRange.value[0].toISOString().split('T')[0]
      params.end_date = dateRange.value[1].toISOString().split('T')[0]
    }

    const response = await studentStatusApi.getList(params)
    statusList.value = response.data.list
    pagination.total = response.data.total
  } catch (error) {
    console.error('获取学籍状态列表失败:', error)
    ElMessage.error('获取学籍状态列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchStatusList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(queryForm, {
    student_id: undefined,
    status_type: undefined,
    start_date: undefined,
    end_date: undefined
  })
  dateRange.value = null
  handleSearch()
}

// 显示新增对话框
const showCreateDialog = () => {
  editingItem.value = null
  dialogVisible.value = true
}

// 查看详情
const handleView = (item: StudentStatus) => {
  currentItem.value = item
  detailDialogVisible.value = true
}

// 编辑
const handleEdit = (item: StudentStatus) => {
  editingItem.value = item
  Object.assign(formData, {
    student_id: item.student_id,
    status_type: item.status_type,
    effective_date: item.effective_date,
    end_date: item.end_date || undefined,
    reason: item.reason || ''
  })
  dialogVisible.value = true
}

// 删除
const handleDelete = async (id: number) => {
  try {
    await studentStatusApi.delete(id)
    ElMessage.success('删除成功')
    fetchStatusList()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate()
  if (!valid) return

  submitting.value = true
  try {
    if (editingItem.value) {
      await studentStatusApi.update(editingItem.value.status_id, formData)
      ElMessage.success('更新成功')
    } else {
      await studentStatusApi.create(formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchStatusList()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(formData, {
    student_id: 0,
    status_type: StudentStatusType.ENROLLED,
    effective_date: '',
    end_date: undefined,
    reason: ''
  })
}

// 处理学生选择变化
const handleStudentChange = (user?: User) => {
  console.log('选择的学生:', user)
}

// 初始化
onMounted(() => {
  fetchStatusList()
})
</script>

<style lang="scss" scoped>
.student-status-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    color: #303133;
  }
}

.search-card {
  margin-bottom: 20px;

  .search-form {
    margin: 0;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
