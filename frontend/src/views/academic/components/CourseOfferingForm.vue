<template>
  <BaseModal
    v-model="visible"
    :title="isEdit ? '编辑开课' : '新增开课'"
    width="600px"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="课程" prop="courseId">
        <el-select
          v-model="formData.courseId"
          placeholder="请选择课程"
          style="width: 100%"
          :loading="coursesLoading"
        >
          <el-option
            v-for="course in courses"
            :key="course.id"
            :label="`${course.code} - ${course.name}`"
            :value="course.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="学期" prop="semester">
        <el-select v-model="formData.semester" placeholder="请选择学期" style="width: 100%">
          <el-option label="春季学期" value="春季学期" />
          <el-option label="秋季学期" value="秋季学期" />
        </el-select>
      </el-form-item>

      <el-form-item label="学年" prop="academicYear">
        <el-input v-model="formData.academicYear" placeholder="请输入学年，如：2024-2025" />
      </el-form-item>

      <el-form-item label="教室" prop="classroom">
        <el-input v-model="formData.classroom" placeholder="请输入教室" />
      </el-form-item>

      <el-form-item label="最大人数" prop="maxStudents">
        <el-input-number v-model="formData.maxStudents" :min="1" :max="200" style="width: 100%" />
      </el-form-item>
    </el-form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import BaseModal from '@/components/common/BaseModal/index.vue'
import { courseApi, courseOfferingApi } from '@/api/modules/course'
import type { Course, CourseOffering, CreateCourseOfferingData, UpdateCourseOfferingData } from '@/types/course'

interface Props {
  modelValue: boolean
  offering?: CourseOffering | null
}

interface Emits {
  (e: 'update:modelValue', visible: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  offering: null
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.offering)

// 加载状态
const loading = ref(false)
const coursesLoading = ref(false)

// 课程选项
const courses = ref<Course[]>([])

const formData = reactive({
  courseId: undefined as number | undefined,
  semester: '',
  academicYear: '',
  classroom: '',
  maxStudents: 50
})

const formRules: FormRules = {
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }],
  academicYear: [
    { required: true, message: '请输入学年', trigger: 'blur' },
    { pattern: /^\d{4}-\d{4}$/, message: '学年格式应为：2024-2025', trigger: 'blur' }
  ],
  maxStudents: [
    { required: true, message: '请输入最大人数', trigger: 'blur' },
    { type: 'number', min: 1, max: 200, message: '最大人数范围为1-200', trigger: 'blur' }
  ]
}

// 获取课程列表
const fetchCourses = async () => {
  try {
    coursesLoading.value = true
    const coursesData = await courseApi.getAllCourses()
    courses.value = coursesData
  } catch (error: any) {
    ElMessage.error(error.message || '获取课程列表失败')
  } finally {
    coursesLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    courseId: undefined,
    semester: '',
    academicYear: '',
    classroom: '',
    maxStudents: 50
  })
  formRef.value?.resetFields()
}

// 填充表单数据
const fillFormData = (offering: CourseOffering) => {
  Object.assign(formData, {
    courseId: offering.courseId,
    semester: offering.semester,
    academicYear: offering.academicYear,
    classroom: offering.classroom || '',
    maxStudents: offering.maxStudents
  })
}

const handleSubmit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return

    loading.value = true

    if (isEdit.value && props.offering) {
      // 编辑开课
      const updateData: UpdateCourseOfferingData = {
        semester: formData.semester,
        academicYear: formData.academicYear,
        classroom: formData.classroom,
        maxStudents: formData.maxStudents
      }
      await courseOfferingApi.updateCourseOffering(props.offering.id, updateData)
      ElMessage.success('更新开课成功')
    } else {
      // 新增开课
      const createData: CreateCourseOfferingData = {
        courseId: formData.courseId!,
        teacherId: 1, // 这里应该从当前用户获取
        semester: formData.semester,
        academicYear: formData.academicYear,
        maxStudents: formData.maxStudents,
        classroom: formData.classroom,
        schedules: [] // 暂时为空，后续可以添加排课功能
      }
      await courseOfferingApi.createCourseOffering(createData)
      ElMessage.success('创建开课成功')
    }

    emit('success')
    handleCancel()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  resetForm()
  emit('update:modelValue', false)
}

// 监听开课变化
watch(
  () => props.offering,
  (offering) => {
    if (offering) {
      fillFormData(offering)
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// 监听弹窗显示状态
watch(
  () => props.modelValue,
  (show) => {
    if (show) {
      if (!props.offering) {
        resetForm()
      }
      fetchCourses()
    }
  }
)

// 页面加载时获取数据
onMounted(() => {
  fetchCourses()
})
</script>
