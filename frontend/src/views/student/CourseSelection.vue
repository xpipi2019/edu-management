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
                <el-option label="必修课" :value="CourseType.REQUIRED" />
                <el-option label="选修课" :value="CourseType.ELECTIVE" />
                <el-option label="公选课" :value="CourseType.PUBLIC_ELECTIVE" />
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
              :key="offering.offering_id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <el-card class="course-card" shadow="hover">
                <template #header>
                  <div class="course-header">
                    <h4>{{ offering.course?.course_name || '未知课程' }}</h4>
                    <el-tag :type="getCourseTypeTag(offering.course?.course_type)">
                      {{ getCourseTypeText(offering.course?.course_type) }}
                    </el-tag>
                  </div>
                </template>

                <div class="course-info">
                  <p><strong>课程代码：</strong>{{ offering.course?.course_code || '-' }}</p>
                  <p><strong>学分：</strong>{{ offering.course?.credits || 0 }}学分</p>
                  <p><strong>学时：</strong>{{ offering.course?.hours || '待定' }}学时</p>
                  <p><strong>任课教师：</strong>{{ getTeacherName(offering.teacher) }}</p>
                  <p><strong>上课时间：</strong>{{ formatSchedule([]) }}</p>
                  <p><strong>教室：</strong>{{ '待安排' }}</p>
                  <p><strong>容量：</strong>{{ offering.current_students || 0 }}/{{ offering.max_students || '无限制' }}</p>

                  <div class="course-description" v-if="offering.course?.description">
                    <p><strong>课程简介：</strong></p>
                    <p class="description-text">{{ offering.course.description }}</p>
                  </div>
                </div>

                <template #footer>
                  <div class="course-actions">
                    <el-button
                      type="primary"
                      :disabled="!canSelectCourse(offering)"
                      @click="handleSelectCourse(offering)"
                      :loading="selectingCourseId === offering.offering_id"
                    >
                      {{ isSelected(offering.offering_id) ? '已选择' : '选择课程' }}
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
            <el-table-column label="课程名称">
              <template #default="{ row }">
                {{ row.course_offering?.course?.course_name || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="课程代码">
              <template #default="{ row }">
                {{ row.course_offering?.course?.course_code || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="学分">
              <template #default="{ row }">
                {{ row.course_offering?.course?.credits || 0 }}
              </template>
            </el-table-column>
            <el-table-column label="任课教师">
              <template #default="{ row }">
                {{ getTeacherName(row.course_offering?.teacher) }}
              </template>
            </el-table-column>
            <el-table-column label="上课时间">
              <template #default="{ row }">
                {{ formatSchedule([]) }}
              </template>
            </el-table-column>
            <el-table-column label="教室">
              <template #default="{ row }">
                {{ '待安排' }}
              </template>
            </el-table-column>
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
                  :disabled="row.status !== EnrollmentStatus.ENROLLED"
                  @click="handleDropCourse(row)"
                  :loading="droppingCourseId === row.enrollment_id"
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
                <el-table-column label="课程名称">
                  <template #default="{ row }">
                    {{ row.course_offering?.course?.course_name || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="课程代码">
                  <template #default="{ row }">
                    {{ row.course_offering?.course?.course_code || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="课程类型">
                  <template #default="{ row }">
                    <el-tag :type="getCourseTypeTag(row.course_offering?.course?.course_type)">
                      {{ getCourseTypeText(row.course_offering?.course?.course_type) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="学分">
                  <template #default="{ row }">
                    {{ row.course_offering?.course?.credits || 0 }}
                  </template>
                </el-table-column>
                <el-table-column label="任课教师">
                  <template #default="{ row }">
                    {{ getTeacherName(row.course_offering?.teacher) }}
                  </template>
                </el-table-column>
                <el-table-column label="上课时间">
                  <template #default="{ row }">
                    {{ formatSchedule([]) }}
                  </template>
                </el-table-column>
                <el-table-column label="教室">
                  <template #default="{ row }">
                    {{ '待安排' }}
                  </template>
                </el-table-column>
                <el-table-column label="成绩">
                  <template #default="{ row }">
                    <span class="no-grade">未录入</span>
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
            {{ selectedOffering.course?.course_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="课程代码">
            {{ selectedOffering.course?.course_code || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="课程类型">
            <el-tag :type="getCourseTypeTag(selectedOffering.course?.course_type)">
              {{ getCourseTypeText(selectedOffering.course?.course_type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="学分">
            {{ selectedOffering.course?.credits || 0 }}学分
          </el-descriptions-item>
          <el-descriptions-item label="学时">
            {{ selectedOffering.course?.hours || 0 }}学时
          </el-descriptions-item>
          <el-descriptions-item label="任课教师">
            {{ getTeacherName(selectedOffering.teacher) }}
          </el-descriptions-item>
          <el-descriptions-item label="学期">
            {{ selectedOffering.semester }}
          </el-descriptions-item>
          <el-descriptions-item label="学年">
            {{ '2024-2025' }}
          </el-descriptions-item>
          <el-descriptions-item label="上课时间" :span="2">
            {{ formatSchedule([]) }}
          </el-descriptions-item>
          <el-descriptions-item label="教室">
            {{ '待安排' }}
          </el-descriptions-item>
          <el-descriptions-item label="容量">
            {{ selectedOffering.current_students }}/{{ selectedOffering.max_students }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="selectedOffering.course?.description" class="course-description-detail">
          <h4>课程简介</h4>
          <p>{{ selectedOffering.course.description }}</p>
        </div>
      </div>

      <template #footer>
        <el-button @click="handleCloseDetail">关闭</el-button>
        <el-button
          v-if="selectedOffering && !isSelected(selectedOffering.offering_id)"
          type="primary"
          :disabled="!canSelectCourse(selectedOffering)"
          @click="handleSelectCourse(selectedOffering)"
          :loading="selectingCourseId === selectedOffering.offering_id"
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
import { OfferingStatus, CourseType, EnrollmentStatus } from '@/types/database'
import type {
  CourseOffering,
  CourseOfferingQuery,
  Enrollment,
  Schedule
} from '@/types/database'

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
  status: OfferingStatus.ACTIVE
})

// 数据列表
const availableOfferings = ref<CourseOffering[]>([])
const selectedCourses = ref<Enrollment[]>([])

// 计算属性
const selectedCredits = computed(() => {
  return selectedCourses.value
    .filter(enrollment => enrollment.status === EnrollmentStatus.ENROLLED)
    .reduce((total, enrollment) => {
      const credits = enrollment.course_offering?.course?.credits || 0
      return total + credits
    }, 0)
})

const mySchedules = computed(() => {
  const schedules: Schedule[] = []
  // 这里应该从后端获取课程表数据，暂时返回空数组
  return schedules
})

const filteredMySchedules = computed(() => {
  if (!selectedSemester.value && !selectedAcademicYear.value) return mySchedules.value

  return mySchedules.value.filter(schedule => {
    // 这里应该根据学期和学年进行筛选
    return true
  })
})

const weekCourseCount = computed(() => {
  return filteredMySchedules.value.filter(schedule => {
    // 这里应该计算本周的课程数量
    return schedule.day_of_week <= 7
  }).length
})

const approvedCourses = computed(() => {
  return selectedCourses.value.filter(enrollment => enrollment.status === EnrollmentStatus.ENROLLED)
})

const totalCredits = computed(() => {
  return approvedCourses.value.reduce((total, enrollment) => {
    const credits = enrollment.course_offering?.course?.credits || 0
    return total + credits
  }, 0)
})

const averageGPA = computed(() => {
  if (approvedCourses.value.length === 0) return 0
  // 这里应该计算实际的GPA，暂时返回0
  return 0
})

// 生命周期
onMounted(() => {
  fetchAvailableOfferings()
  fetchMyEnrollments()

  // 设置默认值
  setTimeout(() => {
    selectedSemester.value = '春季学期'
    selectedAcademicYear.value = '2024-2025'
  }, 1000)
})

// 方法
const fetchAvailableOfferings = async () => {
  try {
    loading.value = true
    const response = await courseOfferingApi.getList({
      page: queryForm.page,
      pageSize: queryForm.pageSize,
      status: OfferingStatus.ACTIVE
    })
    availableOfferings.value = response.data.list || []
    total.value = response.data.total || 0
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
    selectedCourses.value = response.data || []
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
    enrollment.offering_id === offeringId
  )
}

const canSelectCourse = (offering: CourseOffering): boolean => {
  if (isSelected(offering.offering_id)) return false

  if (offering.max_students && offering.current_students >= offering.max_students) return false

  // 这里应该检查时间冲突，暂时返回true
  return true
}

const handleSelectCourse = async (offering: CourseOffering) => {
  try {
    selectingCourseId.value = offering.offering_id

    await enrollmentApi.create({
      student_id: 1, // 这里应该从用户状态获取
      offering_id: offering.offering_id
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
      `确定要退选课程"${enrollment.course_offering?.course?.course_name}"吗？`,
      '确认退课',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    droppingCourseId.value = enrollment.enrollment_id
    await enrollmentApi.delete(enrollment.enrollment_id)

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
  // 处理课程点击事件
}

const formatSchedule = (schedules: Schedule[]): string => {
  if (!schedules || schedules.length === 0) return '待安排'

  const weekDays = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

  return schedules.map(schedule =>
    `${weekDays[schedule.day_of_week] || '未知'} 第${schedule.start_time}-${schedule.end_time}节`
  ).join(', ')
}

const getCourseTypeTag = (type?: CourseType): string => {
  if (!type) return 'info'
  const typeMap: Record<CourseType, string> = {
    [CourseType.REQUIRED]: 'danger',
    [CourseType.ELECTIVE]: 'warning',
    [CourseType.PUBLIC_ELECTIVE]: 'success'
  }
  return typeMap[type] || 'info'
}

const getCourseTypeText = (type?: CourseType): string => {
  if (!type) return '未知'
  const typeMap: Record<CourseType, string> = {
    [CourseType.REQUIRED]: '必修课',
    [CourseType.ELECTIVE]: '选修课',
    [CourseType.PUBLIC_ELECTIVE]: '公选课'
  }
  return typeMap[type] || '未知'
}

const getEnrollmentStatusTag = (status: EnrollmentStatus): string => {
  const statusMap: Record<EnrollmentStatus, string> = {
    [EnrollmentStatus.WITHDRAWN]: 'info',
    [EnrollmentStatus.ENROLLED]: 'success',
    [EnrollmentStatus.PENDING]: 'warning'
  }
  return statusMap[status] || 'info'
}

const getEnrollmentStatusText = (status: EnrollmentStatus): string => {
  const statusMap: Record<EnrollmentStatus, string> = {
    [EnrollmentStatus.WITHDRAWN]: '已退课',
    [EnrollmentStatus.ENROLLED]: '已选课',
    [EnrollmentStatus.PENDING]: '待审核'
  }
  return statusMap[status] || '未知'
}

const getTeacherName = (teacher: any): string => {
  if (teacher?.user?.real_name) {
    return teacher.user.real_name
  } else if (teacher?.real_name) {
    return teacher.real_name
  } else {
    return '待安排'
  }
}

const handleFilterSchedule = () => {
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
  .course-description-detail {
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
