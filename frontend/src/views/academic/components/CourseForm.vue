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
          <el-form-item label="课程代码" prop="course_code">
            <el-input
              v-model="formData.course_code"
              placeholder="请输入课程代码"
              :disabled="isEdit"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="课程名称" prop="course_name">
            <el-input
              v-model="formData.course_name"
              placeholder="请输入课程名称"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="课程类型" prop="course_type">
            <el-select
              v-model="formData.course_type"
              placeholder="请选择课程类型"
              style="width: 100%"
            >
              <el-option label="必修" :value="CourseType.REQUIRED" />
              <el-option label="选修" :value="CourseType.ELECTIVE" />
              <el-option label="公选" :value="CourseType.PUBLIC_ELECTIVE" />
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
          <el-form-item label="状态" prop="status" v-if="isEdit">
            <el-select
              v-model="formData.status"
              placeholder="请选择状态"
              style="width: 100%"
            >
              <el-option label="停用" :value="CourseStatus.INACTIVE" />
              <el-option label="启用" :value="CourseStatus.ACTIVE" />
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
import type {
  Course,
  CreateCourseData,
  UpdateCourseData
} from '@/types/database'
import { CourseType, CourseStatus } from '@/types/database'

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

// 表单数据
const formData = reactive<CreateCourseData>({
  course_code: '',
  course_name: '',
  credits: 1,
  hours: 16,
  course_type: CourseType.ELECTIVE,
  description: '',
  status: CourseStatus.ACTIVE
})

// 计算是否为编辑模式
const isEdit = computed(() => !!props.course)

// 表单验证规则
const formRules: FormRules = {
  course_code: [
    { required: true, message: '请输入课程代码', trigger: 'blur' },
    { min: 2, max: 20, message: '课程代码长度为2-20个字符', trigger: 'blur' },
    {
      pattern: /^[A-Z0-9]+$/,
      message: '课程代码只能包含大写字母和数字',
      trigger: 'blur'
    }
  ],
  course_name: [
    { required: true, message: '请输入课程名称', trigger: 'blur' },
    { min: 2, max: 50, message: '课程名称长度为2-50个字符', trigger: 'blur' }
  ],
  course_type: [
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

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    course_code: '',
    course_name: '',
    credits: 1,
    hours: 16,
    course_type: CourseType.ELECTIVE,
    description: '',
    status: CourseStatus.ACTIVE
  })
  formRef.value?.resetFields()
}

// 填充表单数据
const fillFormData = (course: Course) => {
  Object.assign(formData, {
    course_code: course.course_code,
    course_name: course.course_name,
    credits: course.credits,
    hours: course.hours,
    course_type: course.course_type,
    description: course.description || '',
    status: course.status
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
        course_name: formData.course_name,
        credits: formData.credits,
        hours: formData.hours,
        course_type: formData.course_type,
        description: formData.description,
        status: formData.status
      }
      await courseApi.update(props.course.course_id, updateData)
      ElMessage.success('更新课程成功')
    } else {
      // 新增课程
      await courseApi.create(formData)
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
    if (show) {
      if (props.course) {
        // 编辑模式，填充数据
        fillFormData(props.course)
      } else {
        // 新增模式，重置表单
        resetForm()
      }
    }
  }
)
</script>

<style lang="scss" scoped>
.course-form {
  padding: 0 20px;

  .el-form-item {
    margin-bottom: 20px;
  }
}
</style>
