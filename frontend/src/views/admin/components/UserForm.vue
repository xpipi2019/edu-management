<template>
  <BaseModal
    v-model="dialogVisible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="600px"
    :loading="loading"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名"
          :disabled="isEdit"
          clearable
        />
      </el-form-item>

      <el-form-item label="密码" prop="password" v-if="!isEdit">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          show-password
          clearable
        />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          show-password
          clearable
        />
      </el-form-item>

      <el-form-item label="真实姓名" prop="real_name">
        <el-input
          v-model="formData.real_name"
          placeholder="请输入真实姓名"
          clearable
        />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="formData.email"
          placeholder="请输入邮箱"
          clearable
        />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="formData.phone"
          placeholder="请输入手机号"
          clearable
        />
      </el-form-item>

      <el-form-item label="用户状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="UserStatus.ACTIVE">启用</el-radio>
          <el-radio :label="UserStatus.INACTIVE">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="角色" prop="role_ids">
        <el-select
          v-model="formData.role_ids"
          placeholder="请选择角色"
          multiple
          style="width: 100%"
          :loading="rolesLoading"
        >
          <el-option
            v-for="role in roleOptions"
            :key="role.role_id"
            :label="role.role_name"
            :value="role.role_id"
          />
        </el-select>
      </el-form-item>
    </el-form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import BaseModal from '@/components/common/BaseModal/index.vue'
import { userApi } from '@/api/modules/user'
import { roleApi } from '@/api/modules/role'
import type { User, Role, CreateUserData, UpdateUserData } from '@/types/database'
import { UserStatus } from '@/types/database'

interface Props {
  modelValue: boolean
  user?: User | null
}

const props = withDefaults(defineProps<Props>(), {
  user: null
})

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const emit = defineEmits<Emits>()

// 表单引用
const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 角色选项
const roleOptions = ref<Role[]>([])

// 角色加载状态
const rolesLoading = ref(false)

// 是否为编辑模式
const isEdit = computed(() => !!props.user)

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})

// 表单数据
const formData = reactive<CreateUserData & { confirmPassword?: string; status?: UserStatus }>({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  real_name: '',
  status: UserStatus.ACTIVE,
  role_ids: []
})

// 表单验证规则
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  real_name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '真实姓名长度为 2 到 10 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  role_ids: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 获取角色列表
const fetchRoles = async () => {
  try {
    rolesLoading.value = true
    const response = await roleApi.getAll()
    roleOptions.value = response.data
  } catch (error) {
    console.error('获取角色列表失败:', error)
  } finally {
    rolesLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    real_name: '',
    status: UserStatus.ACTIVE,
    role_ids: []
  })
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 填充表单数据
const fillFormData = (user: User) => {
  Object.assign(formData, {
    username: user.username,
    email: user.email,
    phone: user.phone || '',
    real_name: user.real_name,
    status: user.status,
    role_ids: user.roles?.map((role: any) => role.role_id) || []
  })
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    if (isEdit.value && props.user) {
      // 编辑用户
      const updateData: UpdateUserData = {
        email: formData.email,
        phone: formData.phone,
        real_name: formData.real_name,
        status: formData.status
      }
      await userApi.update(props.user.user_id, updateData)
      ElMessage.success('更新用户成功')
    } else {
      // 新增用户
      const createData: CreateUserData = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.phone,
        real_name: formData.real_name
      }
      await userApi.create(createData)
      ElMessage.success('创建用户成功')
    }

    emit('success')
    dialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

// 处理取消
const handleCancel = () => {
  resetForm()
}

// 监听对话框显示
watch(dialogVisible, (visible) => {
  if (visible) {
    fetchRoles()
    if (props.user) {
      fillFormData(props.user)
    } else {
      resetForm()
    }
  }
})
</script>

<style lang="scss" scoped>
.el-form-item {
  margin-bottom: 20px;
}
</style>
