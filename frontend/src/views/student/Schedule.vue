<template>
  <div class="student-schedule">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>我的课程表</h2>
      <p>查看我的课程时间安排</p>
    </div>

    <!-- 学期选择器 -->
    <el-card class="filter-card" shadow="never">
      <el-form inline>
        <el-form-item label="学年">
          <el-select
            v-model="selectedAcademicYear"
            placeholder="选择学年"
            style="width: 150px"
            @change="fetchSchedule"
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
            v-model="selectedSemester"
            placeholder="选择学期"
            style="width: 120px"
            @change="fetchSchedule"
          >
            <el-option label="春季学期" value="春季学期" />
            <el-option label="秋季学期" value="秋季学期" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchSchedule">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="printSchedule">
            <el-icon><Printer /></el-icon>
            打印课程表
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 课程表 -->
    <el-card class="schedule-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ selectedAcademicYear }} {{ selectedSemester }} 课程表</span>
          <div class="schedule-info">
            <el-tag type="info">共 {{ enrollmentList.length }} 门课程</el-tag>
          </div>
        </div>
      </template>

      <div class="schedule-grid" v-loading="loading">
        <div class="schedule-table">
          <!-- 表头 -->
          <div class="schedule-header">
            <div class="time-slot">时间</div>
            <div class="day-header" v-for="day in weekDays" :key="day.value">
              {{ day.label }}
            </div>
          </div>

          <!-- 时间段 -->
          <div class="schedule-row" v-for="timeSlot in timeSlots" :key="timeSlot.period">
            <div class="time-slot">
              <div class="period">第{{ timeSlot.period }}节</div>
              <div class="time">{{ timeSlot.time }}</div>
            </div>
            <div
              class="schedule-cell"
              v-for="day in weekDays"
              :key="`${day.value}-${timeSlot.period}`"
            >
              <div
                v-if="getCourseByDayAndTime(day.value, timeSlot.period)"
                class="course-item"
                :class="`course-type-${getCourseByDayAndTime(day.value, timeSlot.period)?.courseOffering.course.type.toLowerCase()}`"
              >
                <div class="course-name">
                  {{ getCourseByDayAndTime(day.value, timeSlot.period)?.courseOffering.course.name }}
                </div>
                <div class="course-info">
                  <div class="teacher">
                    {{ getCourseByDayAndTime(day.value, timeSlot.period)?.courseOffering.teacher.user?.realName }}
                  </div>
                  <div class="classroom">
                    {{ getCourseByDayAndTime(day.value, timeSlot.period)?.courseOffering.classroom || '待定' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!enrollmentList.length && !loading"
        description="暂无课程安排"
        :image-size="200"
      />
    </el-card>

    <!-- 课程列表 -->
    <el-card class="course-list-card" shadow="never">
      <template #header>
        <span>课程详情</span>
      </template>

      <el-table :data="enrollmentList" stripe>
        <el-table-column prop="courseOffering.course.code" label="课程代码" width="120" />
        <el-table-column prop="courseOffering.course.name" label="课程名称" min-width="150" />
        <el-table-column prop="courseOffering.course.credits" label="学分" width="80" align="center" />
        <el-table-column prop="courseOffering.teacher.user.realName" label="授课教师" width="120" />
        <el-table-column label="上课时间" min-width="200">
          <template #default="{ row }">
            <div v-if="row.courseOffering.schedules && row.courseOffering.schedules.length > 0">
              <div
                v-for="schedule in row.courseOffering.schedules"
                :key="schedule.id"
                class="schedule-time"
              >
                {{ getWeekDayName(schedule.dayOfWeek) }}
                第{{ schedule.startTime }}-{{ schedule.endTime }}节
                ({{ schedule.classroom }})
              </div>
            </div>
            <span v-else class="no-schedule">时间待定</span>
          </template>
        </el-table-column>
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
        <el-table-column prop="status" label="选课状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getEnrollmentStatusTagType(row.status)"
              size="small"
            >
              {{ getEnrollmentStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Printer } from '@element-plus/icons-vue'
import { enrollmentApi } from '@/api/modules'
import type { Enrollment, CourseType, EnrollmentStatus } from '@/types/course'

// 响应式数据
const loading = ref(false)
const enrollmentList = ref<Enrollment[]>([])
const selectedAcademicYear = ref('2024-2025')
const selectedSemester = ref('春季学期')

// 星期数据
const weekDays = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 7, label: '周日' }
]

// 时间段数据
const timeSlots = [
  { period: 1, time: '08:00-08:45' },
  { period: 2, time: '08:55-09:40' },
  { period: 3, time: '10:00-10:45' },
  { period: 4, time: '10:55-11:40' },
  { period: 5, time: '14:00-14:45' },
  { period: 6, time: '14:55-15:40' },
  { period: 7, time: '16:00-16:45' },
  { period: 8, time: '16:55-17:40' },
  { period: 9, time: '19:00-19:45' },
  { period: 10, time: '19:55-20:40' }
]

// 可用学年列表
const academicYears = computed(() => {
  return ['2024-2025', '2023-2024', '2022-2023']
})

// 获取我的选课信息
const fetchSchedule = async () => {
  try {
    loading.value = true
    const data = await enrollmentApi.getMyEnrollments()

    // 筛选当前学期的课程
    const filteredData = data.filter(item =>
      item.courseOffering.academicYear === selectedAcademicYear.value &&
      item.courseOffering.semester === selectedSemester.value &&
      item.status === 'APPROVED' // 只显示已通过的选课
    )

    enrollmentList.value = filteredData
  } catch (error) {
    console.error('获取课程表失败：', error)
    ElMessage.error('获取课程表失败')
  } finally {
    loading.value = false
  }
}

// 根据星期和时间获取课程
const getCourseByDayAndTime = (dayOfWeek: number, period: number) => {
  return enrollmentList.value.find(enrollment =>
    enrollment.courseOffering.schedules?.some(schedule =>
      schedule.dayOfWeek === dayOfWeek &&
      period >= schedule.startTime &&
      period <= schedule.endTime
    )
  )
}

// 打印课程表
const printSchedule = () => {
  const printContent = generatePrintContent()
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }
}

// 生成打印内容
const generatePrintContent = () => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>个人课程表</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #333; }
            .schedule-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .schedule-table th, .schedule-table td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: center;
                vertical-align: middle;
            }
            .schedule-table th { background-color: #f5f5f5; font-weight: bold; }
            .course-item {
                background: #e3f2fd;
                padding: 4px;
                border-radius: 4px;
                font-size: 12px;
            }
            .course-name { font-weight: bold; margin-bottom: 2px; }
            .teacher { color: #666; }
        </style>
    </head>
    <body>
        <h1>${selectedAcademicYear.value} ${selectedSemester.value} 个人课程表</h1>
        <table class="schedule-table">
            <thead>
                <tr>
                    <th>时间</th>
                    ${weekDays.map(day => `<th>${day.label}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${timeSlots.map(timeSlot => `
                    <tr>
                        <td>第${timeSlot.period}节<br/>${timeSlot.time}</td>
                        ${weekDays.map(day => {
                          const course = getCourseByDayAndTime(day.value, timeSlot.period)
                          return `<td>
                            ${course ? `
                                <div class="course-item">
                                    <div class="course-name">${course.courseOffering.course.name}</div>
                                    <div class="teacher">${course.courseOffering.teacher.user?.realName}</div>
                                    <div class="classroom">${course.courseOffering.classroom || '待定'}</div>
                                </div>
                            ` : ''}
                          </td>`
                        }).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </body>
    </html>
  `
}

// 工具函数
const getWeekDayName = (dayOfWeek: number) => {
  const dayMap: Record<number, string> = {
    1: '周一', 2: '周二', 3: '周三', 4: '周四',
    5: '周五', 6: '周六', 7: '周日'
  }
  return dayMap[dayOfWeek] || ''
}

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

const getEnrollmentStatusText = (status: EnrollmentStatus) => {
  const statusMap = {
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
    DROPPED: '已退课'
  }
  return statusMap[status] || status
}

const getEnrollmentStatusTagType = (status: EnrollmentStatus) => {
  const typeMap = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    DROPPED: 'info'
  }
  return typeMap[status] || ''
}

// 生命周期
onMounted(() => {
  fetchSchedule()
})
</script>

<style lang="scss" scoped>
.student-schedule {
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

.filter-card {
  margin-bottom: $spacing-lg;
  border: none;
  box-shadow: $box-shadow-light;
}

.schedule-card {
  margin-bottom: $spacing-lg;
  border: none;
  box-shadow: $box-shadow-light;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .schedule-info {
      .el-tag {
        margin-left: $spacing-xs;
      }
    }
  }
}

.schedule-grid {
  overflow-x: auto;

  .schedule-table {
    width: 100%;
    min-width: 800px;
    display: table;
    border-collapse: separate;
    border-spacing: 1px;
    background-color: $border-lighter;
    border-radius: 8px;
    overflow: hidden;
  }

  .schedule-header {
    display: table-row;

    .time-slot,
    .day-header {
      display: table-cell;
      background-color: $border-light;
      color: $text-primary;
      font-weight: 600;
      text-align: center;
      padding: $spacing-md;
      vertical-align: middle;
    }

    .time-slot {
      width: 100px;
    }

    .day-header {
      width: calc((100% - 100px) / 7);
    }
  }

  .schedule-row {
    display: table-row;

    .time-slot {
      display: table-cell;
      background-color: $bg-light;
      padding: $spacing-sm;
      text-align: center;
      vertical-align: middle;

      .period {
        font-weight: 600;
        color: $text-primary;
        margin-bottom: 4px;
      }

      .time {
        font-size: 12px;
        color: $text-regular;
      }
    }

    .schedule-cell {
      display: table-cell;
      background-color: white;
      padding: 4px;
      vertical-align: middle;
      min-height: 60px;

      .course-item {
        padding: $spacing-sm;
        border-radius: 6px;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

        &.course-type-required {
          background: linear-gradient(135deg, #f56c6c, #f78989);
          color: white;
        }

        &.course-type-elective {
          background: linear-gradient(135deg, #67c23a, #85ce61);
          color: white;
        }

        &.course-type-public {
          background: linear-gradient(135deg, #909399, #b1b3b8);
          color: white;
        }

        &.course-type-professional {
          background: linear-gradient(135deg, #e6a23c, #ebb563);
          color: white;
        }

        .course-name {
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 4px;
          line-height: 1.2;
        }

        .course-info {
          font-size: 11px;
          opacity: 0.9;

          .teacher {
            margin-bottom: 2px;
          }

          .classroom {
            font-size: 10px;
          }
        }
      }
    }
  }
}

.course-list-card {
  border: none;
  box-shadow: $box-shadow-light;

  .schedule-time {
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .no-schedule {
    color: $text-placeholder;
    font-style: italic;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .student-schedule {
    padding: $spacing-md;
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

  .schedule-grid {
    .schedule-table {
      min-width: 600px;
    }

    .schedule-cell {
      .course-item {
        .course-name {
          font-size: 12px;
        }

        .course-info {
          font-size: 10px;
        }
      }
    }
  }
}
</style>
