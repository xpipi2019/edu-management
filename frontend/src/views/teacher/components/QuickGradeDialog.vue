<template>
  <BaseModal
    v-model="visible"
    title="快速录入成绩"
    width="500px"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="学生姓名">
        <el-input :value="grade?.student?.realName" disabled />
      </el-form-item>

      <el-form-item label="学号">
        <el-input :value="grade?.student?.studentId" disabled />
      </el-form-item>

      <el-form-item label="平时成绩" prop="regularScore">
        <el-input-number v-model="formData.regularScore" :min="0" :max="100" style="width: 100%" />
      </el-form-item>

      <el-form-item label="期中成绩" prop="midtermScore">
        <el-input-number v-model="formData.midtermScore" :min="0" :max="100" style="width: 100%" />
      </el-form-item>

      <el-form-item label="期末成绩" prop="finalScore">
        <el-input-number v-model="formData.finalScore" :min="0" :max="100" style="width: 100%" />
      </el-form-item>
    </el-form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import BaseModal from '@/components/common/BaseModal/index.vue'

interface Props {
  modelValue: boolean
  grade: any
}

interface Emits {
  (e: 'update:modelValue', visible: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  grade: null
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formData = reactive({
  regularScore: null,
  midtermScore: null,
  finalScore: null
})

const formRules = {
  regularScore: [{ required: true, message: '请输入平时成绩', trigger: 'blur' }],
  midtermScore: [{ required: true, message: '请输入期中成绩', trigger: 'blur' }],
  finalScore: [{ required: true, message: '请输入期末成绩', trigger: 'blur' }]
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    ElMessage.success('录入成功')
    emit('success')
    handleCancel()
  }
}

const handleCancel = () => {
  // 重置表单数据
  Object.assign(formData, {
    regularScore: null,
    midtermScore: null,
    finalScore: null
  })
  formRef.value?.resetFields()
  emit('update:modelValue', false)
}

// 填充表单数据
const fillFormData = (grade: any) => {
  if (grade) {
    Object.assign(formData, {
      regularScore: grade.regularScore || null,
      midtermScore: grade.midtermScore || null,
      finalScore: grade.finalScore || null
    })
  }
}

// 监听弹窗显示状态
watch(
  () => props.modelValue,
  (show) => {
    if (show) {
      if (props.grade) {
        fillFormData(props.grade)
      } else {
        // 重置表单
        Object.assign(formData, {
          regularScore: null,
          midtermScore: null,
          finalScore: null
        })
        formRef.value?.resetFields()
      }
    }
  }
)

// 监听grade变化
watch(
  () => props.grade,
  (grade) => {
    if (grade && props.modelValue) {
      fillFormData(grade)
    }
  }
)
</script>
