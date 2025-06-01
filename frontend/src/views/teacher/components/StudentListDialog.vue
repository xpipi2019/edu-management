<template>
  <BaseModal
    v-model="visible"
    title="学生名单"
    width="900px"
    :show-footer="false"
  >
    <div class="student-list-dialog">
      <!-- 课程信息 -->
      <el-card class="course-info" shadow="never">
        <div class="course-header">
          <div class="course-details">
            <h3>{{ offering?.course?.name }}</h3>
            <div class="course-meta">
              <el-tag type="info" size="small">{{ offering?.course?.code }}</el-tag>
              <span class="separator">|</span>
              <span>{{ offering?.semester }} {{ offering?.academicYear }}</span>
              <span class="separator">|</span>
              <span>{{ offering?.classroom }}</span>
            </div>
          </div>
          <div class="enrollment-stats">
            <div class="stat-item">
              <span class="stat-label">已选人数</span>
              <span class="stat-value" :class="{ 'text-danger': isOverCapacity }">
                {{ studentList.length }}
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">容量</span>
              <span class="stat-value">{{ offering?.maxStudents }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">剩余</span>
              <span class="stat-value">{{ remainingCapacity }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 搜索筛选 -->
      <el-card class="search-section" shadow="never">
        <el-form
          ref="searchFormRef"
          :model="searchForm"
          inline
          label-width="80px"
        >
          <el-form-item label="学号">
            <el-input
              v-model="searchForm.studentId"
              placeholder="请输入学号"
              clearable
              style="width: 150px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>

          <el-form-item label="姓名">
            <el-input
              v-model="searchForm.studentName"
              placeholder="请输入姓名"
              clearable
              style="width: 150px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>

          <el-form-item label="专业">
            <el-input
              v-model="searchForm.major"
              placeholder="请输入专业"
              clearable
              style="width: 150px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>

          <el-form-item label="班级">
            <el-input
              v-model="searchForm.className"
              placeholder="请输入班级"
              clearable
              style="width: 120px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="loading">
              搜索
            </el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="handleExport" :loading="exporting">
              导出名单
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 学生列表 -->
      <el-card class="table-section" shadow="never">
        <el-table
          :data="filteredStudents"
          :loading="loading"
          border
          stripe
          height="400"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />

          <el-table-column prop="studentId" label="学号" width="120" align="center">
            <template #default="{ row }">
              {{ row.studentId || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="realName" label="姓名" width="100" align="center">
            <template #default="{ row }">
              {{ row.realName || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="gender" label="性别" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.gender === '男' ? 'primary' : 'warning'" size="small">
                {{ row.gender || '-' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="major" label="专业" width="150">
            <template #default="{ row }">
              {{ row.major || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="className" label="班级" width="120" align="center">
            <template #default="{ row }">
              {{ row.className || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="grade" label="年级" width="80" align="center">
            <template #default="{ row }">
              {{ row.grade || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="phone" label="手机号" width="130" align="center">
            <template #default="{ row }">
              {{ row.phone || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="email" label="邮箱" min-width="180">
            <template #default="{ row }">
              {{ row.email || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="enrollmentDate" label="选课时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.enrollmentDate) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                link
                @click="handleViewDetail(row)"
              >
                详情
              </el-button>

              <el-button
                type="info"
                size="small"
                link
                @click="handleContact(row)"
              >
                联系
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 统计信息 -->
      <el-card class="stats-section" shadow="never">
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
                <div class="stat-value">{{ studentList.length }}</div>
                <div class="stat-label">总人数</div>
              </div>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon" style="background: #67c23a20">
                <el-icon color="#67c23a" size="20">
                  <Male />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ getMaleCount() }}</div>
                <div class="stat-label">男生</div>
              </div>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon" style="background: #e6a23c20">
                <el-icon color="#e6a23c" size="20">
                  <Female />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ getFemaleCount() }}</div>
                <div class="stat-label">女生</div>
              </div>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon" style="background: #f56c6c20">
                <el-icon color="#f56c6c" size="20">
                  <TrendCharts />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ getEnrollmentRate() }}%</div>
                <div class="stat-label">选课率</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { User, Male, Female, TrendCharts } from '@element-plus/icons-vue'
import BaseModal from '@/components/common/BaseModal/index.vue'
import { enrollmentApi } from '@/api/modules/course'
import type { CourseOffering, Enrollment } from '@/types/course'

// 本地学生显示接口（简化版）
interface StudentDisplay {
  id: number
  studentId: string
  realName: string
  gender: string
  major: string
  className: string
  grade: number
  phone: string
  email: string
  enrollmentDate: string
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

// 表单引用
const searchFormRef = ref<FormInstance>()

// 弹窗状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 加载状态
const loading = ref(false)
const exporting = ref(false)

// 学生列表数据
const studentList = ref<StudentDisplay[]>([])

// 搜索表单
const searchForm = reactive({
  studentId: '',
  studentName: '',
  major: '',
  className: ''
})

// 计算属性
const remainingCapacity = computed(() => {
  return (props.offering?.maxStudents || 0) - studentList.value.length
})

const isOverCapacity = computed(() => {
  return studentList.value.length > (props.offering?.maxStudents || 0)
})

const filteredStudents = computed(() => {
  let filtered = [...studentList.value]

  if (searchForm.studentId) {
    filtered = filtered.filter(student =>
      student.studentId?.includes(searchForm.studentId)
    )
  }

  if (searchForm.studentName) {
    filtered = filtered.filter(student =>
      student.realName?.includes(searchForm.studentName)
    )
  }

  if (searchForm.major) {
    filtered = filtered.filter(student =>
      student.major?.includes(searchForm.major)
    )
  }

  if (searchForm.className) {
    filtered = filtered.filter(student =>
      student.className?.includes(searchForm.className)
    )
  }

  return filtered
})

// 工具函数
const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getMaleCount = (): number => {
  return studentList.value.filter(student => student.gender === '男').length
}

const getFemaleCount = (): number => {
  return studentList.value.filter(student => student.gender === '女').length
}

const getEnrollmentRate = (): number => {
  if (!props.offering) return 0
  return Math.round((studentList.value.length / props.offering.maxStudents) * 100)
}

// 数据获取函数
const fetchStudents = async () => {
  if (!props.offering) return

  try {
    loading.value = true
    // 模拟学生数据 - 在实际项目中应该调用真实API
    const mockStudents: StudentDisplay[] = [
      {
        id: 1,
        studentId: '2021001',
        realName: '张三',
        gender: '男',
        major: '计算机科学与技术',
        className: '计科2101班',
        grade: 2021,
        phone: '13800138001',
        email: 'zhangsan@example.com',
        enrollmentDate: '2024-02-15T10:30:00Z'
      },
      {
        id: 2,
        studentId: '2021002',
        realName: '李四',
        gender: '女',
        major: '计算机科学与技术',
        className: '计科2101班',
        grade: 2021,
        phone: '13800138002',
        email: 'lisi@example.com',
        enrollmentDate: '2024-02-15T11:15:00Z'
      },
      {
        id: 3,
        studentId: '2021003',
        realName: '王五',
        gender: '男',
        major: '软件工程',
        className: '软工2101班',
        grade: 2021,
        phone: '13800138003',
        email: 'wangwu@example.com',
        enrollmentDate: '2024-02-15T14:20:00Z'
      },
      {
        id: 4,
        studentId: '2021004',
        realName: '赵六',
        gender: '女',
        major: '数据科学与大数据技术',
        className: '数据2101班',
        grade: 2021,
        phone: '13800138004',
        email: 'zhaoliu@example.com',
        enrollmentDate: '2024-02-16T09:45:00Z'
      },
      {
        id: 5,
        studentId: '2021005',
        realName: '孙七',
        gender: '男',
        major: '计算机科学与技术',
        className: '计科2102班',
        grade: 2021,
        phone: '13800138005',
        email: 'sunqi@example.com',
        enrollmentDate: '2024-02-16T16:30:00Z'
      }
    ]

    studentList.value = mockStudents
  } catch (error: any) {
    ElMessage.error(error.message || '获取学生名单失败')
  } finally {
    loading.value = false
  }
}

// 事件处理函数
const handleSearch = () => {
  // 搜索逻辑由计算属性处理
}

const handleReset = () => {
  searchFormRef.value?.resetFields()
  Object.assign(searchForm, {
    studentId: '',
    studentName: '',
    major: '',
    className: ''
  })
}

const handleViewDetail = (student: StudentDisplay) => {
  ElMessage.info(`查看学生 ${student.realName} 的详细信息`)
  // 这里可以打开学生详情弹窗
}

const handleContact = (student: StudentDisplay) => {
  ElMessage.info(`联系学生 ${student.realName}：${student.phone}`)
  // 这里可以实现联系功能，如发送短信或邮件
}

const handleExport = async () => {
  try {
    exporting.value = true
    // 导出名单功能
    const data = filteredStudents.value.map((student, index) => ({
      序号: index + 1,
      学号: student.studentId,
      姓名: student.realName,
      性别: student.gender,
      专业: student.major,
      班级: student.className,
      年级: student.grade,
      手机号: student.phone,
      邮箱: student.email,
      选课时间: formatDateTime(student.enrollmentDate)
    }))

    // 这里应该调用导出API或生成Excel文件
    console.log('导出数据:', data)
    ElMessage.success('导出成功')
  } catch (error: any) {
    ElMessage.error(error.message || '导出失败')
  } finally {
    exporting.value = false
  }
}

// 监听开课变化
watch(
  () => props.offering,
  (offering) => {
    if (offering && props.modelValue) {
      fetchStudents()
    }
  },
  { immediate: true }
)

// 监听弹窗显示状态
watch(
  () => props.modelValue,
  (show) => {
    if (show && props.offering) {
      fetchStudents()
    }
  }
)
</script>

<style lang="scss" scoped>
.student-list-dialog {
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

      .enrollment-stats {
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

            &.text-danger {
              color: $danger-color;
            }
          }
        }
      }
    }
  }

  .search-section {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding: 16px;
    }

    .el-form-item {
      margin-bottom: 0;
    }
  }

  .table-section {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .stats-section {
    .section-header {
      font-weight: 600;
      color: $text-primary;
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
  }
}
</style>
