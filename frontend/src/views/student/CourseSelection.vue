<template>
  <div class="course-selection">
    <div class="course-selection__header">
      <h2>课程选课</h2>
      <div class="header-stats">
        <el-statistic title="已选学分" :value="selectedCredits" suffix="学分" />
        <el-statistic title="已选课程" :value="selectedCourses.length" suffix="门" />
      </div>
    </div>

    <el-tabs v-model="activeTab" class="course-tabs">
      <!-- 可选课程 -->
      <el-tab-pane label="可选课程" name="available">
        <div class="course-filters">
          <el-form :model="queryForm" inline>
            <el-form-item label="课程名称">
              <el-input
                v-model="queryForm.name"
                placeholder="请输入课程名称"
                clearable
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="课程类型">
              <el-select v-model="queryForm.type" placeholder="请选择课程类型" clearable>
                <el-option label="必修课" value="REQUIRED" />
                <el-option label="选修课" value="ELECTIVE" />
                <el-option label="公共课" value="PUBLIC" />
                <el-option label="专业课" value="PROFESSIONAL" />
              </el-select>
            </el-form-item>
            <el-form-item label="学分">
              <el-select v-model="queryForm.credits" placeholder="请选择学分" clearable>
                <el-option label="1学分" :value="1" />
                <el-option label="2学分" :value="2" />
                <el-option label="3学分" :value="3" />
                <el-option label="4学分" :value="4" />
                <el-option label="5学分" :value="5" />
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
        </div>

        <div class="course-list">
          <el-row :gutter="16">
            <el-col
              v-for="offering in availableOfferings"
              :key="offering.id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <el-card class="course-card" shadow="hover">
                <template #header>
                  <div class="course-header">
                    <h4>{{ offering.course.name }}</h4>
                    <el-tag :type="getCourseTypeTag(offering.course.type)">
                      {{ getCourseTypeText(offering.course.type) }}
                    </el-tag>
                  </div>
                </template>

                <div class="course-info">
                  <p><strong>课程代码：</strong>{{ offering.course.code }}</p>
                  <p><strong>学分：</strong>{{ offering.course.credits }}学分</p>
                  <p><strong>学时：</strong>{{ offering.course.hours || '待定' }}学时</p>
                  <p><strong>任课教师：</strong>{{ getTeacherName(offering.teacher) }}</p>
                  <p><strong>上课时间：</strong>{{ formatSchedule(offering.schedules || []) }}</p>
                  <p><strong>教室：</strong>{{ offering.classroom || '待安排' }}</p>
                  <p><strong>容量：</strong>{{ offering.currentStudents || 0 }}/{{ offering.maxStudents || '无限制' }}</p>

                  <div class="course-description" v-if="offering.course.description">
                    <p><strong>课程简介：</strong></p>
                    <p class="description-text">{{ offering.course.description }}</p>
                  </div>

                  <div class="prerequisites" v-if="offering.course.prerequisites?.length">
                    <p><strong>先修课程：</strong></p>
                    <el-tag
                      v-for="prereq in offering.course.prerequisites"
                      :key="prereq.id"
                      size="small"
                      class="prereq-tag"
                    >
                      {{ prereq.name }}
                    </el-tag>
                  </div>
                </div>

                <template #footer>
                  <div class="course-actions">
                    <el-button
                      type="primary"
                      :disabled="!canSelectCourse(offering)"
                      @click="handleSelectCourse(offering)"
                      :loading="selectingCourseId === offering.id"
                    >
                      {{ isSelected(offering.id) ? '已选择' : '选择课程' }}
                    </el-button>
                    <el-button
                      type="info"
                      text
                      @click="handleViewDetails(offering)"
                    >
                      查看详情
                    </el-button>
                  </div>
                </template>
              </el-card>
            </el-col>
          </el-row>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="queryForm.page"
              v-model:page-size="queryForm.pageSize"
              :total="total"
              :page-sizes="[12, 24, 48]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSearch"
              @current-change="handleSearch"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- 已选课程 -->
      <el-tab-pane label="已选课程" name="selected">
        <div class="selected-courses">
          <el-alert
            v-if="selectedCourses.length === 0"
            title="暂无已选课程"
            type="info"
            :closable="false"
            show-icon
          />

          <el-table v-else :data="selectedCourses" stripe>
            <el-table-column prop="courseOffering.course.name" label="课程名称" />
            <el-table-column prop="courseOffering.course.code" label="课程代码" />
            <el-table-column prop="courseOffering.course.credits" label="学分" />
            <el-table-column label="任课教师">
              <template #default="{ row }">
                {{ getTeacherName(row.courseOffering.teacher) }}
              </template>
            </el-table-column>
            <el-table-column label="上课时间">
              <template #default="{ row }">
                {{ formatSchedule(row.courseOffering.schedules) }}
              </template>
            </el-table-column>
            <el-table-column prop="courseOffering.classroom" label="教室" />
            <el-table-column label="选课状态">
              <template #default="{ row }">
                <el-tag :type="getEnrollmentStatusTag(row.status)">
                  {{ getEnrollmentStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button
                  type="danger"
                  size="small"
                  text
                  :disabled="row.status !== 'PENDING'"
                  @click="handleDropCourse(row)"
                  :loading="droppingCourseId === row.id"
                >
                  退课
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 我的课程表 -->
      <el-tab-pane label="我的课程表" name="schedule">
        <div class="my-schedule">
          <div class="schedule-controls">
            <el-form inline>
              <el-form-item label="查看周次">
                <el-select v-model="selectedWeek" placeholder="选择周次">
                  <el-option
                    v-for="week in 20"
                    :key="week"
                    :label="`第${week}周`"
                    :value="week"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="学期">
                <el-select v-model="selectedSemester" placeholder="请选择学期" clearable>
                  <el-option label="春季学期" value="春季学期" />
                  <el-option label="秋季学期" value="秋季学期" />
                  <el-option label="夏季学期" value="夏季学期" />
                </el-select>
              </el-form-item>
              <el-form-item label="学年">
                <el-select v-model="selectedAcademicYear" placeholder="请选择学年" clearable>
                  <el-option label="2023-2024" value="2023-2024" />
                  <el-option label="2024-2025" value="2024-2025" />
                  <el-option label="2025-2026" value="2025-2026" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleFilterSchedule">
                  <el-icon><Search /></el-icon>
                  筛选
                </el-button>
                <el-button @click="handleResetScheduleFilter">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="schedule-stats">
            <el-row :gutter="16">
              <el-col :span="6">
                <el-statistic title="本周课程" :value="weekCourseCount" suffix="门" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="本学期课程" :value="approvedCourses.length" suffix="门" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="本学期学分" :value="totalCredits" suffix="学分" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="平均绩点" :value="averageGPA" :precision="2" />
              </el-col>
            </el-row>
          </div>

          <ScheduleGrid
            :schedules="filteredMySchedules"
            :selected-week="selectedWeek"
            title="我的课程表"
            :printable="true"
            :show-weeks="true"
            :show-legend="true"
            @course-click="handleCourseClick"
          />

          <!-- 课程详细信息统计 -->
          <div class="course-summary">
            <el-card class="summary-card">
              <template #header>
                <h4>课程详细信息</h4>
              </template>
              <el-table :data="approvedCourses" stripe>
                <el-table-column prop="courseOffering.course.name" label="课程名称" />
                <el-table-column prop="courseOffering.course.code" label="课程代码" />
                <el-table-column label="课程类型">
                  <template #default="{ row }">
                    <el-tag :type="getCourseTypeTag(row.courseOffering.course.type)">
                      {{ getCourseTypeText(row.courseOffering.course.type) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="courseOffering.course.credits" label="学分" />
                <el-table-column label="任课教师">
                  <template #default="{ row }">
                    {{ getTeacherName(row.courseOffering.teacher) }}
                  </template>
                </el-table-column>
                <el-table-column label="上课时间">
                  <template #default="{ row }">
                    {{ formatSchedule(row.courseOffering.schedules || []) }}
                  </template>
                </el-table-column>
                <el-table-column prop="courseOffering.classroom" label="教室" />
                <el-table-column label="成绩">
                  <template #default="{ row }">
                    <span v-if="row.grade">{{ row.grade.totalScore || '未录入' }}</span>
                    <span v-else class="no-grade">未录入</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 课程详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="课程详情"
      width="600px"
      :before-close="handleCloseDetail"
    >
      <div v-if="selectedOffering" class="course-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="课程名称">
            {{ selectedOffering.course.name }}
          </el-descriptions-item>
          <el-descriptions-item label="课程代码">
            {{ selectedOffering.course.code }}
          </el-descriptions-item>
          <el-descriptions-item label="课程类型">
            <el-tag :type="getCourseTypeTag(selectedOffering.course.type)">
              {{ getCourseTypeText(selectedOffering.course.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="学分">
            {{ selectedOffering.course.credits }}学分
          </el-descriptions-item>
          <el-descriptions-item label="学时">
            {{ selectedOffering.course.hours }}学时
          </el-descriptions-item>
          <el-descriptions-item label="任课教师">
            {{ getTeacherName(selectedOffering.teacher) }}
          </el-descriptions-item>
          <el-descriptions-item label="学期">
            {{ selectedOffering.semester }}
          </el-descriptions-item>
          <el-descriptions-item label="学年">
            {{ selectedOffering.academicYear }}
          </el-descriptions-item>
          <el-descriptions-item label="上课时间" :span="2">
            {{ formatSchedule(selectedOffering.schedules) }}
          </el-descriptions-item>
          <el-descriptions-item label="教室">
            {{ selectedOffering.classroom || '待安排' }}
          </el-descriptions-item>
          <el-descriptions-item label="容量">
            {{ selectedOffering.currentStudents }}/{{ selectedOffering.maxStudents }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="selectedOffering.course.description" class="course-description-detail">
          <h4>课程简介</h4>
          <p>{{ selectedOffering.course.description }}</p>
        </div>

        <div v-if="selectedOffering.course.prerequisites?.length" class="prerequisites-detail">
          <h4>先修课程</h4>
          <el-tag
            v-for="prereq in selectedOffering.course.prerequisites"
            :key="prereq.id"
            class="prereq-tag"
          >
            {{ prereq.name }}
          </el-tag>
        </div>
      </div>

      <template #footer>
        <el-button @click="handleCloseDetail">关闭</el-button>
        <el-button
          v-if="selectedOffering && !isSelected(selectedOffering.id)"
          type="primary"
          :disabled="!canSelectCourse(selectedOffering)"
          @click="handleSelectCourse(selectedOffering)"
          :loading="selectingCourseId === selectedOffering.id"
        >
          选择课程
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { courseOfferingApi, enrollmentApi } from '@/api/modules/course'
import { ScheduleGrid } from '@/components/business/ScheduleGrid'
import { OfferingStatus, CourseType, EnrollmentStatus } from '@/types/course'
import type {
  CourseOffering,
  CourseOfferingQuery,
  Enrollment,
  Schedule
} from '@/types/course'

// 响应式数据
const activeTab = ref('available')
const loading = ref(false)
const total = ref(0)
const selectedWeek = ref(1)
const selectingCourseId = ref<number | null>(null)
const droppingCourseId = ref<number | null>(null)
const detailDialogVisible = ref(false)
const selectedOffering = ref<CourseOffering | null>(null)
const selectedSemester = ref('')
const selectedAcademicYear = ref('')

// 查询表单
const queryForm = reactive({
  page: 1,
  pageSize: 12,
  keyword: '',
  name: '',
  type: undefined as CourseType | undefined,
  credits: undefined as number | undefined,
  status: 'ENROLLMENT' as const // 只显示选课中的课程
})

// 数据列表
const availableOfferings = ref<CourseOffering[]>([])
const selectedCourses = ref<Enrollment[]>([])

// 计算属性
const selectedCredits = computed(() => {
  return selectedCourses.value
    .filter(enrollment => enrollment.status === 'APPROVED')
    .reduce((total, enrollment) => total + enrollment.courseOffering.course.credits, 0)
})

const mySchedules = computed(() => {
  const schedules: Schedule[] = []
  selectedCourses.value
    .filter(enrollment => enrollment.status === 'APPROVED')
    .forEach(enrollment => {
      if (enrollment.courseOffering?.schedules) {
        enrollment.courseOffering.schedules.forEach(schedule => {
          schedules.push({
            ...schedule,
            courseOffering: enrollment.courseOffering
          })
        })
      }
    })
  return schedules
})

const filteredMySchedules = computed(() => {
  if (!selectedSemester.value && !selectedAcademicYear.value) return mySchedules.value

  return mySchedules.value.filter(schedule => {
    const courseOffering = schedule.courseOffering
    if (!courseOffering) return false

    let matchSemester = true
    let matchAcademicYear = true

    if (selectedSemester.value) {
      matchSemester = courseOffering.semester === selectedSemester.value
    }

    if (selectedAcademicYear.value) {
      matchAcademicYear = courseOffering.academicYear === selectedAcademicYear.value
    }

    return matchSemester && matchAcademicYear
  })
})

const weekCourseCount = computed(() => {
  return filteredMySchedules.value.filter(schedule =>
    schedule.weeks?.includes(selectedWeek.value) &&
    schedule.dayOfWeek <= 7 // 只计算本周的课程
  ).length
})

const approvedCourses = computed(() => {
  return selectedCourses.value.filter(enrollment => enrollment.status === 'APPROVED')
})

const totalCredits = computed(() => {
  return approvedCourses.value.reduce((total, enrollment) => total + enrollment.courseOffering.course.credits, 0)
})

const averageGPA = computed(() => {
  if (approvedCourses.value.length === 0) return 0

  const totalScore = approvedCourses.value.reduce((total, enrollment) => total + (enrollment.grade?.totalScore || 0), 0)
  return totalScore / approvedCourses.value.length
})

// 生命周期
onMounted(() => {
  fetchAvailableOfferings()
  fetchMyEnrollments()

  // 根据已选课程设置默认学期和学年
  setTimeout(() => {
    if (selectedCourses.value.length > 0) {
      const firstCourse = selectedCourses.value[0]
      if (firstCourse.courseOffering) {
        selectedSemester.value = firstCourse.courseOffering.semester || '春季学期'
        selectedAcademicYear.value = firstCourse.courseOffering.academicYear || '2024-2025'
      }
    } else {
      // 设置默认值
      selectedSemester.value = '春季学期'
      selectedAcademicYear.value = '2024-2025'
    }
  }, 1000)
})

// 方法
const fetchAvailableOfferings = async () => {
  try {
    loading.value = true
    const response = await courseOfferingApi.getCourseOfferings({
      page: queryForm.page,
      pageSize: queryForm.pageSize,
      keyword: queryForm.name || queryForm.keyword,
      status: OfferingStatus.ENROLLMENT
    })
    availableOfferings.value = response.list || []
    total.value = response.total || 0
  } catch (error) {
    console.error('获取可选课程失败:', error)
    ElMessage.error('获取可选课程失败')
    availableOfferings.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const fetchMyEnrollments = async () => {
  try {
    const response = await enrollmentApi.getMyEnrollments()
    // 根据API返回格式适配
    if (Array.isArray(response)) {
      selectedCourses.value = response
    } else if (response && (response as any).data && Array.isArray((response as any).data)) {
      selectedCourses.value = (response as any).data
    } else {
      selectedCourses.value = []
    }
  } catch (error) {
    console.error('获取已选课程失败:', error)
    ElMessage.error('获取已选课程失败')
    selectedCourses.value = []
  }
}

const handleSearch = () => {
  queryForm.page = 1
  fetchAvailableOfferings()
}

const handleReset = () => {
  queryForm.keyword = ''
  queryForm.name = ''
  queryForm.type = undefined
  queryForm.credits = undefined
  queryForm.page = 1
  fetchAvailableOfferings()
}

const isSelected = (offeringId: number): boolean => {
  return selectedCourses.value.some(enrollment =>
    enrollment.courseOfferingId === offeringId
  )
}

const canSelectCourse = (offering: CourseOffering): boolean => {
  if (isSelected(offering.id)) return false

  if (offering.maxStudents && offering.currentStudents >= offering.maxStudents) return false

  const hasConflict = selectedCourses.value.some(enrollment => {
    if (enrollment.status !== 'APPROVED') return false

    if (!offering.schedules || !enrollment.courseOffering?.schedules) return false

    return offering.schedules.some(newSchedule =>
      enrollment.courseOffering.schedules.some(existingSchedule =>
        newSchedule.dayOfWeek === existingSchedule.dayOfWeek &&
        !(newSchedule.endTime < existingSchedule.startTime ||
          newSchedule.startTime > existingSchedule.endTime)
      )
    )
  })

  return !hasConflict
}

const handleSelectCourse = async (offering: CourseOffering) => {
  try {
    selectingCourseId.value = offering.id

    await enrollmentApi.createEnrollment({
      studentId: 0, // 这里应该从用户状态获取
      courseOfferingId: offering.id
    })

    ElMessage.success('选课成功，等待审核')
    await fetchMyEnrollments()

    // 关闭详情弹窗
    if (detailDialogVisible.value) {
      detailDialogVisible.value = false
    }
  } catch (error) {
    ElMessage.error('选课失败')
  } finally {
    selectingCourseId.value = null
  }
}

const handleDropCourse = async (enrollment: Enrollment) => {
  try {
    await ElMessageBox.confirm(
      `确定要退选课程"${enrollment.courseOffering.course.name}"吗？`,
      '确认退课',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    droppingCourseId.value = enrollment.id
    await enrollmentApi.deleteEnrollment(enrollment.id)

    ElMessage.success('退课成功')
    await fetchMyEnrollments()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('退课失败')
    }
  } finally {
    droppingCourseId.value = null
  }
}

const handleViewDetails = (offering: CourseOffering) => {
  selectedOffering.value = offering
  detailDialogVisible.value = true
}

const handleCloseDetail = () => {
  detailDialogVisible.value = false
  selectedOffering.value = null
}

const handleCourseClick = (schedule: Schedule) => {
  if (schedule.courseOffering) {
    handleViewDetails(schedule.courseOffering)
  }
}

const formatSchedule = (schedules: Schedule[]): string => {
  if (!schedules || schedules.length === 0) return '待安排'

  const weekDays = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

  return schedules.map(schedule =>
    `${weekDays[schedule.dayOfWeek] || '未知'} 第${schedule.startTime}-${schedule.endTime}节`
  ).join(', ')
}

const getCourseTypeTag = (type: CourseType): string => {
  const typeMap = {
    REQUIRED: 'danger',
    ELECTIVE: 'warning',
    PUBLIC: 'info',
    PROFESSIONAL: 'success'
  }
  return typeMap[type] || 'info'
}

const getCourseTypeText = (type: CourseType): string => {
  const typeMap = {
    REQUIRED: '必修课',
    ELECTIVE: '选修课',
    PUBLIC: '公共课',
    PROFESSIONAL: '专业课'
  }
  return typeMap[type] || '未知'
}

const getEnrollmentStatusTag = (status: EnrollmentStatus): string => {
  const statusMap = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    DROPPED: 'info'
  }
  return statusMap[status] || 'info'
}

const getEnrollmentStatusText = (status: EnrollmentStatus): string => {
  const statusMap = {
    PENDING: '待审核',
    APPROVED: '已批准',
    REJECTED: '已拒绝',
    DROPPED: '已退课'
  }
  return statusMap[status] || '未知'
}

const getTeacherName = (teacher: any): string => {
  if (teacher && teacher.user && teacher.user.realName) {
    return teacher.user.realName
  } else if (teacher && teacher.realName) {
    return teacher.realName
  } else {
    return '待安排'
  }
}

const handleFilterSchedule = () => {
  // 筛选功能已通过computed属性自动实现
  ElMessage.success('课程表筛选完成')
}

const handleResetScheduleFilter = () => {
  selectedSemester.value = ''
  selectedAcademicYear.value = ''
  selectedWeek.value = 1
  ElMessage.info('筛选条件已重置')
}
</script>

<style lang="scss" scoped>
.course-selection {
  padding: 20px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      margin: 0;
      color: #303133;
    }

    .header-stats {
      display: flex;
      gap: 40px;
    }
  }
}

.course-tabs {
  .course-filters {
    background: #f8f9fa;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
}

.course-list {
  .course-card {
    margin-bottom: 16px;
    height: 100%;

    .course-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h4 {
        margin: 0;
        color: #303133;
        font-size: 16px;
      }
    }

    .course-info {
      p {
        margin: 8px 0;
        font-size: 14px;
        color: #606266;

        strong {
          color: #303133;
        }
      }

      .description-text {
        color: #909399;
        font-size: 13px;
        line-height: 1.5;
        margin-top: 4px;
      }

      .prerequisites {
        margin-top: 12px;

        .prereq-tag {
          margin: 2px 4px 2px 0;
        }
      }
    }

    .course-actions {
      display: flex;
      gap: 8px;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }
}

.selected-courses {
  .el-table {
    margin-top: 16px;
  }
}

.my-schedule {
  .schedule-controls {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;

    .el-form {
      .el-form-item {
        margin-right: 16px;
        margin-bottom: 12px;

        &:last-child {
          margin-right: 0;
        }

        .el-select {
          min-width: 140px;
        }

        &:nth-child(2), &:nth-child(3) {
          .el-select {
            min-width: 150px;
          }
        }
      }
    }
  }

  .schedule-stats {
    margin-bottom: 20px;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    color: #fff;

    :deep(.el-statistic) {
      .el-statistic__head {
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        margin-bottom: 8px;
      }

      .el-statistic__content {
        color: #fff;
        font-weight: bold;
        font-size: 24px;

        .el-statistic__suffix {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          margin-left: 4px;
        }
      }
    }
  }

  .course-summary {
    margin-top: 30px;

    .summary-card {
      h4 {
        margin: 0;
        color: #303133;
        font-size: 16px;
      }

      :deep(.el-table) {
        .no-grade {
          color: #c0c4cc;
          font-style: italic;
        }
      }
    }
  }
}

.course-detail {
  .course-description-detail,
  .prerequisites-detail {
    margin-top: 20px;

    h4 {
      margin: 0 0 12px 0;
      color: #303133;
      font-size: 16px;
    }

    p {
      margin: 0;
      color: #606266;
      line-height: 1.6;
    }

    .prereq-tag {
      margin: 4px 8px 4px 0;
    }
  }
}

@media (max-width: 768px) {
  .course-selection {
    padding: 12px;

    &__header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;

      .header-stats {
        justify-content: space-around;
      }
    }
  }

  .course-filters {
    .el-form {
      .el-form-item {
        width: 100%;
        margin-bottom: 12px;

        .el-input,
        .el-select {
          width: 100%;
        }
      }
    }
  }
}
</style>
