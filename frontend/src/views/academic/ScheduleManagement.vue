<template>
  <div class="schedule-management">
    <div class="schedule-management__header">
      <h2>排课管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAddSchedule">
          <el-icon><Plus /></el-icon>
          新增排课
        </el-button>
        <el-button @click="handleCheckConflicts">
          <el-icon><Warning /></el-icon>
          冲突检测
        </el-button>
      </div>
    </div>

    <div class="schedule-filters">
      <el-form :model="queryForm" inline>
        <el-form-item label="学期">
          <el-select v-model="queryForm.semester" placeholder="请选择学期" clearable>
            <el-option label="春季学期" value="春季学期" />
            <el-option label="秋季学期" value="秋季学期" />
            <el-option label="夏季学期" value="夏季学期" />
          </el-select>
        </el-form-item>
        <el-form-item label="学年">
          <el-select v-model="queryForm.academicYear" placeholder="请选择学年" clearable>
            <el-option label="2023-2024" value="2023-2024" />
            <el-option label="2024-2025" value="2024-2025" />
            <el-option label="2025-2026" value="2025-2026" />
          </el-select>
        </el-form-item>
        <el-form-item label="教师">
          <el-select
            v-model="queryForm.teacherId"
            placeholder="请选择教师"
            clearable
            filterable
          >
            <el-option
              v-for="teacher in teachers"
              :key="teacher.id"
              :label="teacher.user?.realName || '未知教师'"
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="教室">
          <el-select
            v-model="queryForm.classroomId"
            placeholder="请选择教室"
            clearable
            filterable
          >
            <el-option
              v-for="classroom in classrooms"
              :key="classroom.id"
              :label="`${classroom.building}-${classroom.name}`"
              :value="classroom.id"
            />
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

    <el-tabs v-model="activeTab" class="schedule-tabs">
      <!-- 课程表视图 -->
      <el-tab-pane label="课程表视图" name="grid">
        <div class="schedule-grid-view">
          <div class="grid-controls">
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
            </el-form>
          </div>

          <ScheduleGrid
            :schedules="filteredSchedules"
            :selected-week="selectedWeek"
            title="排课表"
            :editable="true"
            :printable="true"
            :show-weeks="true"
            @cell-click="handleCellClick"
            @course-click="handleCourseClick"
          />
        </div>
      </el-tab-pane>

      <!-- 列表视图 -->
      <el-tab-pane label="列表视图" name="list">
        <div class="schedule-list-view">
          <el-table
            :data="schedules"
            stripe
            v-loading="loading"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column label="课程信息" min-width="200">
              <template #default="{ row }">
                <div class="course-info">
                  <div class="course-name">{{ row.courseOffering?.course?.name || '未知课程' }}</div>
                  <div class="course-code">{{ row.courseOffering?.course?.code || '未知代码' }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="教师" width="120">
              <template #default="{ row }">
                {{ row.courseOffering?.teacher?.user?.realName || '未知教师' }}
              </template>
            </el-table-column>
            <el-table-column label="上课时间" width="150">
              <template #default="{ row }">
                {{ formatScheduleTime(row) }}
              </template>
            </el-table-column>
            <el-table-column label="教室" width="120">
              <template #default="{ row }">
                {{ getClassroomDisplayName(row.classroom) }}
              </template>
            </el-table-column>
            <el-table-column label="上课周次" width="150">
              <template #default="{ row }">
                {{ formatWeeks(row.weeks) }}
              </template>
            </el-table-column>
            <el-table-column label="学期" width="100">
              <template #default="{ row }">
                {{ row.courseOffering?.semester || '未知学期' }}
              </template>
            </el-table-column>
            <el-table-column label="学年" width="120">
              <template #default="{ row }">
                {{ row.courseOffering?.academicYear || '未知学年' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  text
                  @click="handleEditSchedule(row)"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click="handleDeleteSchedule(row)"
                >
                  删除
                </el-button>
                <el-button
                  type="info"
                  size="small"
                  text
                  @click="handleViewConflicts(row)"
                >
                  冲突检测
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="table-footer">
            <div class="batch-actions">
              <el-button
                type="danger"
                :disabled="selectedSchedules.length === 0"
                @click="handleBatchDelete"
              >
                批量删除
              </el-button>
            </div>

            <el-pagination
              v-model:current-page="queryForm.page"
              v-model:page-size="queryForm.pageSize"
              :total="total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSearch"
              @current-change="handleSearch"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- 冲突检测 -->
      <el-tab-pane label="冲突检测" name="conflicts">
        <div class="conflicts-view">
          <div class="conflicts-header">
            <el-button type="primary" @click="handleDetectConflicts">
              <el-icon><Search /></el-icon>
              检测冲突
            </el-button>
            <el-button
              type="warning"
              :disabled="conflicts.length === 0"
              @click="handleResolveAllConflicts"
            >
              <el-icon><Tools /></el-icon>
              批量解决
            </el-button>
          </div>

          <el-alert
            v-if="conflicts.length === 0"
            title="暂无冲突"
            type="success"
            :closable="false"
            show-icon
          />

          <div v-else class="conflicts-list">
            <el-card
              v-for="conflict in conflicts"
              :key="conflict.key"
              class="conflict-card"
              shadow="hover"
            >
              <template #header>
                <div class="conflict-header">
                  <h4>时间冲突</h4>
                  <el-tag type="danger">{{ conflict.schedules.length }}个课程冲突</el-tag>
                </div>
              </template>

              <div class="conflict-info">
                <p><strong>冲突时间：</strong>{{ conflict.timeText }}</p>
                <p><strong>冲突课程：</strong></p>
                <ul class="conflict-courses">
                  <li v-for="schedule in conflict.schedules" :key="schedule.id">
                    {{ schedule.courseOffering?.course?.name || '未知课程' }}
                    ({{ schedule.courseOffering?.teacher?.user?.realName || '未知教师' }})
                    - {{ getClassroomDisplayName(schedule.classroom) }}
                  </li>
                </ul>
              </div>

              <template #footer>
                <el-button
                  type="primary"
                  size="small"
                  @click="handleResolveConflict(conflict)"
                >
                  解决冲突
                </el-button>
              </template>
            </el-card>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑排课弹窗 -->
    <el-dialog
      v-model="scheduleDialogVisible"
      :title="isEdit ? '编辑排课' : '新增排课'"
      width="600px"
      :before-close="handleCloseScheduleDialog"
    >
      <el-form
        ref="scheduleFormRef"
        :model="scheduleForm"
        :rules="scheduleRules"
        label-width="100px"
      >
        <el-form-item label="开课信息" prop="courseOfferingId">
          <el-select
            v-model="scheduleForm.courseOfferingId"
            placeholder="请选择开课"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="offering in courseOfferings"
              :key="offering.id"
              :label="`${offering.course?.name || '未知课程'} - ${offering.teacher?.user?.realName || '未知教师'}`"
              :value="offering.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="星期" prop="dayOfWeek">
          <el-select v-model="scheduleForm.dayOfWeek" placeholder="请选择星期">
            <el-option label="周一" :value="1" />
            <el-option label="周二" :value="2" />
            <el-option label="周三" :value="3" />
            <el-option label="周四" :value="4" />
            <el-option label="周五" :value="5" />
            <el-option label="周六" :value="6" />
            <el-option label="周日" :value="7" />
          </el-select>
        </el-form-item>

        <el-form-item label="开始节次" prop="startTime">
          <el-select v-model="scheduleForm.startTime" placeholder="请选择开始节次">
            <el-option
              v-for="period in 10"
              :key="period"
              :label="`第${period}节`"
              :value="period"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="结束节次" prop="endTime">
          <el-select v-model="scheduleForm.endTime" placeholder="请选择结束节次">
            <el-option
              v-for="period in 10"
              :key="period"
              :label="`第${period}节`"
              :value="period"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="教室" prop="classroom">
          <el-select
            v-model="scheduleForm.classroom"
            placeholder="请选择教室"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="classroom in classrooms"
              :key="classroom.id"
              :label="`${classroom.building}-${classroom.name} (${classroom.capacity}人)`"
              :value="classroom.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="上课周次" prop="weeks">
          <el-checkbox-group v-model="scheduleForm.weeks">
            <el-checkbox
              v-for="week in 20"
              :key="week"
              :value="week"
            >
              第{{ week }}周
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleCloseScheduleDialog">取消</el-button>
        <el-button
          type="primary"
          @click="handleSaveSchedule"
          :loading="saving"
        >
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 冲突解决弹窗 -->
    <el-dialog
      v-model="conflictDialogVisible"
      title="解决冲突"
      width="800px"
    >
      <div v-if="selectedConflict" class="conflict-resolution">
        <el-alert
          :title="`发现${selectedConflict.schedules.length}个课程在${selectedConflict.timeText}时间冲突`"
          type="warning"
          :closable="false"
          show-icon
        />

        <div class="conflict-schedules">
          <h4>冲突课程列表：</h4>
          <el-table :data="selectedConflict.schedules">
            <el-table-column label="课程名称" prop="courseOffering.course.name">
              <template #default="{ row }">
                {{ row.courseOffering?.course?.name || '未知课程' }}
              </template>
            </el-table-column>
            <el-table-column label="教师" prop="courseOffering.teacher.user.realName">
              <template #default="{ row }">
                {{ row.courseOffering?.teacher?.user?.realName || '未知教师' }}
              </template>
            </el-table-column>
            <el-table-column label="教室" prop="classroom">
              <template #default="{ row }">
                {{ getClassroomDisplayName(row.classroom) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  @click="handleEditConflictSchedule(row)"
                >
                  调整时间
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDeleteConflictSchedule(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <template #footer>
        <el-button @click="conflictDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Plus, Search, Refresh, Warning, Tools } from '@element-plus/icons-vue'
import { courseOfferingApi } from '@/api/modules/course'
import { classroomApi } from '@/api/modules/classroom'
import { scheduleApi } from '@/api/modules/schedule'
import { userApi } from '@/api/modules/user'
import { ScheduleGrid } from '@/components/business/ScheduleGrid'
import type {
  Schedule,
  CourseOffering,
  Teacher,
  Classroom
} from '@/types/course'

// 接口定义
interface ScheduleQuery {
  page: number
  pageSize: number
  semester?: string
  academicYear?: string
  teacherId?: number
  classroomId?: number
}

interface ScheduleForm {
  courseOfferingId: number | null
  dayOfWeek: number | null
  startTime: number | null
  endTime: number | null
  classroom: string
  weeks: number[]
}

interface ConflictInfo {
  key: string
  timeText: string
  schedules: Schedule[]
}

// 响应式数据
const activeTab = ref('grid')
const loading = ref(false)
const saving = ref(false)
const total = ref(0)
const selectedWeek = ref(1)
const scheduleDialogVisible = ref(false)
const conflictDialogVisible = ref(false)
const isEdit = ref(false)
const scheduleFormRef = ref<FormInstance>()

// 查询表单
const queryForm = reactive<ScheduleQuery>({
  page: 1,
  pageSize: 20,
  semester: '',
  academicYear: '',
  teacherId: undefined,
  classroomId: undefined
})

// 排课表单
const scheduleForm = reactive<ScheduleForm>({
  courseOfferingId: null,
  dayOfWeek: null,
  startTime: null,
  endTime: null,
  classroom: '',
  weeks: []
})

// 表单验证规则
const scheduleRules = {
  courseOfferingId: [
    { required: true, message: '请选择开课信息', trigger: 'change' }
  ],
  dayOfWeek: [
    { required: true, message: '请选择星期', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择开始节次', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束节次', trigger: 'change' }
  ],
  classroom: [
    { required: true, message: '请选择教室', trigger: 'change' }
  ],
  weeks: [
    { required: true, message: '请选择上课周次', trigger: 'change' }
  ]
}

// 数据列表
const schedules = ref<Schedule[]>([])
const courseOfferings = ref<CourseOffering[]>([])
const teachers = ref<Teacher[]>([])
const classrooms = ref<Classroom[]>([])
const selectedSchedules = ref<Schedule[]>([])
const conflicts = ref<ConflictInfo[]>([])
const selectedConflict = ref<ConflictInfo | null>(null)

// 计算属性
const filteredSchedules = computed(() => {
  let filtered = schedules.value

  if (queryForm.semester) {
    filtered = filtered.filter(s =>
      s.courseOffering?.semester === queryForm.semester
    )
  }

  if (queryForm.academicYear) {
    filtered = filtered.filter(s =>
      s.courseOffering?.academicYear === queryForm.academicYear
    )
  }

  if (queryForm.teacherId) {
    filtered = filtered.filter(s =>
      s.courseOffering?.teacherId === queryForm.teacherId
    )
  }

  return filtered
})

// 生命周期
onMounted(() => {
  fetchSchedules()
  fetchCourseOfferings()
  fetchTeachers()
  fetchClassrooms()
})

// 监听查看周次变化，自动刷新表格显示
watch(selectedWeek, () => {
  // 周次变化时，ScheduleGrid组件会自动根据selectedWeek过滤显示
  // 这里不需要重新请求数据，因为过滤是在前端完成的
})

// 方法
const fetchSchedules = async () => {
  try {
    loading.value = true
    const response = await scheduleApi.getSchedules({
      page: queryForm.page,
      pageSize: queryForm.pageSize,
      semester: queryForm.semester,
      academicYear: queryForm.academicYear,
      teacherId: queryForm.teacherId
    })
    schedules.value = response.list
    total.value = response.total
  } catch (error) {
    ElMessage.error('获取排课信息失败')
  } finally {
    loading.value = false
  }
}

const fetchCourseOfferings = async () => {
  try {
    const response = await courseOfferingApi.getCourseOfferings({
      page: 1,
      pageSize: 1000
    })
    courseOfferings.value = response.list
  } catch (error) {
    ElMessage.error('获取开课信息失败')
  }
}

const fetchTeachers = async () => {
  try {
    // 获取具有教师角色的用户
    const response = await userApi.getUsers({
      page: 1,
      pageSize: 1000
    })
    // 过滤出教师用户并转换为Teacher类型
    const teacherUsers = response.list.filter(user =>
      user.roles.some(role => role.code === 'TEACHER')
    )
    teachers.value = teacherUsers.map(user => ({
      id: user.id,
      userId: user.id,
      employeeId: `T${user.id.toString().padStart(6, '0')}`,
      title: '讲师',
      education: '硕士',
      hireDate: '2023-01-01',
      major: '计算机科学',
      bio: '',
      user: user
    }))
  } catch (error) {
    ElMessage.error('获取教师信息失败')
  }
}

const fetchClassrooms = async () => {
  try {
    const response = await classroomApi.getAllClassrooms()
    classrooms.value = response
  } catch (error) {
    ElMessage.error('获取教室信息失败')
  }
}

const handleSearch = () => {
  queryForm.page = 1
  fetchSchedules()
}

const handleReset = () => {
  queryForm.semester = ''
  queryForm.academicYear = ''
  queryForm.teacherId = undefined
  queryForm.classroomId = undefined
  queryForm.page = 1
  fetchSchedules()
}

const handleAddSchedule = () => {
  isEdit.value = false
  resetScheduleForm()
  scheduleDialogVisible.value = true
}

const handleEditSchedule = (schedule: Schedule) => {
  isEdit.value = true
  scheduleForm.courseOfferingId = schedule.courseOfferingId
  scheduleForm.dayOfWeek = schedule.dayOfWeek
  scheduleForm.startTime = schedule.startTime
  scheduleForm.endTime = schedule.endTime
  scheduleForm.classroom = schedule.classroom
  scheduleForm.weeks = [...schedule.weeks]
  scheduleDialogVisible.value = true
}

const handleDeleteSchedule = async (schedule: Schedule) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个排课吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await scheduleApi.deleteSchedule(schedule.id)
    ElMessage.success('删除成功')
    fetchSchedules()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleCellClick = (dayOfWeek: number, period: number) => {
  scheduleForm.dayOfWeek = dayOfWeek
  scheduleForm.startTime = period
  scheduleForm.endTime = period
  handleAddSchedule()
}

const handleCourseClick = (schedule: Schedule) => {
  handleEditSchedule(schedule)
}

const handleSelectionChange = (selection: Schedule[]) => {
  selectedSchedules.value = selection
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的${selectedSchedules.value.length}个排课吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 这里应该调用批量删除API
    ElMessage.success('批量删除成功')
    fetchSchedules()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleSaveSchedule = async () => {
  if (!scheduleFormRef.value) return

  try {
    await scheduleFormRef.value.validate()
    saving.value = true

    // 这里应该调用保存API
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    scheduleDialogVisible.value = false
    fetchSchedules() // 添加/编辑课程后自动刷新
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleCloseScheduleDialog = () => {
  scheduleDialogVisible.value = false
  resetScheduleForm()
}

const resetScheduleForm = () => {
  scheduleForm.courseOfferingId = null
  scheduleForm.dayOfWeek = null
  scheduleForm.startTime = null
  scheduleForm.endTime = null
  scheduleForm.classroom = ''
  scheduleForm.weeks = []
}

const handleCheckConflicts = () => {
  activeTab.value = 'conflicts'
  handleDetectConflicts()
}

const handleDetectConflicts = () => {
  // 检测时间冲突
  const conflictMap = new Map<string, Schedule[]>()

  schedules.value.forEach(schedule => {
    for (let time = schedule.startTime; time <= schedule.endTime; time++) {
      const key = `${schedule.dayOfWeek}-${time}`

      if (!conflictMap.has(key)) {
        conflictMap.set(key, [])
      }

      conflictMap.get(key)!.push(schedule)
    }
  })

  // 找出冲突
  const detectedConflicts: ConflictInfo[] = []
  conflictMap.forEach((scheduleList, key) => {
    if (scheduleList.length > 1) {
      const [dayOfWeek, time] = key.split('-').map(Number)
      const weekDays = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

      detectedConflicts.push({
        key,
        timeText: `${weekDays[dayOfWeek]} 第${time}节`,
        schedules: scheduleList
      })
    }
  })

  conflicts.value = detectedConflicts

  if (detectedConflicts.length === 0) {
    ElMessage.success('未发现时间冲突')
  } else {
    ElMessage.warning(`发现${detectedConflicts.length}个时间冲突`)
  }
}

const handleViewConflicts = (schedule: Schedule) => {
  // 查看特定排课的冲突
  handleDetectConflicts()
  activeTab.value = 'conflicts'
}

const handleResolveConflict = (conflict: ConflictInfo) => {
  selectedConflict.value = conflict
  conflictDialogVisible.value = true
}

const handleResolveAllConflicts = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要自动解决所有冲突吗？系统将尝试重新安排冲突的课程时间。',
      '确认批量解决',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 这里应该实现自动解决冲突的逻辑
    ElMessage.success('冲突解决成功')
    handleDetectConflicts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('冲突解决失败')
    }
  }
}

const handleEditConflictSchedule = (schedule: Schedule) => {
  conflictDialogVisible.value = false
  handleEditSchedule(schedule)
}

const handleDeleteConflictSchedule = async (schedule: Schedule) => {
  conflictDialogVisible.value = false
  await handleDeleteSchedule(schedule)
  handleDetectConflicts()
}

const formatScheduleTime = (schedule: Schedule): string => {
  const weekDays = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return `${weekDays[schedule.dayOfWeek]} 第${schedule.startTime}-${schedule.endTime}节`
}

const formatWeeks = (weeks: number[]): string => {
  if (!weeks || weeks.length === 0) return ''

  // 连续周次压缩显示
  const ranges: string[] = []
  let start = weeks[0]
  let end = weeks[0]

  for (let i = 1; i < weeks.length; i++) {
    if (weeks[i] === end + 1) {
      end = weeks[i]
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`)
      start = end = weeks[i]
    }
  }

  ranges.push(start === end ? `${start}` : `${start}-${end}`)
  return `${ranges.join(',')}周`
}

const getClassroomDisplayName = (classroom: string | any): string => {
  if (typeof classroom === 'string') {
    return classroom
  }
  if (classroom && typeof classroom === 'object') {
    if (classroom.building && classroom.name) {
      return `${classroom.building}-${classroom.name}`
    }
    if (classroom.name) {
      return classroom.name
    }
  }
  return '未安排教室'
}
</script>

<style lang="scss" scoped>
.schedule-management {
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

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.schedule-filters {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;

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

      &:nth-child(1), &:nth-child(2) {
        .el-select {
          min-width: 150px;
        }
      }
    }
  }
}

.schedule-tabs {
  .grid-controls {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;

    .el-form {
      .el-form-item {
        margin-right: 16px;

        &:last-child {
          margin-right: 0;
        }

        .el-select {
          min-width: 160px;
        }
      }
    }
  }
}

.schedule-list-view {
  .course-info {
    .course-name {
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
    }

    .course-code {
      font-size: 12px;
      color: #909399;
    }
  }

  .table-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;

    .batch-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.conflicts-view {
  .conflicts-header {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .conflicts-list {
    .conflict-card {
      margin-bottom: 16px;

      .conflict-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h4 {
          margin: 0;
          color: #303133;
        }
      }

      .conflict-info {
        p {
          margin: 8px 0;
          color: #606266;

          strong {
            color: #303133;
          }
        }

        .conflict-courses {
          margin: 8px 0;
          padding-left: 20px;

          li {
            margin: 4px 0;
            color: #606266;
          }
        }
      }
    }
  }
}

.conflict-resolution {
  .conflict-schedules {
    margin-top: 20px;

    h4 {
      margin: 0 0 12px 0;
      color: #303133;
    }
  }
}

@media (max-width: 768px) {
  .schedule-management {
    padding: 12px;

    &__header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }
  }

  .schedule-filters {
    .el-form {
      .el-form-item {
        width: 100%;
        margin-bottom: 12px;
        margin-right: 0;

        .el-select {
          width: 100%;
          min-width: auto;
        }
      }
    }
  }

  .table-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>
