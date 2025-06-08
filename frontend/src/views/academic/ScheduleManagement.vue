<template>
  <div class="schedule-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>排课管理</h2>
      <p>管理系统中的课程安排信息</p>
    </div>

    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form
        ref="searchFormRef"
        :model="queryForm"
        inline
        label-width="80px"
        class="search-form"
      >
        <el-form-item label="学期">
          <el-select v-model="queryForm.semester" placeholder="请选择学期" clearable style="width: 150px">
            <el-option label="春季学期" value="春季学期" />
            <el-option label="秋季学期" value="秋季学期" />
            <el-option label="夏季学期" value="夏季学期" />
          </el-select>
        </el-form-item>

        <el-form-item label="学年">
          <el-select v-model="queryForm.academic_year" placeholder="请选择学年" clearable style="width: 150px">
            <el-option label="2023-2024" value="2023-2024" />
            <el-option label="2024-2025" value="2024-2025" />
            <el-option label="2025-2026" value="2025-2026" />
          </el-select>
        </el-form-item>

        <el-form-item label="教师">
          <el-select
            v-model="queryForm.teacher_id"
            placeholder="请选择教师"
            clearable
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="teacher in teachers"
              :key="teacher.teacher_id"
              :label="teacher.user?.real_name || '未知教师'"
              :value="teacher.teacher_id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="教室">
          <el-select
            v-model="queryForm.classroom_id"
            placeholder="请选择教室"
            clearable
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="classroom in classrooms"
              :key="classroom.classroom_id"
              :label="`${classroom.building}-${classroom.room_no} (${classroom.capacity}人)`"
              :value="classroom.room_no"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 主要内容 -->
    <el-card class="table-card" shadow="never">
      <div class="card-header">
        <div class="header-actions">
          <el-button type="primary" @click="handleAddSchedule">
            <el-icon><Plus /></el-icon>
            新增排课
          </el-button>
        </div>
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
              :editable="false"
              :printable="true"
              :show-weeks="true"
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
                    <div class="course-name">{{ row.course_offering?.course?.course_name || '未知课程' }}</div>
                    <div class="course-code">{{ row.course_offering?.course?.course_code || '未知代码' }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="教师" width="120">
                <template #default="{ row }">
                  {{ row.course_offering?.teacher?.user?.real_name || '未知教师' }}
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
                  {{ row.course_offering?.semester || '未知学期' }}
                </template>
              </el-table-column>
              <el-table-column label="学年" width="120">
                <template #default="{ row }">
                  {{ row.course_offering?.academicYear || '未知学年' }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    size="small"
                    link
                    @click="handleEditSchedule(row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    link
                    @click="handleDeleteSchedule(row)"
                  >
                    删除
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
                @size-change="handleSizeChange"
                @current-change="handlePageChange"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

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
        <el-form-item label="开课信息" prop="course_offering_id">
          <el-select
            v-model="scheduleForm.course_offering_id"
            placeholder="请选择开课"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="offering in courseOfferings"
              :key="offering.offering_id"
              :label="`${offering.course?.course_name || '未知课程'} - ${offering.teacher?.user?.real_name || '未知教师'}`"
              :value="offering.offering_id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="星期" prop="day_of_week">
          <el-select v-model="scheduleForm.day_of_week" placeholder="请选择星期">
            <el-option label="周一" :value="1" />
            <el-option label="周二" :value="2" />
            <el-option label="周三" :value="3" />
            <el-option label="周四" :value="4" />
            <el-option label="周五" :value="5" />
            <el-option label="周六" :value="6" />
            <el-option label="周日" :value="7" />
          </el-select>
        </el-form-item>

        <el-form-item label="开始节次" prop="start_time">
          <el-select v-model="scheduleForm.start_time" placeholder="请选择开始节次">
            <el-option
              v-for="period in 10"
              :key="period"
              :label="`第${period}节`"
              :value="period.toString()"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="结束节次" prop="end_time">
          <el-select v-model="scheduleForm.end_time" placeholder="请选择结束节次">
            <el-option
              v-for="period in 10"
              :key="period"
              :label="`第${period}节`"
              :value="period.toString()"
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
              :key="classroom.classroom_id"
              :label="`${classroom.building}-${classroom.room_no} (${classroom.capacity}人)`"
              :value="classroom.room_no"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="上课周次" prop="weeks">
          <el-checkbox-group v-model="scheduleForm.weeks">
            <el-checkbox
              v-for="week in 20"
              :key="week"
              :value="week.toString()"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
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
} from '@/types/database'

// 接口定义
interface ScheduleQuery {
  page: number
  pageSize: number
  semester?: string
  academic_year?: string
  teacher_id?: number
  classroom_id?: number
}

interface ScheduleForm {
  course_offering_id: number | null
  day_of_week: number | null
  start_time: string | null
  end_time: string | null
  classroom: string
  weeks: string[]
}

// 响应式数据
const activeTab = ref('grid')
const loading = ref(false)
const saving = ref(false)
const total = ref(0)
const selectedWeek = ref(1)
const scheduleDialogVisible = ref(false)
const isEdit = ref(false)
const scheduleFormRef = ref<FormInstance>()
const searchFormRef = ref<FormInstance>()

// 查询表单
const queryForm = reactive<ScheduleQuery>({
  page: 1,
  pageSize: 20,
  semester: '',
  academic_year: '',
  teacher_id: undefined,
  classroom_id: undefined
})

// 排课表单
const scheduleForm = reactive<ScheduleForm>({
  course_offering_id: null,
  day_of_week: null,
  start_time: null,
  end_time: null,
  classroom: '',
  weeks: []
})

// 表单验证规则
const scheduleRules = {
  course_offering_id: [
    { required: true, message: '请选择开课信息', trigger: 'change' }
  ],
  day_of_week: [
    { required: true, message: '请选择星期', trigger: 'change' }
  ],
  start_time: [
    { required: true, message: '请选择开始节次', trigger: 'change' }
  ],
  end_time: [
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

// 计算属性
const filteredSchedules = computed(() => {
  let filtered = schedules.value

  if (queryForm.semester) {
    filtered = filtered.filter(s =>
      s.course_offering?.semester === queryForm.semester
    )
  }

  if (queryForm.teacher_id) {
    filtered = filtered.filter(s =>
      s.course_offering?.teacher_id === queryForm.teacher_id
    )
  }

  if (queryForm.classroom_id) {
    filtered = filtered.filter(s => {
      const classroom = classrooms.value.find(c => c.classroom_id === queryForm.classroom_id)
      return classroom && s.classroom?.room_no === classroom.room_no
    })
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

// 监听查看周次变化
watch(selectedWeek, () => {
  // 周次变化时，ScheduleGrid组件会自动根据selectedWeek过滤显示
})

// 添加时间转换为节次的辅助函数
const timeToperiod = (timeStr: string): string => {
  const timeMap: Record<string, string> = {
    '08:00': '1', '08:45': '1',
    '08:55': '2', '09:40': '2',
    '10:00': '3', '10:45': '3',
    '10:55': '4', '11:40': '4',
    '14:00': '5', '14:45': '5',
    '14:55': '6', '15:40': '6',
    '16:00': '7', '16:45': '7',
    '16:55': '8', '17:40': '8',
    '19:00': '9', '19:45': '9',
    '19:55': '10', '20:40': '10'
  };

  // 如果是精确匹配的时间，直接返回对应的节次
  if (timeStr in timeMap) {
    return timeMap[timeStr];
  }

  // 取小时进行简单匹配
  const hour = parseInt(timeStr.split(':')[0], 10);
  if (hour >= 8 && hour < 9) return '1';
  if (hour >= 9 && hour < 10) return '2';
  if (hour >= 10 && hour < 11) return '3';
  if (hour >= 11 && hour < 12) return '4';
  if (hour >= 14 && hour < 15) return '5';
  if (hour >= 15 && hour < 16) return '6';
  if (hour >= 16 && hour < 17) return '7';
  if (hour >= 17 && hour < 18) return '8';
  if (hour >= 19 && hour < 20) return '9';
  if (hour >= 20 && hour < 21) return '10';

  // 默认返回第一节
  return '1';
};

const fetchSchedules = async () => {
  try {
    loading.value = true
    const response = await scheduleApi.getList({
      page: queryForm.page,
      pageSize: queryForm.pageSize,
      semester: queryForm.semester || undefined,
      teacher_id: queryForm.teacher_id || undefined,
      classroom_id: queryForm.classroom_id || undefined,
      academic_year: queryForm.academic_year || undefined
    })
    
    // 处理响应数据，确保格式正确
    schedules.value = response.data.list.map(schedule => {
      // 创建一个新对象，避免直接修改原对象
      const processedSchedule = { ...schedule };
      
      // 确保day_of_week是数字类型
      if (processedSchedule.day_of_week && typeof processedSchedule.day_of_week === 'string') {
        processedSchedule.day_of_week = parseInt(processedSchedule.day_of_week, 10);
      }
      
      // 确保start_time和end_time是正确的格式
      if (processedSchedule.start_time && typeof processedSchedule.start_time === 'string') {
        // 如果是时间格式(HH:MM)，转换为节次
        if (processedSchedule.start_time.includes(':')) {
          processedSchedule.start_time = timeToperiod(processedSchedule.start_time);
        }
      }
      
      if (processedSchedule.end_time && typeof processedSchedule.end_time === 'string') {
        // 如果是时间格式(HH:MM)，转换为节次
        if (processedSchedule.end_time.includes(':')) {
          processedSchedule.end_time = timeToperiod(processedSchedule.end_time);
        }
      }
      
      // 如果没有指定weeks，设置默认值
      if (!processedSchedule.weeks) {
        processedSchedule.weeks = '1-16';
      }
      
      return processedSchedule;
    });
    
    total.value = response.data.total
  } catch (error) {
    console.error('获取排课信息失败:', error)
    ElMessage.error('获取排课信息失败')
  } finally {
    loading.value = false
  }
}

const fetchCourseOfferings = async () => {
  try {
    const response = await courseOfferingApi.getList({
      page: 1,
      pageSize: 1000
    })
    courseOfferings.value = response.data.list
  } catch (error) {
    ElMessage.error('获取开课信息失败')
  }
}

const fetchTeachers = async () => {
  try {
    const response = await userApi.getList({
      page: 1,
      pageSize: 1000
    })
    const teacherUsers = response.data.list.filter((user: any) =>
      user.roles.some((role: any) => role.code === 'TEACHER')
    )
    teachers.value = teacherUsers.map((user: any): Teacher => ({
      teacher_id: user.user_id,
      user_id: user.user_id,
      teacher_no: `T${user.user_id.toString().padStart(6, '0')}`,
      dept_id: 1,
      title: '讲师',
      hire_date: '2023-01-01',
      status: 1, // TeacherStatus.ACTIVE
      user: user
    }))
  } catch (error) {
    ElMessage.error('获取教师信息失败')
  }
}

const fetchClassrooms = async () => {
  try {
    const response = await classroomApi.getAll()
    classrooms.value = response.data
  } catch (error) {
    ElMessage.error('获取教室信息失败')
  }
}

const handleSearch = () => {
  fetchSchedules()
}

const handleReset = () => {
  queryForm.semester = ''
  queryForm.academic_year = ''
  queryForm.teacher_id = undefined
  queryForm.classroom_id = undefined
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
  scheduleForm.course_offering_id = schedule.offering_id
  scheduleForm.day_of_week = schedule.day_of_week
  scheduleForm.start_time = schedule.start_time
  scheduleForm.end_time = schedule.end_time
  scheduleForm.classroom = schedule.classroom?.room_no || ''
  scheduleForm.weeks = schedule.weeks.split(',')
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

    await scheduleApi.delete(schedule.schedule_id)
    ElMessage.success('删除成功')
    fetchSchedules()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
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

    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    scheduleDialogVisible.value = false
    fetchSchedules()
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
  scheduleForm.course_offering_id = null
  scheduleForm.day_of_week = null
  scheduleForm.start_time = null
  scheduleForm.end_time = null
  scheduleForm.classroom = ''
  scheduleForm.weeks = []
}

const formatScheduleTime = (schedule: Schedule): string => {
  const weekDays = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return `${weekDays[schedule.day_of_week]} 第${schedule.start_time}-${schedule.end_time}节`
}

const formatWeeks = (weeks: string | number[]): string => {
  if (!weeks) return '';

  // 如果是字符串，直接返回格式化后的结果
  if (typeof weeks === 'string') {
    return `${weeks}周`;
  }

  // 如果是数组，处理数字数组
  if (!Array.isArray(weeks) || weeks.length === 0) return '';

  const ranges: string[] = [];
  let start = weeks[0];
  let end = weeks[0];

  for (let i = 1; i < weeks.length; i++) {
    if (weeks[i] === end + 1) {
      end = weeks[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = end = weeks[i];
    }
  }

  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return `${ranges.join(',')}周`;
}

const getClassroomDisplayName = (classroom: any): string => {
  if (!classroom) {
    return '未安排教室';
  }
  
  if (typeof classroom === 'string') {
    return classroom;
  }
  
  if (typeof classroom === 'object') {
    // 处理后端返回的新格式
    if (classroom.building && classroom.room_no) {
      return `${classroom.building}-${classroom.room_no}`;
    }
    
    // 处理后端返回的旧格式
    if (classroom.building && classroom.name) {
      return `${classroom.building}-${classroom.name}`;
    }
    
    // 只有单一标识的情况
    if (classroom.room_no) {
      return classroom.room_no;
    }
    
    if (classroom.name) {
      return classroom.name;
    }
  }
  
  return '未安排教室';
}

// 处理页码变化 - 由BaseTable组件处理
const handlePageChange = (page: number) => {
  queryForm.page = page
  fetchSchedules()
}

// 处理每页条数变化 - 由BaseTable组件处理
const handleSizeChange = (size: number) => {
  queryForm.pageSize = size
  queryForm.page = 1
  fetchSchedules()
}
</script>

<style lang="scss" scoped>
.schedule-management {
  padding: $spacing-lg;

  .page-header {
    margin-bottom: $spacing-xl;

    h2 {
      margin: 0 0 $spacing-sm 0;
      font-size: 24px;
      font-weight: 600;
      color: $text-primary;
    }

    p {
      margin: 0;
      color: $text-secondary;
      font-size: 14px;
    }
  }

  .search-card {
    margin-bottom: $spacing-lg;

    .search-form {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  .table-card {
    :deep(.el-card__body) {
      padding-top: 0;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: $spacing-lg 0;
      border-bottom: 1px solid #ebeef5;
      margin-bottom: $spacing-lg;

      .header-actions {
        display: flex;
        gap: 12px;
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
}

@media (max-width: 768px) {
  .schedule-management {
    padding: $spacing-md;

    .search-form {
      .el-form-item {
        width: 100%;
        margin-bottom: 12px;

        .el-select {
          width: 100%;
        }
      }
    }

    .table-footer {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }
  }
}
</style>
