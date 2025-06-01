<template>
  <BaseModal
    v-model="visible"
    title="课程详情"
    width="800px"
    :show-footer="false"
  >
    <div class="course-detail-dialog" v-if="offering">
      <!-- 基本信息 -->
      <el-card class="info-section" shadow="never">
        <template #header>
          <div class="section-header">
            <span>基本信息</span>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="课程代码">
            {{ offering.course?.code }}
          </el-descriptions-item>
          <el-descriptions-item label="课程名称">
            {{ offering.course?.name }}
          </el-descriptions-item>
          <el-descriptions-item label="学分">
            {{ offering.course?.credits }}
          </el-descriptions-item>
          <el-descriptions-item label="学时">
            {{ offering.course?.hours }}
          </el-descriptions-item>
          <el-descriptions-item label="课程类型">
            <el-tag :type="getCourseTypeColor(offering.course?.type)" size="small">
              {{ getCourseTypeText(offering.course?.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getOfferingStatusColor(offering.status)" size="small">
              {{ getOfferingStatusText(offering.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 开课信息 -->
      <el-card class="info-section" shadow="never">
        <template #header>
          <div class="section-header">
            <span>开课信息</span>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="学期">
            {{ offering.semester }}
          </el-descriptions-item>
          <el-descriptions-item label="学年">
            {{ offering.academicYear }}
          </el-descriptions-item>
          <el-descriptions-item label="任课教师">
            {{ offering.teacher?.user?.realName }}
          </el-descriptions-item>
          <el-descriptions-item label="教室">
            {{ offering.classroom || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="容量">
            {{ offering.maxStudents }}
          </el-descriptions-item>
          <el-descriptions-item label="已选人数">
            <span :class="{ 'text-danger': offering.currentStudents >= offering.maxStudents }">
              {{ offering.currentStudents }}
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 上课时间 -->
      <el-card class="info-section" shadow="never">
        <template #header>
          <div class="section-header">
            <span>上课时间</span>
          </div>
        </template>

        <div class="schedule-grid">
          <div v-if="offering.schedules && offering.schedules.length > 0">
            <div
              v-for="schedule in offering.schedules"
              :key="schedule.id"
              class="schedule-item"
            >
              <div class="schedule-time">
                <el-icon><Clock /></el-icon>
                <span>
                  周{{ getDayText(schedule.dayOfWeek) }}
                  第{{ schedule.startTime }}-{{ schedule.endTime }}节
                </span>
              </div>
              <div class="schedule-location">
                <el-icon><Location /></el-icon>
                <span>{{ schedule.classroom || offering.classroom || '-' }}</span>
              </div>
              <div class="schedule-weeks">
                <el-icon><Calendar /></el-icon>
                <span>第{{ getWeeksText(schedule.weeks) }}周</span>
              </div>
            </div>
          </div>
          <div v-else class="no-schedule">
            <el-empty description="暂无排课信息" />
          </div>
        </div>
      </el-card>

      <!-- 课程描述 -->
      <el-card class="info-section" shadow="never" v-if="offering.course?.description">
        <template #header>
          <div class="section-header">
            <span>课程描述</span>
          </div>
        </template>

        <div class="course-description">
          {{ offering.course.description }}
        </div>
      </el-card>

      <!-- 先修课程 -->
      <el-card class="info-section" shadow="never" v-if="offering.course?.prerequisites && offering.course.prerequisites.length > 0">
        <template #header>
          <div class="section-header">
            <span>先修课程</span>
          </div>
        </template>

        <div class="prerequisites">
          <el-tag
            v-for="prerequisite in offering.course.prerequisites"
            :key="prerequisite.id"
            type="info"
            size="small"
            class="prerequisite-tag"
          >
            {{ prerequisite.code }} - {{ prerequisite.name }}
          </el-tag>
        </div>
      </el-card>

      <!-- 统计信息 -->
      <el-card class="info-section" shadow="never">
        <template #header>
          <div class="section-header">
            <span>统计信息</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon" style="background: #409eff20">
                <el-icon color="#409eff" size="20">
                  <User />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ offering.currentStudents }}</div>
                <div class="stat-label">选课人数</div>
              </div>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon" style="background: #67c23a20">
                <el-icon color="#67c23a" size="20">
                  <DocumentChecked />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ getEnrollmentRate() }}%</div>
                <div class="stat-label">选课率</div>
              </div>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon" style="background: #e6a23c20">
                <el-icon color="#e6a23c" size="20">
                  <Star />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ offering.course?.credits }}</div>
                <div class="stat-label">课程学分</div>
              </div>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon" style="background: #f56c6c20">
                <el-icon color="#f56c6c" size="20">
                  <Timer />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ offering.course?.hours }}</div>
                <div class="stat-label">总学时</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 操作记录 -->
      <el-card class="info-section" shadow="never">
        <template #header>
          <div class="section-header">
            <span>操作记录</span>
          </div>
        </template>

        <el-timeline>
          <el-timeline-item
            timestamp="创建时间"
            :time="formatDateTime(offering.createdAt)"
            color="#909399"
          >
            开课创建
          </el-timeline-item>
          <el-timeline-item
            v-if="offering.updatedAt !== offering.createdAt"
            timestamp="更新时间"
            :time="formatDateTime(offering.updatedAt)"
            color="#409eff"
          >
            开课信息更新
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Location, Calendar, User, DocumentChecked, Star, Timer } from '@element-plus/icons-vue'
import BaseModal from '@/components/common/BaseModal/index.vue'
import { CourseType, OfferingStatus } from '@/types/course'
import type { CourseOffering } from '@/types/course'

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

// 弹窗状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 工具函数
const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getDayText = (dayOfWeek: number): string => {
  const dayMap = ['', '一', '二', '三', '四', '五', '六', '日']
  return dayMap[dayOfWeek] || ''
}

const getWeeksText = (weeks: number[]): string => {
  if (!weeks || weeks.length === 0) return '-'
  if (weeks.length === 1) return weeks[0].toString()

  // 找连续周次
  const ranges = []
  let start = weeks[0]
  let end = weeks[0]

  for (let i = 1; i < weeks.length; i++) {
    if (weeks[i] === end + 1) {
      end = weeks[i]
    } else {
      if (start === end) {
        ranges.push(start.toString())
      } else {
        ranges.push(`${start}-${end}`)
      }
      start = end = weeks[i]
    }
  }

  if (start === end) {
    ranges.push(start.toString())
  } else {
    ranges.push(`${start}-${end}`)
  }

  return ranges.join(', ')
}

const getCourseTypeColor = (type?: CourseType) => {
  const colorMap = {
    [CourseType.REQUIRED]: 'danger',
    [CourseType.ELECTIVE]: 'primary',
    [CourseType.PUBLIC]: 'success',
    [CourseType.PROFESSIONAL]: 'warning'
  }
  return colorMap[type!] || 'info'
}

const getCourseTypeText = (type?: CourseType) => {
  const textMap = {
    [CourseType.REQUIRED]: '必修课',
    [CourseType.ELECTIVE]: '选修课',
    [CourseType.PUBLIC]: '公共课',
    [CourseType.PROFESSIONAL]: '专业课'
  }
  return textMap[type!] || '未知'
}

const getOfferingStatusColor = (status: OfferingStatus) => {
  const colorMap = {
    [OfferingStatus.DRAFT]: 'info',
    [OfferingStatus.PENDING]: 'warning',
    [OfferingStatus.APPROVED]: 'success',
    [OfferingStatus.PUBLISHED]: 'success',
    [OfferingStatus.ENROLLMENT]: 'primary',
    [OfferingStatus.TEACHING]: 'warning',
    [OfferingStatus.COMPLETED]: '',
    [OfferingStatus.CANCELLED]: 'danger',
    [OfferingStatus.REJECTED]: 'danger'
  }
  return colorMap[status] || 'info'
}

const getOfferingStatusText = (status: OfferingStatus) => {
  const textMap = {
    [OfferingStatus.DRAFT]: '草稿',
    [OfferingStatus.PENDING]: '待审核',
    [OfferingStatus.APPROVED]: '已批准',
    [OfferingStatus.PUBLISHED]: '已发布',
    [OfferingStatus.ENROLLMENT]: '选课中',
    [OfferingStatus.TEACHING]: '教学中',
    [OfferingStatus.COMPLETED]: '已完成',
    [OfferingStatus.CANCELLED]: '已取消',
    [OfferingStatus.REJECTED]: '已拒绝'
  }
  return textMap[status] || '未知'
}

const getEnrollmentRate = (): number => {
  if (!props.offering) return 0
  return Math.round((props.offering.currentStudents / props.offering.maxStudents) * 100)
}
</script>

<style lang="scss" scoped>
.course-detail-dialog {
  .info-section {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-header {
      font-weight: 600;
      color: $text-primary;
    }
  }

  .schedule-grid {
    .schedule-item {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 12px;
      margin-bottom: 12px;
      background-color: #f8f9fa;
      border-radius: 6px;
      border-left: 3px solid $primary-color;

      &:last-child {
        margin-bottom: 0;
      }

      .schedule-time,
      .schedule-location,
      .schedule-weeks {
        display: flex;
        align-items: center;
        gap: 6px;
        color: $text-secondary;
        font-size: 14px;

        .el-icon {
          font-size: 16px;
        }
      }
    }

    .no-schedule {
      padding: 20px;
      text-align: center;
    }
  }

  .course-description {
    line-height: 1.6;
    color: $text-secondary;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 6px;
    border-left: 3px solid $primary-color;
  }

  .prerequisites {
    .prerequisite-tag {
      margin-right: 8px;
      margin-bottom: 8px;
    }
  }

  .stat-card {
    display: flex;
    align-items: center;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e4e7ed;

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }

    .stat-content {
      flex: 1;

      .stat-value {
        font-size: 18px;
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

  .text-danger {
    color: $danger-color;
    font-weight: 600;
  }
}
</style>
