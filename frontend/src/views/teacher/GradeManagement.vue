<template>
  <div class="grade-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>成绩管理</h2>
      <p>管理我的课程成绩录入和查看</p>
    </div>

    <!-- 课程选择 -->
    <el-card class="course-select-card" shadow="never">
      <el-form inline>
        <el-form-item label="选择课程">
          <el-select
            v-model="selectedCourseId"
            placeholder="请选择要管理成绩的课程"
            style="width: 300px"
            @change="handleCourseChange"
          >
            <el-option
              v-for="course in myCourses"
              :key="course.id"
              :label="`${course.course?.name} (${course.semester} ${course.academicYear})`"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="selectedCourse">
          <el-button type="primary" @click="showBatchGradeDialog = true">
            批量录入成绩
          </el-button>
          <el-button @click="exportGrades">
            导出成绩
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 成绩列表 -->
    <el-card v-if="selectedCourse" class="grade-table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ selectedCourse.course?.name }} - 成绩列表</span>
          <div class="course-info">
            <el-tag>{{ selectedCourse.semester }}</el-tag>
            <el-tag type="success">{{ selectedCourse.academicYear }}</el-tag>
            <el-tag type="info">{{ enrollments.length }}名学生</el-tag>
          </div>
        </div>
      </template>

      <el-table
        :data="enrollments"
        :loading="loading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="student" label="学生信息" width="200" fixed="left">
          <template #default="{ row }">
            <div>
              <div class="student-name">{{ row.student?.user?.realName }}</div>
              <div class="student-no">学号：{{ row.student?.studentId }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="regularScore" label="平时成绩" width="120" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.grade.regularScore"
              :min="0"
              :max="100"
              :precision="1"
              size="small"
              @change="handleScoreChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="midtermScore" label="期中成绩" width="120" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.grade.midtermScore"
              :min="0"
              :max="100"
              :precision="1"
              size="small"
              @change="handleScoreChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="finalScore" label="期末成绩" width="120" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.grade.finalScore"
              :min="0"
              :max="100"
              :precision="1"
              size="small"
              @change="handleScoreChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="totalScore" label="总评成绩" width="120" align="center">
          <template #default="{ row }">
            <div class="total-score">
              {{ calculateTotalScore(row.grade) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="gradeLevel" label="等级" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getGradeTagType(calculateTotalScore(row.grade))"
              size="small"
            >
              {{ getGradeLevel(calculateTotalScore(row.grade)) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="gpa" label="绩点" width="80" align="center">
          <template #default="{ row }">
            {{ calculateGPA(calculateTotalScore(row.grade)) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="saveGrade(row)"
              :loading="row.saving"
            >
              保存
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 空状态 -->
    <el-empty
      v-if="!selectedCourse && !loading"
      description="请选择要管理成绩的课程"
      :image-size="200"
    />

    <!-- 批量录入成绩对话框 -->
    <BatchGradeDialog
      v-model="showBatchGradeDialog"
      :course-offering="selectedCourse"
      @success="handleBatchGradeSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { courseOfferingApi, gradeApi } from '@/api/modules'
import type { CourseOffering, Enrollment, Grade } from '@/types/course'
import BatchGradeDialog from './components/BatchGradeDialog.vue'

// 扩展Enrollment类型以包含saving状态
interface EnrollmentWithSaving extends Enrollment {
  saving?: boolean
  grade: Grade & {
    regularScore?: number | null
    midtermScore?: number | null
    finalScore?: number | null
    totalScore?: number | null
    gradeLevel?: string | null
    gpa?: number | null
  }
}

// 响应式数据
const loading = ref(false)
const myCourses = ref<CourseOffering[]>([])
const selectedCourseId = ref<number>()
const enrollments = ref<EnrollmentWithSaving[]>([])
const showBatchGradeDialog = ref(false)

// 计算属性
const selectedCourse = computed(() => {
  return myCourses.value.find(course => course.id === selectedCourseId.value)
})

// 获取我的课程列表
const fetchMyCourses = async () => {
  try {
    loading.value = true
    const data = await courseOfferingApi.getMyCourses()
    myCourses.value = data
  } catch (error) {
    console.error('获取课程列表失败:', error)
    ElMessage.error('获取课程列表失败')
  } finally {
    loading.value = false
  }
}

// 课程选择变化
const handleCourseChange = async (courseId: number) => {
  if (!courseId) {
    enrollments.value = []
    return
  }

  try {
    loading.value = true
    const data = await gradeApi.getCourseGrades(courseId)
    // 确保每个学生都有成绩对象
    enrollments.value = data.map(enrollment => ({
      ...enrollment,
      grade: enrollment.grade || {
        id: 0,
        enrollmentId: enrollment.id,
        regularScore: null,
        midtermScore: null,
        finalScore: null,
        totalScore: null,
        gradeLevel: null,
        gpa: null,
        createdAt: '',
        updatedAt: ''
      },
      saving: false
    })) as EnrollmentWithSaving[]
  } catch (error) {
    console.error('获取成绩列表失败:', error)
    ElMessage.error('获取成绩列表失败')
  } finally {
    loading.value = false
  }
}

// 成绩变化处理
const handleScoreChange = (row: EnrollmentWithSaving) => {
  // 自动计算总评成绩
  if (row.grade) {
    row.grade.totalScore = calculateTotalScore(row.grade)
  }
}

// 计算总评成绩
const calculateTotalScore = (grade: Grade): number => {
  const regular = grade.regularScore || 0
  const midterm = grade.midtermScore || 0
  const final = grade.finalScore || 0

  // 平时成绩30%，期中成绩30%，期末成绩40%
  const total = regular * 0.3 + midterm * 0.3 + final * 0.4
  return Math.round(total * 10) / 10
}

// 获取等级
const getGradeLevel = (score: number): string => {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

// 获取等级标签类型
const getGradeTagType = (score: number): string => {
  if (score >= 90) return 'success'
  if (score >= 80) return ''
  if (score >= 70) return 'warning'
  if (score >= 60) return 'info'
  return 'danger'
}

// 计算绩点
const calculateGPA = (score: number): number => {
  if (score >= 90) return 4.0
  if (score >= 85) return 3.7
  if (score >= 82) return 3.3
  if (score >= 78) return 3.0
  if (score >= 75) return 2.7
  if (score >= 72) return 2.3
  if (score >= 68) return 2.0
  if (score >= 64) return 1.5
  if (score >= 60) return 1.0
  return 0.0
}

// 保存单个成绩
const saveGrade = async (row: EnrollmentWithSaving) => {
  try {
    row.saving = true

    const gradeData = {
      regularScore: row.grade.regularScore,
      midtermScore: row.grade.midtermScore,
      finalScore: row.grade.finalScore,
      totalScore: calculateTotalScore(row.grade),
      gradeLevel: getGradeLevel(calculateTotalScore(row.grade)),
      gpa: calculateGPA(calculateTotalScore(row.grade))
    }

    if (row.grade.id && row.grade.id > 0) {
      await gradeApi.updateGrade(row.grade.id, gradeData)
    } else {
      // 如果没有成绩记录，创建新的
      const newGrade = await gradeApi.createGrade({
        enrollmentId: row.id,
        ...gradeData
      })
      row.grade = { ...row.grade, ...newGrade }
    }

    ElMessage.success('成绩保存成功')
  } catch (error) {
    console.error('保存成绩失败:', error)
    ElMessage.error('保存成绩失败')
  } finally {
    row.saving = false
  }
}

// 批量录入成功
const handleBatchGradeSuccess = () => {
  ElMessage.success('批量录入成功')
  if (selectedCourseId.value) {
    handleCourseChange(selectedCourseId.value)
  }
}

// 导出成绩
const exportGrades = () => {
  if (!selectedCourse.value || enrollments.value.length === 0) {
    ElMessage.warning('没有可导出的成绩数据')
    return
  }

  // 创建CSV内容
  const headers = ['学号', '姓名', '平时成绩', '期中成绩', '期末成绩', '总评成绩', '等级', '绩点']
  const csvContent = [
    headers.join(','),
    ...enrollments.value.map(enrollment => [
      enrollment.student?.studentId || '',
      enrollment.student?.user?.realName || '',
      enrollment.grade?.regularScore || '',
      enrollment.grade?.midtermScore || '',
      enrollment.grade?.finalScore || '',
      calculateTotalScore(enrollment.grade || {} as Grade),
      getGradeLevel(calculateTotalScore(enrollment.grade || {} as Grade)),
      calculateGPA(calculateTotalScore(enrollment.grade || {} as Grade))
    ].join(','))
  ].join('\n')

  // 下载文件
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${selectedCourse.value.course?.name}_成绩单.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 页面初始化
onMounted(() => {
  fetchMyCourses()
})
</script>

<style lang="scss" scoped>
.grade-management {
  padding: $spacing-lg;
}

.page-header {
  margin-bottom: $spacing-lg;

  h2 {
    margin: 0 0 $spacing-xs 0;
    color: $text-primary;
  }

  p {
    margin: 0;
    color: $text-secondary;
  }
}

.course-select-card {
  margin-bottom: $spacing-lg;
}

.grade-table-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .course-info {
      .el-tag {
        margin-left: $spacing-xs;
      }
    }
  }
}

.student-name {
  font-weight: 500;
  color: $text-primary;
}

.student-no {
  font-size: 12px;
  color: $text-secondary;
  margin-top: 2px;
}

.total-score {
  font-weight: 500;
  color: $primary-color;
}

:deep(.el-input-number) {
  width: 100%;

  .el-input__inner {
    text-align: center;
  }
}
</style>
