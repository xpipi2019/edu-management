<template>
  <el-select
    v-model="selectedValue"
    placeholder="请选择学生"
    filterable
    remote
    :remote-method="handleSearch"
    :loading="loading"
    clearable
    style="width: 100%"
    @change="handleChange"
  >
    <el-option
      v-for="user in userOptions"
      :key="user.user_id"
      :label="`${user.username} - ${user.real_name}`"
      :value="user.user_id"
    />
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { userApi } from '@/api/modules/user'
import type { User } from '@/types/database'

interface Props {
  modelValue?: number
  userType?: 'student' | 'teacher' | 'all'
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value?: number): void
  (e: 'change', user?: User): void
}

const props = withDefaults(defineProps<Props>(), {
  userType: 'student',
  placeholder: '请选择用户'
})

const emit = defineEmits<Emits>()

const selectedValue = ref<number>()
const userOptions = ref<User[]>([])
const loading = ref(false)

// 搜索用户
const handleSearch = async (query: string) => {
  if (!query) {
    userOptions.value = []
    return
  }

  loading.value = true
  try {
    const response = await userApi.getList({
      page: 1,
      pageSize: 20,
      username: query
    })

    if (response.code === 0 && response.data) {
    // 根据用户类型过滤
    if (props.userType === 'student') {
        userOptions.value = response.data.list.filter((user: User) =>
          user.roles?.some(role => role.role_code === 'STUDENT')
      )
    } else if (props.userType === 'teacher') {
        userOptions.value = response.data.list.filter((user: User) =>
          user.roles?.some(role => role.role_code === 'TEACHER')
      )
    } else {
        userOptions.value = response.data.list
      }
    }
  } catch (error) {
    console.error('搜索用户失败:', error)
    userOptions.value = []
  } finally {
    loading.value = false
  }
}

// 处理选择变化
const handleChange = (value?: number) => {
  emit('update:modelValue', value)

  const selectedUser = userOptions.value.find(user => user.user_id === value)
  emit('change', selectedUser)
}

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    selectedValue.value = newValue
  },
  { immediate: true }
)
</script>
