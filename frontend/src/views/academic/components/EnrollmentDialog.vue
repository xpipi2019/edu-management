<template>
  <BaseModal
    v-model="visible"
    title="选课名单"
    width="800px"
    :show-footer="false"
  >
    <div class="enrollment-dialog">
      <!-- 课程信息 -->
      <el-card class="course-info" shadow="never" v-if="offering">
        <div class="course-header">
          <h3>{{ offering.course?.name }}</h3>
          <div class="course-meta">
            <el-tag type="info" size="small">{{ offering.course?.code }}</el-tag>
            <span class="separator">|</span>
            <span>{{ offering.semester }} {{ offering.academicYear }}</span>
            <span class="separator">|</span>
            <span>已选：{{ students.length }}/{{ offering.maxStudents }}</span>
          </div>
        </div>
      </el-card>

      <!-- 学生表格 -->
      <el-table :data="students" stripe border v-loading="loading">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="realName" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.gender === '男' ? 'primary' : 'warning'" size="small">
              {{ row.gender }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="major" label="专业" />
        <el-table-column prop="enrollmentDate" label="选课时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.enrollmentDate) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal/index.vue'

interface Student {
  id: number
  studentId: string
  realName: string
  gender: string
  className: string
  major: string
  enrollmentDate: string
}

interface CourseOffering {
  id: number
  course?: {
    name: string
    code: string
  }
  semester: string
  academicYear: string
  maxStudents: number
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

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const students = ref<Student[]>([])

// 工具函数
const formatDateTime = (date: string): string => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取学生数据
const fetchStudents = async () => {
  if (!props.offering) return

  loading.value = true
  try {
    // 模拟数据
    const mockStudents: Student[] = [
      {
        id: 1,
        studentId: '2021001',
        realName: '张三',
        gender: '男',
        className: '计科2101班',
        major: '计算机科学与技术',
        enrollmentDate: '2024-02-15T10:30:00Z'
      },
      {
        id: 2,
        studentId: '2021002',
        realName: '李四',
        gender: '女',
        className: '计科2101班',
        major: '计算机科学与技术',
        enrollmentDate: '2024-02-15T11:15:00Z'
      },
      {
        id: 3,
        studentId: '2021003',
        realName: '王五',
        gender: '男',
        className: '软工2101班',
        major: '软件工程',
        enrollmentDate: '2024-02-15T14:20:00Z'
      }
    ]

    students.value = mockStudents
  } catch (error) {
    console.error('获取学生列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听开课变化
watch(
  () => props.offering,
  (offering) => {
    if (offering && props.modelValue) {
      fetchStudents()
    }
  }
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
.enrollment-dialog {
  .course-info {
    margin-bottom: 16px;

    .course-header {
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
  }
}
</style>
