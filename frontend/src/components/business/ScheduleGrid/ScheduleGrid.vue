<template>
  <div class="schedule-grid">
    <div class="schedule-grid__header">
      <h3>{{ title }}</h3>
      <div class="schedule-grid__tools">
        <el-button v-if="printable" type="primary" @click="handlePrint">
          <el-icon><Printer /></el-icon>
          打印课程表
        </el-button>
        <slot name="tools"></slot>
      </div>
    </div>

    <div class="schedule-grid__content" ref="printableRef">
      <table class="schedule-table">
        <thead>
          <tr>
            <th class="time-header">时间</th>
            <th v-for="day in weekDays" :key="day.value" class="day-header">
              {{ day.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="period in timePeriods" :key="period.value">
            <td class="time-cell">
              <div class="time-period">第{{ period.value }}节</div>
              <div class="time-range">{{ period.time }}</div>
            </td>
            <td
              v-for="day in weekDays"
              :key="`${day.value}-${period.value}`"
              class="schedule-cell"
              :class="getCellClass(day.value, period.value)"
              @click="handleCellClick(day.value, period.value)"
            >
              <div
                v-for="schedule in getCellSchedules(day.value, period.value)"
                :key="schedule.schedule_id"
                class="course-item"
                :class="getCourseItemClass(schedule)"
                @click.stop="handleCourseClick(schedule)"
              >
                <div class="course-name">{{ getCourseName(schedule) }}</div>
                <div class="course-teacher">{{ getTeacherName(schedule) }}</div>
                <div class="course-classroom">{{ getClassroomName(schedule) }}</div>
                <div v-if="showWeeks && schedule.weeks" class="course-weeks">
                  {{ formatWeeks(schedule.weeks) }}
                </div>
              </div>

              <!-- 空白单元格提示 -->
              <div v-if="getCellSchedules(day.value, period.value).length === 0 && editable" class="empty-cell">
                <el-icon><Plus /></el-icon>
                <span>点击添加课程</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 图例 -->
    <div v-if="showLegend" class="schedule-legend">
      <div class="legend-item">
        <div class="legend-color required"></div>
        <span>必修课</span>
      </div>
      <div class="legend-item">
        <div class="legend-color elective"></div>
        <span>选修课</span>
      </div>
      <div class="legend-item">
        <div class="legend-color public"></div>
        <span>公共课</span>
      </div>
      <div class="legend-item">
        <div class="legend-color professional"></div>
        <span>专业课</span>
      </div>
      <div class="legend-item">
        <div class="legend-color default"></div>
        <span>其他</span>
      </div>
      <div class="legend-item">
        <div class="legend-color conflict"></div>
        <span>时间冲突</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Printer, Plus } from '@element-plus/icons-vue'
import type { Schedule } from '@/types/database'

interface Props {
  schedules: Schedule[]
  title?: string
  editable?: boolean
  printable?: boolean
  showWeeks?: boolean
  showLegend?: boolean
  selectedWeek?: number
}

interface Emits {
  (e: 'cell-click', day: number, period: number): void
  (e: 'course-click', schedule: Schedule): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '课程表',
  editable: false,
  printable: true,
  showWeeks: false,
  showLegend: true,
  selectedWeek: 1
})

const emit = defineEmits<Emits>()

const printableRef = ref<HTMLElement>()

// 星期数据
const weekDays = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 7 }
]

// 时间段数据
const timePeriods = [
  { value: 1, time: '08:00-08:45' },
  { value: 2, time: '08:55-09:40' },
  { value: 3, time: '10:00-10:45' },
  { value: 4, time: '10:55-11:40' },
  { value: 5, time: '14:00-14:45' },
  { value: 6, time: '14:55-15:40' },
  { value: 7, time: '16:00-16:45' },
  { value: 8, time: '16:55-17:40' },
  { value: 9, time: '19:00-19:45' },
  { value: 10, time: '19:55-20:40' }
]

// 检测时间冲突
const conflicts = computed(() => {
  const conflictMap = new Map<string, Schedule[]>()

  props.schedules.forEach(schedule => {
    // 过滤当前周次的课程
    if (props.selectedWeek && schedule.weeks && !isWeekInRange(schedule.weeks, props.selectedWeek)) {
      return
    }

    // 解析时间范围
    const startTime = parseTimeToNumber(schedule.start_time)
    const endTime = parseTimeToNumber(schedule.end_time)

    // 检查每个时间段
    for (let time = startTime; time <= endTime; time++) {
      const key = `${schedule.day_of_week}-${time}`

      if (!conflictMap.has(key)) {
        conflictMap.set(key, [])
      }

      conflictMap.get(key)!.push(schedule)
    }
  })

  // 找出冲突的时间段
  const conflictCells = new Set<string>()
  conflictMap.forEach((schedules, key) => {
    if (schedules.length > 1) {
      conflictCells.add(key)
    }
  })

  return conflictCells
})

// 获取指定单元格的课程
const getCellSchedules = (dayOfWeek: number, period: number): Schedule[] => {
  return props.schedules.filter(schedule => {
    // 过滤当前周次的课程
    if (props.selectedWeek && schedule.weeks && !isWeekInRange(schedule.weeks, props.selectedWeek)) {
      return false
    }

    const startTime = parseTimeToNumber(schedule.start_time)
    const endTime = parseTimeToNumber(schedule.end_time)

    return schedule.day_of_week === dayOfWeek &&
           startTime <= period &&
           endTime >= period
  })
}

// 获取单元格样式类
const getCellClass = (dayOfWeek: number, period: number): string[] => {
  const classes = []

  const key = `${dayOfWeek}-${period}`
  if (conflicts.value.has(key)) {
    classes.push('conflict')
  }

  if (props.editable && getCellSchedules(dayOfWeek, period).length === 0) {
    classes.push('editable')
  }

  return classes
}

// 获取课程项样式类
const getCourseItemClass = (schedule: Schedule): string[] => {
  const classes = []

  // 根据课程类型设置样式
  const courseType = schedule.course_offering?.course?.course_type
  if (courseType) {
    classes.push(courseType.toLowerCase())
  } else {
    // 默认样式，如果没有指定类型
    classes.push('default')
  }

  return classes
}

// 格式化周次显示
const formatWeeks = (weeks: string): string => {
  if (!weeks) return ''
  return `${weeks}周`
}

// 处理单元格点击
const handleCellClick = (dayOfWeek: number, period: number) => {
  if (props.editable) {
    emit('cell-click', dayOfWeek, period)
  }
}

// 处理课程点击
const handleCourseClick = (schedule: Schedule) => {
  emit('course-click', schedule)
}

// 获取课程名称
const getCourseName = (schedule: Schedule): string => {
  return schedule.course_offering?.course?.course_name || '未知课程'
}

// 获取教师姓名
const getTeacherName = (schedule: Schedule): string => {
  return schedule.course_offering?.teacher?.user?.real_name || '未知教师'
}

// 获取教室名称
const getClassroomName = (schedule: Schedule): string => {
  if (typeof schedule.classroom === 'string') {
    return schedule.classroom
  }
  if (schedule.classroom && typeof schedule.classroom === 'object') {
    // 如果classroom是对象，提取name和building信息
    const classroom = schedule.classroom as any
    if (classroom.name && classroom.building) {
      return `${classroom.building}-${classroom.name}`
    }
    if (classroom.name) {
      return classroom.name
    }
  }
  return '未安排教室'
}

// 解析时间字符串为数字（用于时间段计算）
const parseTimeToNumber = (timeStr: string): number => {
  // 将时间字符串解析为节次数字
  // 这里需要根据实际的时间格式调整
  const timeMap: Record<string, number> = {
    '08:00': 1, '08:45': 1,
    '08:55': 2, '09:40': 2,
    '10:00': 3, '10:45': 3,
    '10:55': 4, '11:40': 4,
    '14:00': 5, '14:45': 5,
    '14:55': 6, '15:40': 6,
    '16:00': 7, '16:45': 7,
    '16:55': 8, '17:40': 8,
    '19:00': 9, '19:45': 9,
    '19:55': 10, '20:40': 10
  }
  return timeMap[timeStr] || 1
}

// 检查周次是否在范围内
const isWeekInRange = (weeksStr: string, targetWeek: number): boolean => {
  // 解析周次字符串，如 "1-16" 或 "1-8,10-16"
  const ranges = weeksStr.split(',')
  for (const range of ranges) {
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(Number)
      if (targetWeek >= start && targetWeek <= end) {
        return true
      }
    } else {
      if (Number(range) === targetWeek) {
        return true
      }
    }
  }
  return false
}

// 打印课程表
const handlePrint = () => {
  if (!printableRef.value) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    ElMessage.error('打印失败，请允许弹窗权限')
    return
  }

  // 创建一个临时的DOM元素用于打印，移除所有空白单元格的提示
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = printableRef.value.innerHTML

  // 移除所有空白单元格的提示内容
  const emptyCells = tempDiv.querySelectorAll('.empty-cell')
  emptyCells.forEach(cell => {
    cell.remove()
  })

  const printContent = tempDiv.innerHTML
  const currentDate = new Date().toLocaleDateString('zh-CN')
  const currentWeek = props.selectedWeek ? `第${props.selectedWeek}周` : '全学期'

  const printStyles = `
    <style>
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        body {
          margin: 0 !important;
          padding: 20px !important;
        }

        .no-print {
          display: none !important;
        }
      }

      body {
        font-family: "Microsoft YaHei", "Arial", sans-serif;
        margin: 20px;
        background-color: #fff;
        color: #333;
      }

      .print-header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #409eff;
        padding-bottom: 15px;
      }

      .print-title {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
        margin: 0 0 10px 0;
      }

      .print-info {
        font-size: 14px;
        color: #606266;
        margin: 5px 0;
      }

      .schedule-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        border-radius: 8px;
        overflow: hidden;
        table-layout: fixed;
      }

      .schedule-table th, .schedule-table td {
        border: 1px solid #e4e7ed;
        padding: 12px 8px;
        text-align: center;
        vertical-align: middle;
        width: 12.5%;
      }

      .schedule-table th {
        background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
        color: #fff;
        font-weight: bold;
        font-size: 14px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      }

      .time-cell {
        background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%);
        font-weight: 600;
        color: #303133;
        width: 12.5%;
      }

      .time-period {
        font-weight: bold;
        margin-bottom: 4px;
        font-size: 14px;
        color: #409eff;
      }

      .time-range {
        font-size: 12px;
        color: #909399;
      }

      .schedule-cell {
        min-height: 80px;
        padding: 6px;
        background-color: #fafbfc;
        width: 12.5%;
      }

      /* 确保空白单元格在打印时为空 */
      .empty-cell {
        display: none !important;
      }

      .course-item {
        margin: 3px 0;
        padding: 8px 6px;
        border-radius: 6px;
        font-size: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        border: 1px solid transparent;
      }

      .course-item.required {
        background: linear-gradient(135deg, #e1f3d8 0%, #d4edcf 100%);
        border-color: #67c23a;
        border-left: 4px solid #67c23a;
      }

      .course-item.elective {
        background: linear-gradient(135deg, #fef0e6 0%, #fae6d0 100%);
        border-color: #e6a23c;
        border-left: 4px solid #e6a23c;
      }

      .course-item.public {
        background: linear-gradient(135deg, #e6f7ff 0%, #d6f0ff 100%);
        border-color: #409eff;
        border-left: 4px solid #409eff;
      }

      .course-item.professional {
        background: linear-gradient(135deg, #f4f4f5 0%, #e9e9eb 100%);
        border-color: #909399;
        border-left: 4px solid #909399;
      }

      .course-item.default {
        background: linear-gradient(135deg, #f0f2f5 0%, #e4e7ed 100%);
        border-color: #c0c4cc;
        border-left: 4px solid #c0c4cc;
      }

      .course-item.conflict {
        background-color: #fef0f0;
        border-left: 3px solid #f56c6c;
      }

      .course-name {
        font-weight: bold;
        margin-bottom: 3px;
        font-size: 13px;
        color: #303133;
        line-height: 1.3;
      }

      .course-teacher, .course-classroom, .course-weeks {
        font-size: 11px;
        color: #606266;
        margin: 1px 0;
        line-height: 1.2;
      }

      .print-legend {
        margin-top: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e4e7ed;
      }

      .legend-title {
        font-weight: bold;
        margin-bottom: 10px;
        color: #303133;
        font-size: 14px;
      }

      .legend-items {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #606266;
      }

      .legend-color {
        width: 20px;
        height: 14px;
        border-radius: 3px;
        border: 1px solid #ddd;
      }

      .legend-color.required {
        background: linear-gradient(135deg, #e1f3d8 0%, #d4edcf 100%);
        border-color: #67c23a;
      }

      .legend-color.elective {
        background: linear-gradient(135deg, #fef0e6 0%, #fae6d0 100%);
        border-color: #e6a23c;
      }

      .legend-color.public {
        background: linear-gradient(135deg, #e6f7ff 0%, #d6f0ff 100%);
        border-color: #409eff;
      }

      .legend-color.professional {
        background: linear-gradient(135deg, #f4f4f5 0%, #e9e9eb 100%);
        border-color: #909399;
      }

      .legend-color.default {
        background: linear-gradient(135deg, #f0f2f5 0%, #e4e7ed 100%);
        border-color: #c0c4cc;
      }

      .print-footer {
        margin-top: 30px;
        text-align: center;
        font-size: 12px;
        color: #909399;
        border-top: 1px solid #e4e7ed;
        padding-top: 15px;
      }
    </style>
  `

  printWindow.document.write(`
    <html>
      <head>
        <title>${props.title} - ${currentWeek}</title>
        <meta charset="UTF-8">
        ${printStyles}
      </head>
      <body>
        <div class="print-header">
          <h1 class="print-title">${props.title}</h1>
          <div class="print-info">查看周次: ${currentWeek}</div>
          <div class="print-info">打印时间: ${currentDate}</div>
        </div>

        ${printContent}

        <div class="print-legend">
          <div class="legend-title">课程类型说明</div>
          <div class="legend-items">
            <div class="legend-item">
              <div class="legend-color required"></div>
              <span>必修课</span>
            </div>
            <div class="legend-item">
              <div class="legend-color elective"></div>
              <span>选修课</span>
            </div>
            <div class="legend-item">
              <div class="legend-color public"></div>
              <span>公共课</span>
            </div>
            <div class="legend-item">
              <div class="legend-color professional"></div>
              <span>专业课</span>
            </div>
            <div class="legend-item">
              <div class="legend-color default"></div>
              <span>其他</span>
            </div>
          </div>
        </div>

        <div class="print-footer">
          <p>此课程表由教务管理系统自动生成</p>
        </div>
      </body>
    </html>
  `)

  printWindow.document.close()

  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 800)
}
</script>

<style lang="scss" scoped>
.schedule-grid {
  background: #fff;
  border-radius: 8px;
  padding: 20px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      color: #303133;
    }
  }

  &__tools {
    display: flex;
    gap: 12px;
  }

  &__content {
    overflow-x: auto;
  }
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  table-layout: fixed;

  th, td {
    border: 1px solid #e4e7ed;
    text-align: center;
    vertical-align: middle;
    width: 12.5%; /* 7个星期列 + 1个时间列 = 8列，每列12.5% */
  }

  th {
    background-color: #f5f7fa;
    font-weight: 600;
    color: #303133;
    height: 50px;
  }

  .time-header {
    width: 12.5%;
  }

  .day-header {
    width: 12.5%;
  }
}

.time-cell {
  background-color: #fafbfc;
  padding: 12px 8px;
  min-height: 80px;
  width: 12.5%;

  .time-period {
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .time-range {
    font-size: 12px;
    color: #909399;
  }
}

.schedule-cell {
  padding: 4px;
  min-height: 80px;
  position: relative;
  width: 12.5%;

  &.editable {
    cursor: pointer;

    &:hover {
      background-color: #f0f9ff;
    }
  }

  &.conflict {
    background-color: #fef0f0;
  }
}

.course-item {
  margin: 2px 0;
  padding: 6px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  &.required {
    background-color: #e1f3d8;
    border-left: 3px solid #67c23a;
  }

  &.elective {
    background-color: #fef0e6;
    border-left: 3px solid #e6a23c;
  }

  &.public {
    background-color: #e6f7ff;
    border-left: 3px solid #409eff;
  }

  &.professional {
    background-color: #f4f4f5;
    border-left: 3px solid #909399;
  }

  &.default {
    background-color: #f0f2f5;
    border-left: 3px solid #c0c4cc;
  }

  &.conflict {
    background-color: #fef0f0;
    border-left: 3px solid #f56c6c;
  }

  .course-name {
    font-weight: 600;
    color: #303133;
    margin-bottom: 2px;
    line-height: 1.2;
  }

  .course-teacher,
  .course-classroom,
  .course-weeks {
    font-size: 11px;
    color: #606266;
    line-height: 1.2;
  }
}

.empty-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60px;
  color: #c0c4cc;
  cursor: pointer;

  .el-icon {
    margin-bottom: 4px;
    font-size: 16px;
  }

  span {
    font-size: 12px;
  }

  &:hover {
    color: #409eff;
  }
}

.schedule-legend {
  display: flex;
  gap: 20px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 2px;

      &.required {
        background-color: #e1f3d8;
        border-left: 3px solid #67c23a;
      }

      &.elective {
        background-color: #fef0e6;
        border-left: 3px solid #e6a23c;
      }

      &.conflict {
        background-color: #fef0f0;
        border-left: 3px solid #f56c6c;
      }
    }
  }
}

@media (max-width: 768px) {
  .schedule-grid {
    padding: 12px;

    &__header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    &__tools {
      justify-content: center;
    }
  }

  .schedule-table {
    font-size: 12px;
  }

  .time-cell {
    min-height: 60px;
  }

  .course-item {
    padding: 4px;

    .course-name {
      font-size: 11px;
    }

    .course-teacher,
    .course-classroom,
    .course-weeks {
      font-size: 10px;
    }
  }
}
</style>
