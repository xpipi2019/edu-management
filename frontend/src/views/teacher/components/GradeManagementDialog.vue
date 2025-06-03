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
            <h3>{{ offering?.course?.course_name }}</h3>
            <div class="course-meta">
              <el-tag type="info" size="small">{{ offering?.course?.course_code }}</el-tag>
              <span class="separator">|</span>
              <span>{{ offering?.semester }}</span>
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

          <el-table-column prop="student.student_no" label="学号" width="120" align="center">
            <template #default="{ row }">
              {{ row.student?.student_no || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="student.real_name" label="姓名" width="100" align="center">
            <template #default="{ row }">
              {{ row.student?.real_name || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="student.class_name" label="班级" width="120" align="center">
            <template #default="{ row }">
              {{ row.student?.class_name || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="usual_score" label="平时成绩" width="120" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="row.usual_score"
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

          <el-table-column prop="exam_score" label="期中成绩" width="120" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="row.exam_score"
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

          <el-table-column prop="final_score" label="期末成绩" width="120" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="row.final_score"
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

          <el-table-column prop="grade_point" label="成绩点" width="100" align="center">
            <template #default="{ row }">
              <span :class="getTotalGradeClass(row.final_score)">
                {{ row.grade_point || '-' }}
              </span>
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
      :key="'batch-' + selectedRows.length"
      @success="handleBatchSuccess"
    />

    <!-- 快速录入弹窗 -->
    <QuickGradeDialog
      v-model="showQuickDialog"
      :grade="currentGrade"
      :key="currentGrade?.grade_id || 'quick'"
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
import { gradeApi } from '@/api/modules'
import type { CourseOffering, Grade, Enrollment } from '@/types/database'

// 扩展成绩接口用于显示
interface GradeDisplay extends Grade {
  student?: {
    id: number
    student_no: string
    real_name: string
    class_name: string
  }
  changed?: boolean
  usual_score?: number
  exam_score?: number
  final_score?: number
  grade_point?: number
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
      grade.student?.student_no?.includes(searchKeyword.value) ||
      grade.student?.real_name?.includes(searchKeyword.value)
    )
  }

  // 成绩筛选
  if (gradeFilter.value) {
    switch (gradeFilter.value) {
      case 'graded':
        filtered = filtered.filter(grade => grade.final_score !== null && grade.final_score !== undefined)
        break
      case 'ungraded':
        filtered = filtered.filter(grade => grade.final_score === null || grade.final_score === undefined)
        break
      case 'failed':
        filtered = filtered.filter(grade => grade.final_score !== null && grade.final_score !== undefined && grade.final_score < 60)
        break
      case 'excellent':
        filtered = filtered.filter(grade => grade.final_score !== null && grade.final_score !== undefined && grade.final_score >= 90)
        break
    }
  }

  return filtered
})

// 工具函数
const calculateTotalGrade = (grade: GradeDisplay): number => {
  const usual = grade.usual_score || 0
  const midterm = grade.exam_score || 0
  const final = grade.final_score || 0

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
  if (grade.final_score === null || grade.final_score === undefined) {
    return 'info'
  }
  return grade.final_score >= 60 ? 'success' : 'danger'
}

const getGradeStatusText = (grade: GradeDisplay): string => {
  if (grade.final_score === null || grade.final_score === undefined) {
    return '未录入'
  }
  return grade.final_score >= 60 ? '及格' : '不及格'
}

const getGradedCount = (): number => {
  return gradeList.value.filter(grade =>
    grade.final_score !== null && grade.final_score !== undefined
  ).length
}

const getUngradedCount = (): number => {
  return gradeList.value.filter(grade =>
    grade.final_score === null || grade.final_score === undefined
  ).length
}

const getAverageGrade = (): string => {
  const gradedList = gradeList.value.filter(grade =>
    grade.final_score !== null && grade.final_score !== undefined
  )
  if (gradedList.length === 0) return '0'

  const sum = gradedList.reduce((total, grade) => total + (grade.final_score || 0), 0)
  return (sum / gradedList.length).toFixed(1)
}

const getPassRate = (): string => {
  const gradedList = gradeList.value.filter(grade =>
    grade.final_score !== null && grade.final_score !== undefined
  )
  if (gradedList.length === 0) return '0'

  const passCount = gradedList.filter(grade => (grade.final_score || 0) >= 60).length
  return ((passCount / gradedList.length) * 100).toFixed(1)
}

const getExcellentRate = (): string => {
  const gradedList = gradeList.value.filter(grade =>
    grade.final_score !== null && grade.final_score !== undefined
  )
  if (gradedList.length === 0) return '0'

  const excellentCount = gradedList.filter(grade => (grade.final_score || 0) >= 90).length
  return ((excellentCount / gradedList.length) * 100).toFixed(1)
}

const getGradeDistribution = (level: string): number => {
  return gradeList.value.filter(grade => {
    const totalScore = calculateTotalScore(grade)
    return getGradeLevel(totalScore) === level
  }).length
}

// 数据获取函数
const fetchGrades = async () => {
  if (!props.offering) return

  try {
    loading.value = true
    // 模拟成绩数据
    const mockGrades: GradeDisplay[] = [
      {
        grade_id: 1,
        enrollment_id: 1,
        student: { id: 1, student_no: '2021001', real_name: '张三', class_name: '计科2101班' },
        usual_score: 85,
        exam_score: 82,
        final_score: 82,
        grade_point: 3.2,
        remarks: ''
      },
      {
        grade_id: 2,
        enrollment_id: 2,
        student: { id: 2, student_no: '2021002', real_name: '李四', class_name: '计科2101班' },
        usual_score: 92,
        exam_score: 90,
        final_score: 90,
        grade_point: 4.0,
        remarks: ''
      },
      {
        grade_id: 3,
        enrollment_id: 3,
        student: { id: 3, student_no: '2021003', real_name: '王五', class_name: '软工2101班' },
        usual_score: 75,
        exam_score: 68,
        final_score: 71,
        grade_point: 2.1,
        remarks: ''
      },
      {
        grade_id: 4,
        enrollment_id: 4,
        student: { id: 4, student_no: '2021004', real_name: '赵六', class_name: '数据2101班' },
        remarks: ''
      },
      {
        grade_id: 5,
        enrollment_id: 5,
        student: { id: 5, student_no: '2021005', real_name: '孙七', class_name: '计科2102班' },
        remarks: ''
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
  if (grade.usual_score || grade.exam_score) {
    const usual = grade.usual_score || 0
    const exam = grade.exam_score || 0
    // 权重：平时40%，期末60%
    grade.final_score = Math.round(usual * 0.4 + exam * 0.6)
    grade.grade_point = calculateGradePoint(grade.final_score)
  }

  grade.changed = true
}

const handleSelectionChange = (selection: GradeDisplay[]) => {
  selectedRows.value = selection
}

const handleSaveGrade = async (grade: GradeDisplay) => {
  try {
    await gradeApi.update(grade.grade_id, {
      usual_score: grade.usual_score,
      exam_score: grade.exam_score
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
    await gradeApi.batchUpdate(
      changedGrades.map(grade => ({
        enrollment_id: grade.enrollment_id,
        usual_score: grade.usual_score,
        exam_score: grade.exam_score
      }))
    )

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

const calculateGradePoint = (finalScore?: number): number => {
  if (!finalScore) return 0
  if (finalScore >= 90) return 4.0
  if (finalScore >= 80) return 3.0
  if (finalScore >= 70) return 2.0
  if (finalScore >= 60) return 1.0
  return 0
}

// 计算总评成绩
const calculateTotalScore = (grade: Grade): number => {
  const usual = grade.usual_score || 0
  const exam = grade.exam_score || 0
  const final = grade.final_score || 0

  // 平时成绩30%，期中成绩30%，期末40%
  const total = usual * 0.3 + exam * 0.3 + final * 0.4
  return Math.round(total * 10) / 10
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
