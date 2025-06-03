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
          <h3>{{ offering.course?.course_name }}</h3>
          <div class="course-meta">
            <el-tag type="info" size="small">{{ offering.course?.course_code }}</el-tag>
            <span class="separator">|</span>
            <span>{{ offering.semester }}</span>
            <span class="separator">|</span>
            <span>已选：{{ students.length }}/{{ offering.max_students }}</span>
          </div>
        </div>
      </el-card>

      <!-- 学生表格 -->
      <el-table :data="students" stripe border v-loading="loading">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="student_no" label="学号" width="120" />
        <el-table-column prop="user.real_name" label="姓名" width="100" />
        <el-table-column prop="class_name" label="班级" width="120" />
        <el-table-column prop="department.dept_name" label="专业">
          <template #default="{ row }">
            {{ row.department?.dept_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="选课时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.user?.created_at) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal/index.vue'
import type { CourseOffering, Student } from '@/types/database'

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
    // 模拟数据 - 应该调用真实API
    const mockStudents: Student[] = [
      {
        student_id: 1,
        user_id: 1,
        student_no: '2021001',
        dept_id: 1,
        class_name: '计科2101班',
        grade: 2021,
        enrollment_year: 2021,
        user: {
          user_id: 1,
          username: 'zhangsan',
          real_name: '张三',
          status: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
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
