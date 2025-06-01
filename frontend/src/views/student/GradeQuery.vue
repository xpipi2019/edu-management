<template>
  <div class="grade-query">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>我的成绩</h2>
      <p>查看我的所有课程成绩和学习情况</p>
    </div>

    <!-- 成绩统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon total">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stats-text">
                <div class="stats-number">{{ gradeStats.totalCourses }}</div>
                <div class="stats-label">总课程数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon passed">
                <el-icon><Select /></el-icon>
              </div>
              <div class="stats-text">
                <div class="stats-number">{{ gradeStats.passedCourses }}</div>
                <div class="stats-label">通过课程</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon credits">
                <el-icon><Medal /></el-icon>
              </div>
              <div class="stats-text">
                <div class="stats-number">{{ gradeStats.totalCredits }}</div>
                <div class="stats-label">总学分</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon gpa">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stats-text">
                <div class="stats-number">{{ gradeStats.averageGPA }}</div>
                <div class="stats-label">平均绩点</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选器 -->
    <el-card class="filter-card" shadow="never">
      <el-form inline>
        <el-form-item label="学年">
          <el-select
            v-model="queryForm.academicYear"
            placeholder="选择学年"
            clearable
            style="width: 150px"
            @change="fetchGrades"
          >
            <el-option
              v-for="year in academicYears"
              :key="year"
              :label="year"
              :value="year"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学期">
          <el-select
            v-model="queryForm.semester"
            placeholder="选择学期"
            clearable
            style="width: 120px"
            @change="fetchGrades"
          >
            <el-option label="春季学期" value="春季学期" />
            <el-option label="秋季学期" value="秋季学期" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程名称">
          <el-input
            v-model="queryForm.keyword"
            placeholder="输入课程名称或代码"
            clearable
            style="width: 200px"
            @change="fetchGrades"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchGrades">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
          <el-button @click="exportGrades">
            <el-icon><Download /></el-icon>
            导出成绩单
          </el-button>
          <el-button @click="printGrades">
            <el-icon><Printer /></el-icon>
            打印成绩单
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 成绩列表 -->
    <el-card class="grade-table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>成绩单</span>
          <div class="header-info">
            <el-tag type="info">共 {{ gradeList.length }} 门课程</el-tag>
          </div>
        </div>
      </template>

      <el-table
        :data="gradeList"
        :loading="loading"
        border
        stripe
        style="width: 100%"
        :default-sort="{ prop: 'courseOffering.academicYear', order: 'descending' }"
      >
        <el-table-column prop="courseOffering.course.code" label="课程代码" width="120" />
        <el-table-column prop="courseOffering.course.name" label="课程名称" min-width="150" />
        <el-table-column prop="courseOffering.course.type" label="课程类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getCourseTypeTagType(row.courseOffering.course.type)"
              size="small"
            >
              {{ getCourseTypeText(row.courseOffering.course.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="courseOffering.course.credits" label="学分" width="80" align="center" />
        <el-table-column prop="courseOffering.teacher.user.realName" label="授课教师" width="120" align="center" />
        <el-table-column prop="courseOffering.academicYear" label="学年" width="120" align="center" sortable />
        <el-table-column prop="courseOffering.semester" label="学期" width="100" align="center" />

        <!-- 成绩详情 -->
        <el-table-column label="成绩详情" width="300" align="center">
          <template #default="{ row }">
            <div v-if="row.grade" class="grade-details">
              <div class="score-row">
                <span class="score-label">平时:</span>
                <span class="score-value">{{ row.grade.regularScore ?? '-' }}</span>
                <span class="score-label">期中:</span>
                <span class="score-value">{{ row.grade.midtermScore ?? '-' }}</span>
                <span class="score-label">期末:</span>
                <span class="score-value">{{ row.grade.finalScore ?? '-' }}</span>
              </div>
              <div class="total-score-row">
                <span class="total-label">总评:</span>
                <span class="total-score">{{ row.grade.totalScore ?? '-' }}</span>
              </div>
            </div>
            <div v-else class="no-grade">
              <el-text type="info">暂无成绩</el-text>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="等级" width="80" align="center">
          <template #default="{ row }">
            <div v-if="row.grade?.totalScore">
              <el-tag
                :type="getGradeTagType(row.grade.totalScore)"
                size="small"
              >
                {{ getGradeLevel(row.grade.totalScore) }}
              </el-tag>
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>

        <el-table-column label="绩点" width="80" align="center">
          <template #default="{ row }">
            <div v-if="row.grade?.totalScore">
              {{ calculateGPA(row.grade.totalScore) }}
            </div>
            <div v-else>-</div>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty
        v-if="!gradeList.length && !loading"
        description="暂无成绩记录"
        :image-size="200"
      />
    </el-card>

    <!-- 成绩分析图表 -->
    <el-card class="chart-card" shadow="never">
      <template #header>
        <span>成绩分析</span>
      </template>
      <div class="charts-container">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-item">
              <h4>成绩分布</h4>
              <div class="grade-distribution">
                <div class="distribution-item" v-for="item in gradeDistribution" :key="item.grade">
                  <div class="grade-bar">
                    <div class="grade-label">{{ item.grade }}</div>
                    <div class="bar-container">
                      <div
                        class="bar-fill"
                        :style="{ width: `${(item.count / gradeStats.totalCourses) * 100}%` }"
                        :class="`grade-${item.grade.toLowerCase()}`"
                      ></div>
                    </div>
                    <div class="grade-count">{{ item.count }}</div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-item">
              <h4>学期GPA趋势</h4>
              <div class="gpa-trend">
                <div class="trend-item" v-for="item in gpaTrend" :key="`${item.year}-${item.semester}`">
                  <div class="trend-label">{{ item.year }} {{ item.semester }}</div>
                  <div class="trend-value">{{ item.gpa }}</div>
                  <div class="trend-bar">
                    <div
                      class="trend-fill"
                      :style="{ width: `${(item.gpa / 4.0) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  Select,
  Medal,
  TrendCharts,
  Search,
  RefreshLeft,
  Download,
  Printer
} from '@element-plus/icons-vue'
import { gradeApi } from '@/api/modules'
import type { Enrollment, CourseType, EnrollmentStatus } from '@/types/course'

// 响应式数据
const loading = ref(false)
const gradeList = ref<Enrollment[]>([])

// 查询表单
const queryForm = reactive({
  keyword: '',
  semester: '',
  academicYear: ''
})

// 获取我的成绩
const fetchGrades = async () => {
  try {
    loading.value = true
    const data = await gradeApi.getMyGrades()

    // 筛选数据
    let filteredData = data

    if (queryForm.keyword) {
      filteredData = filteredData.filter(item =>
        item.courseOffering.course.name.includes(queryForm.keyword) ||
        item.courseOffering.course.code.includes(queryForm.keyword)
      )
    }

    if (queryForm.semester) {
      filteredData = filteredData.filter(item =>
        item.courseOffering.semester === queryForm.semester
      )
    }

    if (queryForm.academicYear) {
      filteredData = filteredData.filter(item =>
        item.courseOffering.academicYear === queryForm.academicYear
      )
    }

    gradeList.value = filteredData
  } catch (error) {
    console.error('获取成绩失败：', error)
    ElMessage.error('获取成绩失败')
  } finally {
    loading.value = false
  }
}

// 重置查询
const resetQuery = () => {
  queryForm.keyword = ''
  queryForm.semester = ''
  queryForm.academicYear = ''
  fetchGrades()
}

// 导出成绩单
const exportGrades = () => {
  const csvContent = generateCSV()
  downloadCSV(csvContent, '我的成绩单.csv')
  ElMessage.success('成绩单导出成功')
}

// 打印成绩单
const printGrades = () => {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>个人成绩单</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { text-align: center; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
              th { background-color: #f5f5f5; font-weight: bold; }
              .stats { margin: 20px 0; }
              .stats-item { display: inline-block; margin-right: 30px; }
          </style>
      </head>
      <body>
          <h1>个人成绩单</h1>
          <div class="stats">
              <div class="stats-item">总课程数：${gradeStats.value.totalCourses}</div>
              <div class="stats-item">通过课程：${gradeStats.value.passedCourses}</div>
              <div class="stats-item">总学分：${gradeStats.value.totalCredits}</div>
              <div class="stats-item">平均绩点：${gradeStats.value.averageGPA}</div>
          </div>
          <table>
              <thead>
                  <tr>
                      <th>课程代码</th>
                      <th>课程名称</th>
                      <th>学分</th>
                      <th>授课教师</th>
                      <th>学年</th>
                      <th>学期</th>
                      <th>平时成绩</th>
                      <th>期中成绩</th>
                      <th>期末成绩</th>
                      <th>总评成绩</th>
                      <th>等级</th>
                      <th>绩点</th>
                  </tr>
              </thead>
              <tbody>
                  ${gradeList.value.map(item => {
                    const teacherName = item.courseOffering.teacher.user?.realName || '-'
                    const regularScore = item.grade?.regularScore ?? '-'
                    const midtermScore = item.grade?.midtermScore ?? '-'
                    const finalScore = item.grade?.finalScore ?? '-'
                    const totalScore = item.grade?.totalScore ?? '-'
                    const gradeLevel = item.grade?.totalScore ? getGradeLevel(item.grade.totalScore) : '-'
                    const gpaValue = item.grade?.totalScore ? calculateGPA(item.grade.totalScore) : '-'

                    return `
                        <tr>
                            <td>${item.courseOffering.course.code}</td>
                            <td>${item.courseOffering.course.name}</td>
                            <td>${item.courseOffering.course.credits}</td>
                            <td>${teacherName}</td>
                            <td>${item.courseOffering.academicYear}</td>
                            <td>${item.courseOffering.semester}</td>
                            <td>${regularScore}</td>
                            <td>${midtermScore}</td>
                            <td>${finalScore}</td>
                            <td>${totalScore}</td>
                            <td>${gradeLevel}</td>
                            <td>${gpaValue}</td>
                        </tr>
                    `
                  }).join('')}
              </tbody>
          </table>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}

// 生成CSV内容
const generateCSV = () => {
  const headers = ['课程代码', '课程名称', '学分', '授课教师', '学年', '学期', '平时成绩', '期中成绩', '期末成绩', '总评成绩', '等级', '绩点']
  const rows = gradeList.value.map(item => [
    item.courseOffering.course.code,
    item.courseOffering.course.name,
    item.courseOffering.course.credits,
    item.courseOffering.teacher.user?.realName || '-',
    item.courseOffering.academicYear,
    item.courseOffering.semester,
    item.grade?.regularScore ?? '-',
    item.grade?.midtermScore ?? '-',
    item.grade?.finalScore ?? '-',
    item.grade?.totalScore ?? '-',
    item.grade?.totalScore ? getGradeLevel(item.grade.totalScore) : '-',
    item.grade?.totalScore ? calculateGPA(item.grade.totalScore) : '-'
  ])

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

// 下载CSV文件
const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

// 生成打印内容
const generatePrintContent = () => {
  // 这个函数现在不再使用，保留是为了兼容性
  return ''
}

// 计算成绩统计
const gradeStats = computed(() => {
  const total = gradeList.value.length
  const passedGrades = gradeList.value.filter(item =>
    item.grade?.totalScore && item.grade.totalScore >= 60
  )
  const totalCredits = gradeList.value.reduce((sum, item) =>
    sum + item.courseOffering.course.credits, 0
  )
  const totalGradePoints = gradeList.value.reduce((sum, item) => {
    if (item.grade?.totalScore) {
      return sum + (calculateGPA(item.grade.totalScore) * item.courseOffering.course.credits)
    }
    return sum
  }, 0)
  const averageGPA = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00'

  return {
    totalCourses: total,
    passedCourses: passedGrades.length,
    totalCredits,
    averageGPA
  }
})

// 可用学年列表
const academicYears = computed(() => {
  const years = new Set(gradeList.value.map(item => item.courseOffering.academicYear))
  return Array.from(years).sort((a, b) => b.localeCompare(a))
})

// 成绩分布统计
const gradeDistribution = computed(() => {
  const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 }

  gradeList.value.forEach(item => {
    if (item.grade?.totalScore) {
      const level = getGradeLevel(item.grade.totalScore)
      if (level in distribution) {
        distribution[level as keyof typeof distribution]++
      }
    }
  })

  return Object.entries(distribution).map(([grade, count]) => ({ grade, count }))
})

// GPA趋势统计
const gpaTrend = computed(() => {
  const semesterGrades = new Map<string, { grades: number[], credits: number[] }>()

  gradeList.value.forEach(item => {
    if (item.grade?.totalScore) {
      const key = `${item.courseOffering.academicYear}-${item.courseOffering.semester}`
      if (!semesterGrades.has(key)) {
        semesterGrades.set(key, { grades: [], credits: [] })
      }
      const data = semesterGrades.get(key)!
      data.grades.push(calculateGPA(item.grade.totalScore))
      data.credits.push(item.courseOffering.course.credits)
    }
  })

  return Array.from(semesterGrades.entries()).map(([key, data]) => {
    const [year, semester] = key.split('-')
    const totalGradePoints = data.grades.reduce((sum, grade, index) =>
      sum + (grade * data.credits[index]), 0
    )
    const totalCredits = data.credits.reduce((sum, credit) => sum + credit, 0)
    const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00'

    return { year, semester, gpa: parseFloat(gpa) }
  }).sort((a, b) => {
    if (a.year !== b.year) return a.year.localeCompare(b.year)
    return a.semester.localeCompare(b.semester)
  })
})

// 工具函数
const getCourseTypeText = (type: CourseType) => {
  const typeMap = {
    REQUIRED: '必修',
    ELECTIVE: '选修',
    PUBLIC: '公共',
    PROFESSIONAL: '专业'
  }
  return typeMap[type] || type
}

const getCourseTypeTagType = (type: CourseType) => {
  const typeMap = {
    REQUIRED: 'danger',
    ELECTIVE: 'success',
    PUBLIC: 'info',
    PROFESSIONAL: 'warning'
  }
  return typeMap[type] || ''
}

const getStatusText = (status: EnrollmentStatus) => {
  const statusMap = {
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
    DROPPED: '已退课'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status: EnrollmentStatus) => {
  const typeMap = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    DROPPED: 'info'
  }
  return typeMap[status] || ''
}

const getGradeLevel = (score: number) => {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

const getGradeTagType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 80) return ''
  if (score >= 70) return 'warning'
  if (score >= 60) return 'info'
  return 'danger'
}

const calculateGPA = (score: number) => {
  if (score >= 90) return 4.0
  if (score >= 80) return 3.0
  if (score >= 70) return 2.0
  if (score >= 60) return 1.0
  return 0.0
}

// 生命周期
onMounted(() => {
  fetchGrades()
})
</script>

<style lang="scss" scoped>
.grade-query {
  padding: $spacing-lg;
  background-color: $bg-page;
  min-height: 100vh;
}

.page-header {
  margin-bottom: $spacing-xl;

  h2 {
    color: $text-primary;
    margin: 0 0 $spacing-xs 0;
    font-size: 24px;
    font-weight: 600;
  }

  p {
    color: $text-regular;
    margin: 0;
    font-size: 14px;
  }
}

.stats-cards {
  margin-bottom: $spacing-lg;

  .stats-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;

    :deep(.el-card__body) {
      padding: $spacing-lg;
    }

    &:nth-child(2) .stats-card {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &:nth-child(3) .stats-card {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &:nth-child(4) .stats-card {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
  }

  .stats-content {
    display: flex;
    align-items: center;
    color: white;

    .stats-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: $spacing-md;
      background: rgba(255, 255, 255, 0.2);

      .el-icon {
        font-size: 24px;
      }
    }

    .stats-text {
      flex: 1;

      .stats-number {
        font-size: 28px;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 4px;
      }

      .stats-label {
        font-size: 14px;
        opacity: 0.9;
      }
    }
  }
}

.filter-card {
  margin-bottom: $spacing-lg;
  border: none;
  box-shadow: $box-shadow-light;
}

.grade-table-card {
  margin-bottom: $spacing-lg;
  border: none;
  box-shadow: $box-shadow-light;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-info {
      .el-tag {
        margin-left: $spacing-xs;
      }
    }
  }

  .grade-details {
    .score-row {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      margin-bottom: 4px;

      .score-label {
        font-size: 12px;
        color: $text-regular;
        min-width: 30px;
      }

      .score-value {
        font-weight: 500;
        min-width: 30px;
      }
    }

    .total-score-row {
      display: flex;
      align-items: center;
      gap: $spacing-xs;

      .total-label {
        font-size: 12px;
        color: $text-primary;
        font-weight: 500;
      }

      .total-score {
        font-weight: 600;
        color: $primary-color;
        font-size: 16px;
      }
    }
  }

  .no-grade {
    color: $text-placeholder;
  }
}

.chart-card {
  border: none;
  box-shadow: $box-shadow-light;

  .charts-container {
    padding: $spacing-md 0;
  }

  .chart-item {
    h4 {
      margin: 0 0 $spacing-md 0;
      color: $text-primary;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .grade-distribution {
    .distribution-item {
      margin-bottom: $spacing-md;

      .grade-bar {
        display: flex;
        align-items: center;
        gap: $spacing-md;

        .grade-label {
          width: 30px;
          font-weight: 600;
          color: $text-primary;
        }

        .bar-container {
          flex: 1;
          height: 20px;
          background: $border-extra-light;
          border-radius: 10px;
          overflow: hidden;

          .bar-fill {
            height: 100%;
            transition: width 0.3s ease;

            &.grade-a { background: linear-gradient(90deg, #67c23a, #85ce61); }
            &.grade-b { background: linear-gradient(90deg, #409eff, #66b1ff); }
            &.grade-c { background: linear-gradient(90deg, #e6a23c, #ebb563); }
            &.grade-d { background: linear-gradient(90deg, #f56c6c, #f78989); }
            &.grade-f { background: linear-gradient(90deg, #f56c6c, #f78989); }
          }
        }

        .grade-count {
          width: 30px;
          text-align: right;
          font-weight: 500;
          color: $text-regular;
        }
      }
    }
  }

  .gpa-trend {
    .trend-item {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      margin-bottom: $spacing-md;

      .trend-label {
        width: 120px;
        font-size: 12px;
        color: $text-regular;
      }

      .trend-value {
        width: 50px;
        font-weight: 600;
        color: $text-primary;
      }

      .trend-bar {
        flex: 1;
        height: 16px;
        background: $border-extra-light;
        border-radius: 8px;
        overflow: hidden;

        .trend-fill {
          height: 100%;
          background: linear-gradient(90deg, $primary-color, $primary-color-light);
          transition: width 0.3s ease;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .stats-cards {
    .el-col {
      margin-bottom: $spacing-md;
    }
  }

  .filter-card {
    :deep(.el-form) {
      .el-form-item {
        display: block;
        margin-bottom: $spacing-md;
        margin-right: 0;
      }
    }
  }

  .charts-container {
    .el-col {
      margin-bottom: $spacing-lg;
    }
  }
}
</style>
