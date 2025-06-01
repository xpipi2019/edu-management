<template>
  <BaseModal
    v-model="visible"
    :title="isEdit ? '编辑课程' : '新增课程'"
    :loading="loading"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="course-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="课程代码" prop="code">
            <el-input
              v-model="formData.code"
              placeholder="请输入课程代码"
              :disabled="isEdit"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="课程名称" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="请输入课程名称"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="课程类型" prop="type">
            <el-select
              v-model="formData.type"
              placeholder="请选择课程类型"
              style="width: 100%"
            >
              <el-option label="必修课" value="REQUIRED" />
              <el-option label="选修课" value="ELECTIVE" />
              <el-option label="公共课" value="PUBLIC" />
              <el-option label="专业课" value="PROFESSIONAL" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="学分" prop="credits">
            <el-input-number
              v-model="formData.credits"
              :min="0"
              :max="20"
              :precision="1"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="学时" prop="hours">
            <el-input-number
              v-model="formData.hours"
              :min="0"
              :max="200"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="先修课程" prop="prerequisiteIds">
            <el-select
              v-model="formData.prerequisiteIds"
              placeholder="请选择先修课程"
              multiple
              filterable
              style="width: 100%"
              :loading="coursesLoading"
            >
              <el-option
                v-for="course in availableCourses"
                :key="course.id"
                :label="`${course.code} - ${course.name}`"
                :value="course.id"
                :disabled="course.id === courseId"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="课程描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入课程描述"
        />
      </el-form-item>
    </el-form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import BaseModal from '@/components/common/BaseModal/index.vue'
import { courseApi } from '@/api/modules/course'

// 课程类型枚举
enum CourseType {
  REQUIRED = 'REQUIRED',
  ELECTIVE = 'ELECTIVE',
  PUBLIC = 'PUBLIC',
  PROFESSIONAL = 'PROFESSIONAL'
}

// 课程状态枚举
enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

// 课程接口
interface Course {
  id: number
  name: string
  code: string
  credits: number
  hours: number
  type: CourseType
  description?: string
  prerequisiteIds?: number[]
  prerequisites?: Course[]
  status: CourseStatus
  createdAt: string
  updatedAt: string
}

// 创建课程数据
interface CreateCourseData {
  name: string
  code: string
  credits: number
  hours: number
  type: CourseType
  description?: string
  prerequisiteIds?: number[]
}

// 更新课程数据
interface UpdateCourseData {
  name?: string
  code?: string
  credits?: number
  hours?: number
  type?: CourseType
  description?: string
  prerequisiteIds?: number[]
  status?: CourseStatus
}

interface Props {
  modelValue: boolean
  course?: Course | null
}

interface Emits {
  (e: 'update:modelValue', visible: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  course: null
})

const emit = defineEmits<Emits>()

// 表单引用
const formRef = ref<FormInstance>()

// 弹窗状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 加载状态
const loading = ref(false)
const coursesLoading = ref(false)

// 可选课程列表
const availableCourses = ref<Course[]>([])

// 表单数据
const formData = reactive<CreateCourseData>({
  name: '',
  code: '',
  credits: 1,
  hours: 16,
  type: CourseType.ELECTIVE,
  description: '',
  prerequisiteIds: []
})

// 计算是否为编辑模式
const isEdit = computed(() => !!props.course)
const courseId = computed(() => props.course?.id)

// 表单验证规则
const formRules: FormRules = {
  code: [
    { required: true, message: '请输入课程代码', trigger: 'blur' },
    { min: 2, max: 20, message: '课程代码长度为2-20个字符', trigger: 'blur' },
    {
      pattern: /^[A-Z0-9]+$/,
      message: '课程代码只能包含大写字母和数字',
      trigger: 'blur'
    }
  ],
  name: [
    { required: true, message: '请输入课程名称', trigger: 'blur' },
    { min: 2, max: 50, message: '课程名称长度为2-50个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择课程类型', trigger: 'change' }
  ],
  credits: [
    { required: true, message: '请输入学分', trigger: 'blur' },
    { type: 'number', min: 0.5, max: 20, message: '学分范围为0.5-20', trigger: 'blur' }
  ],
  hours: [
    { required: true, message: '请输入学时', trigger: 'blur' },
    { type: 'number', min: 8, max: 200, message: '学时范围为8-200', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '课程描述最多500个字符', trigger: 'blur' }
  ]
}

// 获取可选课程列表
const fetchAvailableCourses = async () => {
  try {
    coursesLoading.value = true
    const courses = await courseApi.getAllCourses()
    availableCourses.value = courses.filter(course =>
      course.status === CourseStatus.PUBLISHED
    )
  } catch (error) {
    console.error('获取课程列表失败:', error)
  } finally {
    coursesLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    code: '',
    credits: 1,
    hours: 16,
    type: CourseType.ELECTIVE,
    description: '',
    prerequisiteIds: []
  })
  formRef.value?.resetFields()
}

// 填充表单数据
const fillFormData = (course: Course) => {
  Object.assign(formData, {
    name: course.name,
    code: course.code,
    credits: course.credits,
    hours: course.hours,
    type: course.type,
    description: course.description || '',
    prerequisiteIds: course.prerequisiteIds || []
  })
}

// 处理提交
const handleSubmit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (!valid) return

    loading.value = true

    if (isEdit.value && props.course) {
      // 编辑课程
      const updateData: UpdateCourseData = {
        name: formData.name,
        credits: formData.credits,
        hours: formData.hours,
        type: formData.type,
        description: formData.description,
        prerequisiteIds: formData.prerequisiteIds
      }
      await courseApi.updateCourse(props.course.id, updateData)
      ElMessage.success('更新课程成功')
    } else {
      // 新增课程
      await courseApi.createCourse(formData)
      ElMessage.success('创建课程成功')
    }

    emit('success')
    handleCancel()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

// 处理取消
const handleCancel = () => {
  resetForm()
  visible.value = false
}

// 监听课程变化
watch(
  () => props.course,
  (course) => {
    if (course) {
      fillFormData(course)
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
    if (show && !props.course) {
      resetForm()
    }
  }
)

// 页面加载时获取数据
onMounted(() => {
  fetchAvailableCourses()
})
</script>

<style lang="scss" scoped>
.course-form {
  padding: 0 20px;

  .el-form-item {
    margin-bottom: 20px;
  }
}
</style>
