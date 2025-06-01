<template>
  <BaseModal
    v-model="visible"
    title="成绩管理"
    width="1000px"
    :show-footer="false"
  >
    <div class="grade-management-dialog">
      <!-- 课程信息 -->
      <el-card class="course-info" shadow="never">
        <div class="course-header">
          <div class="course-details">
            <h3>{{ offering?.course?.name }}</h3>
            <div class="course-meta">
              <el-tag type="info" size="small">{{ offering?.course?.code }}</el-tag>
              <span class="separator">|</span>
              <span>{{ offering?.semester }} {{ offering?.academicYear }}</span>
              <span class="separator">|</span>
              <span>学分：{{ offering?.course?.credits }}</span>
            </div>
          </div>
          <div class="grade-stats">
            <div class="stat-item">
              <span class="stat-label">总人数</span>
              <span class="stat-value">{{ gradeList.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">已录入</span>
              <span class="stat-value text-success">{{ getGradedCount() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">未录入</span>
              <span class="stat-value text-warning">{{ getUngradedCount() }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 操作栏 -->
      <el-card class="action-section" shadow="never">
        <div class="action-bar">
          <div class="search-section">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索学号或姓名"
              clearable
              style="width: 200px"
              prefix-icon="Search"
            />
            <el-select
              v-model="gradeFilter"
              placeholder="成绩筛选"
              clearable
              style="width: 120px; margin-left: 10px"
            >
              <el-option label="已录入" value="graded" />
              <el-option label="未录入" value="ungraded" />
              <el-option label="不及格" value="failed" />
              <el-option label="优秀" value="excellent" />
            </el-select>
          </div>

          <div class="action-buttons">
            <el-button type="primary" @click="handleBatchGrade" :disabled="selectedRows.length === 0">
              批量录入
            </el-button>
            <el-button type="success" @click="handleImport">
              导入成绩
            </el-button>
            <el-button type="info" @click="handleExport">
              导出成绩
            </el-button>
            <el-button type="warning" @click="handleSaveAll" :loading="saving">
              保存全部
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 成绩表格 -->
      <el-card class="table-section" shadow="never">
        <el-table
          ref="tableRef"
          :data="filteredGrades"
          :loading="loading"
          border
          stripe
          height="500"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />

          <el-table-column type="index" label="序号" width="60" align="center" />

          <el-table-column prop="student.studentId" label="学号" width="120" align="center">
            <template #default="{ row }">
              {{ row.student?.studentId || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="student.realName" label="姓名" width="100" align="center">
            <template #default="{ row }">
              {{ row.student?.realName || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="student.className" label="班级" width="120" align="center">
            <template #default="{ row }">
              {{ row.student?.className || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="regularScore" label="平时成绩" width="120" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="row.regularScore"
                :min="0"
                :max="100"
                :precision="1"
                size="small"
                controls-position="right"
                style="width: 100px"
                @change="handleGradeChange(row)"
              />
            </template>
          </el-table-column>

          <el-table-column prop="midtermScore" label="期中成绩" width="120" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="row.midtermScore"
                :min="0"
                :max="100"
                :precision="1"
                size="small"
                controls-position="right"
                style="width: 100px"
                @change="handleGradeChange(row)"
              />
            </template>
          </el-table-column>

          <el-table-column prop="finalScore" label="期末成绩" width="120" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="row.finalScore"
                :min="0"
                :max="100"
                :precision="1"
                size="small"
                controls-position="right"
                style="width: 100px"
                @change="handleGradeChange(row)"
              />
            </template>
          </el-table-column>

          <el-table-column prop="totalScore" label="总成绩" width="100" align="center">
            <template #default="{ row }">
              <span :class="getTotalGradeClass(row.totalScore)">
                {{ row.totalScore || '-' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="gradeLevel" label="等级" width="80" align="center">
            <template #default="{ row }">
              <el-tag
                v-if="row.gradeLevel"
                :type="getGradeLevelColor(row.gradeLevel)"
                size="small"
              >
                {{ row.gradeLevel }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag
                :type="getGradeStatusColor(row)"
                size="small"
              >
                {{ getGradeStatusText(row) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="remarks" label="备注" min-width="150">
            <template #default="{ row }">
              <el-input
                v-model="row.remarks"
                placeholder="请输入备注"
                size="small"
                @change="handleGradeChange(row)"
              />
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                link
                @click="handleSaveGrade(row)"
                :disabled="!row.changed"
              >
                保存
              </el-button>

              <el-button
                type="success"
                size="small"
                link
                @click="handleQuickGrade(row)"
              >
                快速录入
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 成绩统计 -->
      <el-card class="stats-section" shadow="never">
        <template #header>
          <div class="section-header">
            <span>成绩统计</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-value">{{ getAverageGrade() }}</div>
              <div class="stat-label">平均分</div>
            </div>
          </el-col>

          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-value">{{ getPassRate() }}%</div>
              <div class="stat-label">及格率</div>
            </div>
          </el-col>

          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-value">{{ getExcellentRate() }}%</div>
              <div class="stat-label">优秀率</div>
            </div>
          </el-col>

          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-value">{{ getGradeDistribution('A') }}</div>
              <div class="stat-label">A等级</div>
            </div>
          </el-col>

          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-value">{{ getGradeDistribution('B') }}</div>
              <div class="stat-label">B等级</div>
            </div>
          </el-col>

          <el-col :span="4">
            <div class="stat-card">
              <div class="stat-value">{{ getGradeDistribution('C') }}</div>
              <div class="stat-label">C等级</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 批量录入弹窗 -->
    <BatchGradeDialog
      v-model="showBatchDialog"
      :students="selectedRows"
      @success="handleBatchSuccess"
    />

    <!-- 快速录入弹窗 -->
    <QuickGradeDialog
      v-model="showQuickDialog"
      :grade="currentGrade"
      @success="handleQuickSuccess"
    />
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, type TableInstance } from 'element-plus'
import BaseModal from '@/components/common/BaseModal/index.vue'
import BatchGradeDialog from './BatchGradeDialog.vue'
import QuickGradeDialog from './QuickGradeDialog.vue'
import { gradeApi } from '@/api/modules/course'
import type { CourseOffering, Grade, Enrollment } from '@/types/course'

// 扩展成绩接口用于显示
interface GradeDisplay extends Grade {
  student?: {
    id: number
    studentId: string
    realName: string
    className: string
  }
  changed?: boolean
  regularScore?: number
  midtermScore?: number
  finalScore?: number
  totalScore?: number
  gradeLevel?: string
  remarks?: string
}

interface Props {
  modelValue: boolean
  offering?: CourseOffering | null
}

interface Emits {
  (e: 'update:modelValue', visible: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  offering: null
})

const emit = defineEmits<Emits>()

// 表格引用
const tableRef = ref<TableInstance>()

// 弹窗状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 加载状态
const loading = ref(false)
const saving = ref(false)

// 成绩列表数据
const gradeList = ref<GradeDisplay[]>([])
const selectedRows = ref<GradeDisplay[]>([])

// 搜索和筛选
const searchKeyword = ref('')
const gradeFilter = ref('')

// 弹窗相关
const showBatchDialog = ref(false)
const showQuickDialog = ref(false)
const currentGrade = ref<GradeDisplay | null>(null)

// 计算属性
const filteredGrades = computed(() => {
  let filtered = [...gradeList.value]

  // 搜索过滤
  if (searchKeyword.value) {
    filtered = filtered.filter(grade =>
      grade.student?.studentId?.includes(searchKeyword.value) ||
      grade.student?.realName?.includes(searchKeyword.value)
    )
  }

  // 成绩筛选
  if (gradeFilter.value) {
    switch (gradeFilter.value) {
      case 'graded':
        filtered = filtered.filter(grade => grade.totalScore !== null && grade.totalScore !== undefined)
        break
      case 'ungraded':
        filtered = filtered.filter(grade => grade.totalScore === null || grade.totalScore === undefined)
        break
      case 'failed':
        filtered = filtered.filter(grade => grade.totalScore !== null && grade.totalScore !== undefined && grade.totalScore < 60)
        break
      case 'excellent':
        filtered = filtered.filter(grade => grade.totalScore !== null && grade.totalScore !== undefined && grade.totalScore >= 90)
        break
    }
  }

  return filtered
})

// 工具函数
const calculateTotalGrade = (grade: GradeDisplay): number => {
  const usual = grade.regularScore || 0
  const midterm = grade.midtermScore || 0
  const final = grade.finalScore || 0

  // 权重：平时30%，期中30%，期末40%
  return Math.round(usual * 0.3 + midterm * 0.3 + final * 0.4)
}

const getGradeLevel = (totalScore: number): string => {
  if (totalScore >= 90) return 'A'
  if (totalScore >= 80) return 'B'
  if (totalScore >= 70) return 'C'
  if (totalScore >= 60) return 'D'
  return 'F'
}

const getTotalGradeClass = (totalScore?: number): string => {
  if (!totalScore) return ''
  if (totalScore >= 90) return 'text-excellent'
  if (totalScore >= 60) return 'text-pass'
  return 'text-fail'
}

const getGradeLevelColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    'A': 'success',
    'B': 'primary',
    'C': 'warning',
    'D': 'info',
    'F': 'danger'
  }
  return colorMap[level] || 'info'
}

const getGradeStatusColor = (grade: GradeDisplay) => {
  if (grade.totalScore === null || grade.totalScore === undefined) {
    return 'info'
  }
  return grade.totalScore >= 60 ? 'success' : 'danger'
}

const getGradeStatusText = (grade: GradeDisplay): string => {
  if (grade.totalScore === null || grade.totalScore === undefined) {
    return '未录入'
  }
  return grade.totalScore >= 60 ? '及格' : '不及格'
}

const getGradedCount = (): number => {
  return gradeList.value.filter(grade =>
    grade.totalScore !== null && grade.totalScore !== undefined
  ).length
}

const getUngradedCount = (): number => {
  return gradeList.value.filter(grade =>
    grade.totalScore === null || grade.totalScore === undefined
  ).length
}

const getAverageGrade = (): string => {
  const gradedList = gradeList.value.filter(grade =>
    grade.totalScore !== null && grade.totalScore !== undefined
  )
  if (gradedList.length === 0) return '0'

  const sum = gradedList.reduce((total, grade) => total + (grade.totalScore || 0), 0)
  return (sum / gradedList.length).toFixed(1)
}

const getPassRate = (): string => {
  const gradedList = gradeList.value.filter(grade =>
    grade.totalScore !== null && grade.totalScore !== undefined
  )
  if (gradedList.length === 0) return '0'

  const passCount = gradedList.filter(grade => (grade.totalScore || 0) >= 60).length
  return ((passCount / gradedList.length) * 100).toFixed(1)
}

const getExcellentRate = (): string => {
  const gradedList = gradeList.value.filter(grade =>
    grade.totalScore !== null && grade.totalScore !== undefined
  )
  if (gradedList.length === 0) return '0'

  const excellentCount = gradedList.filter(grade => (grade.totalScore || 0) >= 90).length
  return ((excellentCount / gradedList.length) * 100).toFixed(1)
}

const getGradeDistribution = (level: string): number => {
  return gradeList.value.filter(grade => grade.gradeLevel === level).length
}

// 数据获取函数
const fetchGrades = async () => {
  if (!props.offering) return

  try {
    loading.value = true
    // 模拟成绩数据
    const mockGrades: GradeDisplay[] = [
      {
        id: 1,
        enrollmentId: 1,
        student: { id: 1, studentId: '2021001', realName: '张三', className: '计科2101班' },
        regularScore: 85,
        midtermScore: 78,
        finalScore: 82,
        totalScore: 82,
        gradeLevel: 'B',
        remarks: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        enrollmentId: 2,
        student: { id: 2, studentId: '2021002', realName: '李四', className: '计科2101班' },
        regularScore: 92,
        midtermScore: 88,
        finalScore: 90,
        totalScore: 90,
        gradeLevel: 'A',
        remarks: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        enrollmentId: 3,
        student: { id: 3, studentId: '2021003', realName: '王五', className: '软工2101班' },
        regularScore: 75,
        midtermScore: 72,
        finalScore: 68,
        totalScore: 71,
        gradeLevel: 'C',
        remarks: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 4,
        enrollmentId: 4,
        student: { id: 4, studentId: '2021004', realName: '赵六', className: '数据2101班' },
        remarks: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 5,
        enrollmentId: 5,
        student: { id: 5, studentId: '2021005', realName: '孙七', className: '计科2102班' },
        remarks: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    gradeList.value = mockGrades
  } catch (error: any) {
    ElMessage.error(error.message || '获取成绩列表失败')
  } finally {
    loading.value = false
  }
}

// 事件处理函数
const handleGradeChange = (grade: GradeDisplay) => {
  // 计算总成绩
  if (grade.regularScore || grade.midtermScore || grade.finalScore) {
    grade.totalScore = calculateTotalGrade(grade)
    grade.gradeLevel = getGradeLevel(grade.totalScore)
  }

  grade.changed = true
}

const handleSelectionChange = (selection: GradeDisplay[]) => {
  selectedRows.value = selection
}

const handleSaveGrade = async (grade: GradeDisplay) => {
  try {
    await gradeApi.updateGrade(grade.id, {
      regularScore: grade.regularScore,
      midtermScore: grade.midtermScore,
      finalScore: grade.finalScore,
      totalScore: grade.totalScore,
      gradeLevel: grade.gradeLevel
    })

    grade.changed = false
    ElMessage.success('保存成绩成功')
  } catch (error: any) {
    ElMessage.error(error.message || '保存成绩失败')
  }
}

const handleSaveAll = async () => {
  const changedGrades = gradeList.value.filter(grade => grade.changed)
  if (changedGrades.length === 0) {
    ElMessage.info('没有需要保存的成绩')
    return
  }

  try {
    saving.value = true
    await gradeApi.batchUpdateGrades({
      grades: changedGrades.map(grade => ({
        enrollmentId: grade.enrollmentId,
        regularScore: grade.regularScore,
        midtermScore: grade.midtermScore,
        finalScore: grade.finalScore
      }))
    })

    changedGrades.forEach(grade => grade.changed = false)
    ElMessage.success('批量保存成功')
  } catch (error: any) {
    ElMessage.error(error.message || '批量保存失败')
  } finally {
    saving.value = false
  }
}

const handleBatchGrade = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要批量录入的学生')
    return
  }
  showBatchDialog.value = true
}

const handleQuickGrade = (grade: GradeDisplay) => {
  currentGrade.value = grade
  showQuickDialog.value = true
}

const handleImport = () => {
  ElMessage.info('导入成绩功能待实现')
}

const handleExport = () => {
  ElMessage.info('导出成绩功能待实现')
}

const handleBatchSuccess = () => {
  fetchGrades()
}

const handleQuickSuccess = () => {
  fetchGrades()
}

// 监听开课变化
watch(
  () => props.offering,
  (offering) => {
    if (offering && props.modelValue) {
      fetchGrades()
    }
  },
  { immediate: true }
)

// 监听弹窗显示状态
watch(
  () => props.modelValue,
  (show) => {
    if (show && props.offering) {
      fetchGrades()
    }
  }
)
</script>

<style lang="scss" scoped>
.grade-management-dialog {
  .course-info {
    margin-bottom: 16px;

    .course-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .course-details {
        h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: $text-primary;
        }

        .course-meta {
          display: flex;
          align-items: center;
          color: $text-secondary;
          font-size: 14px;

          .separator {
            margin: 0 8px;
            color: $border-base;
          }
        }
      }

      .grade-stats {
        display: flex;
        gap: 20px;

        .stat-item {
          text-align: center;

          .stat-label {
            display: block;
            font-size: 12px;
            color: $text-secondary;
            margin-bottom: 4px;
          }

          .stat-value {
            display: block;
            font-size: 20px;
            font-weight: 600;
            color: $text-primary;

            &.text-success {
              color: $success-color;
            }

            &.text-warning {
              color: $warning-color;
            }
          }
        }
      }
    }
  }

  .action-section {
    margin-bottom: 16px;

    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .search-section {
        display: flex;
        align-items: center;
      }

      .action-buttons {
        display: flex;
        gap: 10px;
      }
    }
  }

  .table-section {
    margin-bottom: 16px;

    :deep(.el-input-number) {
      .el-input__inner {
        text-align: center;
      }
    }
  }

  .stats-section {
    .section-header {
      font-weight: 600;
      color: $text-primary;
    }

    .stat-card {
      text-align: center;
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e4e7ed;

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: $text-primary;
        line-height: 1;
      }

      .stat-label {
        font-size: 12px;
        color: $text-secondary;
        margin-top: 4px;
      }
    }
  }

  .text-excellent {
    color: $success-color;
    font-weight: 600;
  }

  .text-pass {
    color: $primary-color;
  }

  .text-fail {
    color: $danger-color;
    font-weight: 600;
  }
}
</style>
