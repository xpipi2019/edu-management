<template>
  <div class="reward-punishment-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>奖惩记录管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>
          新增奖惩记录
        </el-button>
        <el-button @click="showStatistics">
          <el-icon><DataLine /></el-icon>
          统计报表
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
        <el-form-item label="奖惩类型">
          <el-select
            v-model="queryForm.type"
            placeholder="请选择奖惩类型"
            clearable
            style="width: 120px"
          >
            <el-option label="奖励" value="REWARD" />
            <el-option label="处分" value="PUNISHMENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="等级">
          <el-select
            v-model="queryForm.level"
            placeholder="请选择等级"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="(label, value) in levelOptions"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="处理日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryForm.isActive"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="有效" :value="true" />
            <el-option label="已撤销" :value="false" />
          </el-select>
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

    <!-- 奖惩记录列表 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="rewardPunishmentList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="student.studentId" label="学号" width="120" />
        <el-table-column prop="student.user.realName" label="姓名" width="100" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'REWARD' ? 'success' : 'danger'">
              {{ row.type === 'REWARD' ? '奖励' : '处分' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="等级" width="120">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level as keyof typeof levelOptions)">
              {{ levelOptions[row.level as keyof typeof levelOptions] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column prop="reason" label="原因" show-overflow-tooltip />
        <el-table-column prop="date" label="处理日期" width="120" />
        <el-table-column prop="processor.realName" label="处理人" width="100" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isActive" type="success">有效</el-tag>
            <el-tag v-else type="info">已撤销</el-tag>
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
            <el-button
              v-if="row.isActive"
              type="warning"
              size="small"
              @click="handleRevoke(row)"
            >
              撤销
            </el-button>
            <el-popconfirm
              title="确定删除此记录吗？"
              @confirm="handleDelete(row.id)"
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
      :title="editingItem ? '编辑奖惩记录' : '新增奖惩记录'"
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
        <el-form-item label="奖惩类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio label="REWARD">奖励</el-radio>
            <el-radio label="PUNISHMENT">处分</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="等级" prop="level">
          <el-select v-model="formData.level" style="width: 100%">
            <el-option
              v-for="(label, value) in filteredLevelOptions"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="详细原因" prop="reason">
          <el-input
            v-model="formData.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入详细原因"
          />
        </el-form-item>
        <el-form-item label="处理日期" prop="date">
          <el-date-picker
            v-model="formData.date"
            type="date"
            placeholder="请选择处理日期"
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="奖惩记录详情"
      width="600px"
    >
      <el-descriptions v-if="currentItem" :column="2" border>
        <el-descriptions-item label="学号">
          {{ currentItem.student?.studentId }}
        </el-descriptions-item>
        <el-descriptions-item label="姓名">
          {{ currentItem.student?.user?.realName }}
        </el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag :type="currentItem.type === 'REWARD' ? 'success' : 'danger'">
            {{ currentItem.type === 'REWARD' ? '奖励' : '处分' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="等级">
          <el-tag :type="getLevelTagType(currentItem.level as keyof typeof levelOptions)">
            {{ levelOptions[currentItem.level as keyof typeof levelOptions] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">
          {{ currentItem.title }}
        </el-descriptions-item>
        <el-descriptions-item label="详细原因" :span="2">
          {{ currentItem.reason }}
        </el-descriptions-item>
        <el-descriptions-item label="处理日期">
          {{ currentItem.date }}
        </el-descriptions-item>
        <el-descriptions-item label="处理人">
          {{ currentItem.processor?.realName }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="currentItem.isActive" type="success">有效</el-tag>
          <el-tag v-else type="info">已撤销</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ currentItem.createdAt }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ currentItem.remarks || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 统计报表对话框 -->
    <el-dialog
      v-model="statisticsDialogVisible"
      title="奖惩统计报表"
      width="800px"
    >
      <div v-loading="statisticsLoading">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card>
              <template #header>
                <span>总体统计</span>
              </template>
              <el-statistic
                title="总奖励数"
                :value="statistics?.totalRewards || 0"
                suffix="项"
              />
              <el-statistic
                title="总处分数"
                :value="statistics?.totalPunishments || 0"
                suffix="项"
              />
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <template #header>
                <span>奖励分布</span>
              </template>
              <div v-if="statistics?.rewardsByLevel">
                <div
                  v-for="(count, level) in statistics.rewardsByLevel"
                  :key="level"
                  class="level-stat"
                >
                  <span>{{ levelOptions[level as keyof typeof levelOptions] }}:</span>
                  <span class="count">{{ count }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card style="margin-top: 20px;">
          <template #header>
            <span>处分分布</span>
          </template>
          <div v-if="statistics?.punishmentsByLevel">
            <div
              v-for="(count, level) in statistics.punishmentsByLevel"
              :key="level"
              class="level-stat"
            >
              <span>{{ levelOptions[level as keyof typeof levelOptions] }}:</span>
              <span class="count">{{ count }}</span>
            </div>
          </div>
        </el-card>

        <el-card style="margin-top: 20px;">
          <template #header>
            <span>月度趋势</span>
          </template>
          <div v-if="statistics?.monthlyTrend" class="trend-chart">
            <div
              v-for="item in statistics.monthlyTrend"
              :key="item.month"
              class="trend-item"
            >
              <div class="month">{{ item.month }}</div>
              <div class="values">
                <span class="reward">奖励: {{ item.rewards }}</span>
                <span class="punishment">处分: {{ item.punishments }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Search, Refresh, DataLine } from '@element-plus/icons-vue'
import { rewardPunishmentApi } from '@/api/modules/student'
import { userApi } from '@/api/modules/user'
import type {
  RewardPunishment,
  RewardPunishmentQuery,
  CreateRewardPunishmentData,
  UpdateRewardPunishmentData,
  RewardPunishmentType,
  RewardPunishmentLevel,
  RewardPunishmentStatistics
} from '@/types/student'
import type { Student, User, Role } from '@/types/user'

// 等级选项
const levelOptions: Record<RewardPunishmentLevel, string> = {
  // 奖励等级
  PRAISE: '表扬',
  MERIT: '嘉奖',
  THIRD_CLASS_MERIT: '三等功',
  SECOND_CLASS_MERIT: '二等功',
  FIRST_CLASS_MERIT: '一等功',

  // 处分等级
  WARNING: '警告',
  SERIOUS_WARNING: '严重警告',
  DEMERIT: '记过',
  SERIOUS_DEMERIT: '记大过',
  PROBATION: '留校察看',
  EXPULSION: '开除学籍'
}

// 响应式数据
const loading = ref(false)
const rewardPunishmentList = ref<RewardPunishment[]>([])
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const statisticsDialogVisible = ref(false)
const editingItem = ref<RewardPunishment | null>(null)
const currentItem = ref<RewardPunishment | null>(null)
const submitting = ref(false)
const studentLoading = ref(false)
const statisticsLoading = ref(false)
const studentOptions = ref<Student[]>([])
const statistics = ref<RewardPunishmentStatistics | null>(null)

// 搜索表单
const queryForm = reactive<RewardPunishmentQuery>({
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
const formData = reactive<CreateRewardPunishmentData>({
  studentId: 0,
  type: 'REWARD' as RewardPunishmentType,
  level: 'PRAISE' as RewardPunishmentLevel,
  title: '',
  reason: '',
  date: '',
  remarks: ''
})

// 表单引用
const formRef = ref<FormInstance>()

// 表单验证规则
const formRules = {
  studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
  type: [{ required: true, message: '请选择奖惩类型', trigger: 'change' }],
  level: [{ required: true, message: '请选择等级', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入详细原因', trigger: 'blur' }],
  date: [{ required: true, message: '请选择处理日期', trigger: 'change' }]
}

// 计算属性
const filteredLevelOptions = computed(() => {
  if (formData.type === 'REWARD') {
    return {
      PRAISE: levelOptions.PRAISE,
      MERIT: levelOptions.MERIT,
      THIRD_CLASS_MERIT: levelOptions.THIRD_CLASS_MERIT,
      SECOND_CLASS_MERIT: levelOptions.SECOND_CLASS_MERIT,
      FIRST_CLASS_MERIT: levelOptions.FIRST_CLASS_MERIT
    }
  } else {
    return {
      WARNING: levelOptions.WARNING,
      SERIOUS_WARNING: levelOptions.SERIOUS_WARNING,
      DEMERIT: levelOptions.DEMERIT,
      SERIOUS_DEMERIT: levelOptions.SERIOUS_DEMERIT,
      PROBATION: levelOptions.PROBATION,
      EXPULSION: levelOptions.EXPULSION
    }
  }
})

const getLevelTagType = (level: RewardPunishmentLevel) => {
  if (['PRAISE', 'MERIT', 'THIRD_CLASS_MERIT', 'SECOND_CLASS_MERIT', 'FIRST_CLASS_MERIT'].includes(level)) {
    return 'success'
  } else if (['WARNING', 'SERIOUS_WARNING'].includes(level)) {
    return 'warning'
  } else {
    return 'danger'
  }
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
    // 过滤出学生用户
    studentOptions.value = response.list.filter((user: User) =>
      user.roles.some((role: Role) => role.code === 'STUDENT')
    ).map((user: User) => ({
      id: user.id,
      studentId: user.username,
      user
    })) as Student[]
  } catch (error) {
    console.error('搜索学生失败:', error)
  } finally {
    studentLoading.value = false
  }
}

// 获取奖惩记录列表
const fetchRewardPunishments = async () => {
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

    const response = await rewardPunishmentApi.getRewardPunishments(params)
    rewardPunishmentList.value = response.list
    pagination.total = response.total
  } catch (error) {
    console.error('获取奖惩记录列表失败:', error)
    ElMessage.error('获取奖惩记录列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  statisticsLoading.value = true
  try {
    const response = await rewardPunishmentApi.getStatistics()
    statistics.value = response.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    statisticsLoading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchRewardPunishments()
}

// 重置搜索
const handleReset = () => {
  Object.assign(queryForm, {
    studentId: undefined,
    type: undefined,
    level: undefined,
    startDate: undefined,
    endDate: undefined,
    isActive: undefined
  })
  dateRange.value = null
  handleSearch()
}

// 显示新增对话框
const showCreateDialog = () => {
  editingItem.value = null
  dialogVisible.value = true
}

// 显示统计报表
const showStatistics = () => {
  statisticsDialogVisible.value = true
  fetchStatistics()
}

// 查看详情
const handleView = (item: RewardPunishment) => {
  currentItem.value = item
  detailDialogVisible.value = true
}

// 编辑
const handleEdit = (item: RewardPunishment) => {
  editingItem.value = item
  Object.assign(formData, {
    studentId: item.studentId,
    type: item.type,
    level: item.level,
    title: item.title,
    reason: item.reason,
    date: item.date,
    remarks: item.remarks || ''
  })
  dialogVisible.value = true
}

// 撤销
const handleRevoke = async (item: RewardPunishment) => {
  try {
    await ElMessageBox.confirm('确定撤销此奖惩记录吗？', '确认撤销', {
      type: 'warning'
    })

    await rewardPunishmentApi.updateRewardPunishment(item.id, { isActive: false })
    ElMessage.success('撤销成功')
    fetchRewardPunishments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('撤销失败:', error)
      ElMessage.error('撤销失败')
    }
  }
}

// 删除
const handleDelete = async (id: number) => {
  try {
    await rewardPunishmentApi.deleteRewardPunishment(id)
    ElMessage.success('删除成功')
    fetchRewardPunishments()
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
      await rewardPunishmentApi.updateRewardPunishment(editingItem.value.id, formData)
      ElMessage.success('更新成功')
    } else {
      await rewardPunishmentApi.createRewardPunishment(formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchRewardPunishments()
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
    studentId: 0,
    type: 'REWARD' as RewardPunishmentType,
    level: 'PRAISE' as RewardPunishmentLevel,
    title: '',
    reason: '',
    date: '',
    remarks: ''
  })
}

// 初始化
onMounted(() => {
  fetchRewardPunishments()
})
</script>

<style lang="scss" scoped>
.reward-punishment-management {
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

.level-stat {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;

  .count {
    font-weight: bold;
    color: #409EFF;
  }
}

.trend-chart {
  display: flex;
  gap: 16px;
  overflow-x: auto;

  .trend-item {
    min-width: 120px;
    text-align: center;
    padding: 12px;
    border: 1px solid #ebeef5;
    border-radius: 4px;

    .month {
      font-weight: bold;
      margin-bottom: 8px;
    }

    .values {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .reward {
        color: #67c23a;
      }

      .punishment {
        color: #f56c6c;
      }
    }
  }
}
</style>
