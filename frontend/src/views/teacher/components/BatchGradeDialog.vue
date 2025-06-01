<template>
  <BaseModal
    v-model="visible"
    title="批量录入成绩"
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
import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import BaseModal from '@/components/common/BaseModal/index.vue'
import type { CourseOffering } from '@/types/course'

interface Props {
  modelValue: boolean
  courseOffering?: CourseOffering
}

interface Emits {
  (e: 'update:modelValue', visible: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  courseOffering: undefined
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formData = reactive({
  regularScore: null as number | null,
  midtermScore: null as number | null,
  finalScore: null as number | null
})

const formRules = {
  regularScore: [{ required: true, message: '请输入平时成绩', trigger: 'blur' }],
  midtermScore: [{ required: true, message: '请输入期中成绩', trigger: 'blur' }],
  finalScore: [{ required: true, message: '请输入期末成绩', trigger: 'blur' }]
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    ElMessage.success('批量录入成功')
    emit('success')
    emit('update:modelValue', false)
  }
}

const handleCancel = () => {
  emit('update:modelValue', false)
}
</script>
