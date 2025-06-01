<template>
  <div class="student-status-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>学籍状态管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>
          新增状态变更
        </el-button>
      </div>
    </div>

    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="queryForm" inline class="search-form">
        <el-form-item label="学生学号">
          <el-input
            v-model="queryForm.studentId"
            placeholder="请输入学生学号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="变更类型">
          <el-select
            v-model="queryForm.changeType"
            placeholder="请选择变更类型"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="(label, value) in statusChangeTypeOptions"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="变更日期">
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

    <!-- 状态变更列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="statusChangeList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="student.studentId" label="学号" width="120" />
        <el-table-column prop="student.user.realName" label="姓名" width="100" />
        <el-table-column prop="changeType" label="变更类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getChangeTypeTagType(row.changeType as StudentStatusChangeType)">
              {{ statusChangeTypeOptions[row.changeType as StudentStatusChangeType] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fromStatus" label="原状态" width="100" />
        <el-table-column prop="toStatus" label="新状态" width="100" />
        <el-table-column prop="reason" label="变更原因" show-overflow-tooltip />
        <el-table-column prop="effectiveDate" label="生效日期" width="120" />
        <el-table-column label="审批状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.approvedAt" type="success">已审批</el-tag>
            <el-tag v-else type="warning">待审批</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approver.realName" label="审批人" width="100" />
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
              v-if="!row.approvedAt"
              type="success"
              size="small"
              @click="handleApprove(row)"
            >
              审批
            </el-button>
            <el-button
              v-if="!row.approvedAt"
              type="primary"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              title="确定删除此记录吗？"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button
                  v-if="!row.approvedAt"
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
      :title="editingItem ? '编辑状态变更' : '新增状态变更'"
      width="600px"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="学生" prop="studentId">
          <el-select
            v-model="formData.studentId"
            placeholder="请选择学生"
            filterable
            remote
            :remote-method="searchStudents"
            :loading="studentLoading"
            style="width: 100%"
          >
            <el-option
              v-for="student in studentOptions"
              :key="student.id"
              :label="`${student.studentId} - ${student.user.realName}`"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="变更类型" prop="changeType">
          <el-select v-model="formData.changeType" style="width: 100%">
            <el-option
              v-for="(label, value) in statusChangeTypeOptions"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="原状态" prop="fromStatus">
          <el-input v-model="formData.fromStatus" placeholder="请输入原状态" />
        </el-form-item>
        <el-form-item label="新状态" prop="toStatus">
          <el-input v-model="formData.toStatus" placeholder="请输入新状态" />
        </el-form-item>
        <el-form-item label="变更原因" prop="reason">
          <el-input
            v-model="formData.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入变更原因"
          />
        </el-form-item>
        <el-form-item label="生效日期" prop="effectiveDate">
          <el-date-picker
            v-model="formData.effectiveDate"
            type="date"
            placeholder="请选择生效日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="formData.remarks"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
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

    <!-- 审批对话框 -->
    <el-dialog
      v-model="approveDialogVisible"
      title="审批状态变更"
      width="500px"
    >
      <el-form
        ref="approveFormRef"
        :model="approveForm"
        label-width="100px"
      >
        <el-form-item label="审批结果" prop="approved">
          <el-radio-group v-model="approveForm.approved">
            <el-radio :label="true">通过</el-radio>
            <el-radio :label="false">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input
            v-model="approveForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleApproveSubmit" :loading="approving">
          提交审批
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="状态变更详情"
      width="600px"
    >
      <el-descriptions v-if="currentItem" :column="2" border>
        <el-descriptions-item label="学号">
          {{ currentItem.student?.studentId }}
        </el-descriptions-item>
        <el-descriptions-item label="姓名">
          {{ currentItem.student?.user?.realName }}
        </el-descriptions-item>
        <el-descriptions-item label="变更类型">
          {{ statusChangeTypeOptions[currentItem.changeType] }}
        </el-descriptions-item>
        <el-descriptions-item label="原状态">
          {{ currentItem.fromStatus }}
        </el-descriptions-item>
        <el-descriptions-item label="新状态">
          {{ currentItem.toStatus }}
        </el-descriptions-item>
        <el-descriptions-item label="生效日期">
          {{ currentItem.effectiveDate }}
        </el-descriptions-item>
        <el-descriptions-item label="变更原因" :span="2">
          {{ currentItem.reason }}
        </el-descriptions-item>
        <el-descriptions-item label="审批状态">
          <el-tag v-if="currentItem.approvedAt" type="success">已审批</el-tag>
          <el-tag v-else type="warning">待审批</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审批人">
          {{ currentItem.approver?.realName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="审批时间">
          {{ currentItem.approvedAt || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ currentItem.createdAt }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ currentItem.remarks || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { studentStatusApi } from '@/api/modules/student'
import { userApi } from '@/api/modules/user'
import type {
  StudentStatusChange,
  StudentStatusChangeQuery,
  CreateStudentStatusChangeData,
  UpdateStudentStatusChangeData,
  ApproveStudentStatusChangeData,
  StudentStatusChangeType
} from '@/types/student'
import type { Student, User, Role } from '@/types/user'

// 状态变更类型选项
const statusChangeTypeOptions: Record<StudentStatusChangeType, string> = {
  ENROLLMENT: '入学',
  SUSPENSION: '休学',
  RESUMPTION: '复学',
  WITHDRAWAL: '退学',
  GRADUATION: '毕业',
  TRANSFER_IN: '转入',
  TRANSFER_OUT: '转出',
  MAJOR_CHANGE: '转专业'
}

// 响应式数据
const loading = ref(false)
const statusChangeList = ref<StudentStatusChange[]>([])
const dialogVisible = ref(false)
const approveDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const editingItem = ref<StudentStatusChange | null>(null)
const currentItem = ref<StudentStatusChange | null>(null)
const submitting = ref(false)
const approving = ref(false)
const studentLoading = ref(false)
const studentOptions = ref<Student[]>([])

// 搜索表单
const queryForm = reactive<StudentStatusChangeQuery>({
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
const formData = reactive<CreateStudentStatusChangeData>({
  studentId: 0,
  changeType: 'ENROLLMENT' as StudentStatusChangeType,
  fromStatus: '',
  toStatus: '',
  reason: '',
  effectiveDate: '',
  remarks: ''
})

// 审批表单数据
const approveForm = reactive<ApproveStudentStatusChangeData>({
  approved: true,
  remarks: ''
})

// 表单引用
const formRef = ref<FormInstance>()
const approveFormRef = ref<FormInstance>()

// 表单验证规则
const formRules = {
  studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
  changeType: [{ required: true, message: '请选择变更类型', trigger: 'change' }],
  toStatus: [{ required: true, message: '请输入新状态', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入变更原因', trigger: 'blur' }],
  effectiveDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }]
}

// 计算属性
const getChangeTypeTagType = (type: StudentStatusChangeType) => {
  const typeMap = {
    ENROLLMENT: 'success',
    SUSPENSION: 'warning',
    RESUMPTION: 'success',
    WITHDRAWAL: 'danger',
    GRADUATION: 'success',
    TRANSFER_IN: 'primary',
    TRANSFER_OUT: 'info',
    MAJOR_CHANGE: 'primary'
  }
  return typeMap[type] || 'info'
}

// 搜索学生
const searchStudents = async (query: string) => {
  if (!query) return

  studentLoading.value = true
  try {
    const response = await userApi.getUsers({
      page: 1,
      pageSize: 20,
      username: query
    })
    // 这里需要过滤出学生用户
    studentOptions.value = response.list.filter((user: User) =>
      user.roles.some((role: Role) => role.code === 'STUDENT')
    ).map((user: User) => ({
      id: user.id,
      studentId: user.username, // 假设username就是学号
      user
    })) as Student[]
  } catch (error) {
    console.error('搜索学生失败:', error)
  } finally {
    studentLoading.value = false
  }
}

// 获取状态变更列表
const fetchStatusChanges = async () => {
  loading.value = true
  try {
    const params = {
      ...queryForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    }

    // 处理日期范围
    if (dateRange.value) {
      params.startDate = dateRange.value[0].toISOString().split('T')[0]
      params.endDate = dateRange.value[1].toISOString().split('T')[0]
    }

    const response = await studentStatusApi.getStatusChanges(params)
    statusChangeList.value = response.list
    pagination.total = response.total
  } catch (error) {
    console.error('获取状态变更列表失败:', error)
    ElMessage.error('获取状态变更列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchStatusChanges()
}

// 重置搜索
const handleReset = () => {
  Object.assign(queryForm, {
    studentId: undefined,
    changeType: undefined,
    startDate: undefined,
    endDate: undefined
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
const handleView = (item: StudentStatusChange) => {
  currentItem.value = item
  detailDialogVisible.value = true
}

// 编辑
const handleEdit = (item: StudentStatusChange) => {
  editingItem.value = item
  Object.assign(formData, {
    studentId: item.studentId,
    changeType: item.changeType,
    fromStatus: item.fromStatus || '',
    toStatus: item.toStatus,
    reason: item.reason,
    effectiveDate: item.effectiveDate,
    remarks: item.remarks || ''
  })
  dialogVisible.value = true
}

// 审批
const handleApprove = (item: StudentStatusChange) => {
  currentItem.value = item
  approveForm.approved = true
  approveForm.remarks = ''
  approveDialogVisible.value = true
}

// 删除
const handleDelete = async (id: number) => {
  try {
    await studentStatusApi.deleteStatusChange(id)
    ElMessage.success('删除成功')
    fetchStatusChanges()
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
      await studentStatusApi.updateStatusChange(editingItem.value.id, formData)
      ElMessage.success('更新成功')
    } else {
      await studentStatusApi.createStatusChange(formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchStatusChanges()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 提交审批
const handleApproveSubmit = async () => {
  if (!currentItem.value) return

  approving.value = true
  try {
    await studentStatusApi.approveStatusChange(currentItem.value.id, approveForm)
    ElMessage.success('审批成功')
    approveDialogVisible.value = false
    fetchStatusChanges()
  } catch (error) {
    console.error('审批失败:', error)
    ElMessage.error('审批失败')
  } finally {
    approving.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(formData, {
    studentId: 0,
    changeType: 'ENROLLMENT' as StudentStatusChangeType,
    fromStatus: '',
    toStatus: '',
    reason: '',
    effectiveDate: '',
    remarks: ''
  })
}

// 初始化
onMounted(() => {
  fetchStatusChanges()
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
