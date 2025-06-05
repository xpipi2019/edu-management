<template>
  <BaseModal
    v-model="dialogVisible"
    :title="isEdit ? '编辑教师' : '新增教师'"
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
      <!-- 用户信息 -->
      <el-divider content-position="left">用户信息</el-divider>

      <el-form-item label="用户名" prop="user_data.username">
        <el-input
          v-model="formData.user_data.username"
          placeholder="请输入用户名"
          :disabled="isEdit"
          clearable
        />
      </el-form-item>

      <el-form-item label="密码" prop="user_data.password" v-if="!isEdit">
        <el-input
          v-model="formData.user_data.password"
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

      <el-form-item label="真实姓名" prop="user_data.real_name">
        <el-input
          v-model="formData.user_data.real_name"
          placeholder="请输入真实姓名"
          clearable
        />
      </el-form-item>

      <el-form-item label="邮箱" prop="user_data.email">
        <el-input
          v-model="formData.user_data.email"
          placeholder="请输入邮箱"
          clearable
        />
      </el-form-item>

      <el-form-item label="手机号" prop="user_data.phone">
        <el-input
          v-model="formData.user_data.phone"
          placeholder="请输入手机号"
          clearable
        />
      </el-form-item>

      <el-form-item label="用户状态" prop="user_data.status">
        <el-radio-group v-model="formData.user_data.status">
          <el-radio :label="UserStatus.ACTIVE">启用</el-radio>
          <el-radio :label="UserStatus.INACTIVE">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 教师信息 -->
      <el-divider content-position="left">教师信息</el-divider>

      <el-form-item label="教师工号" prop="teacher_no">
        <el-input
          v-model="formData.teacher_no"
          placeholder="请输入教师工号"
          clearable
        />
      </el-form-item>

      <el-form-item label="所属部门" prop="dept_id">
        <el-select
          v-model="formData.dept_id"
          placeholder="请选择部门"
          style="width: 100%"
          :loading="departmentsLoading"
        >
          <el-option
            v-for="dept in departmentOptions"
            :key="dept.dept_id"
            :label="dept.dept_name"
            :value="dept.dept_id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="职称" prop="title">
        <el-select
          v-model="formData.title"
          placeholder="请选择职称"
          style="width: 100%"
        >
          <el-option label="教授" value="教授" />
          <el-option label="副教授" value="副教授" />
          <el-option label="讲师" value="讲师" />
          <el-option label="助教" value="助教" />
        </el-select>
      </el-form-item>

      <el-form-item label="入职日期" prop="hire_date">
        <el-date-picker
          v-model="formData.hire_date"
          type="date"
          placeholder="请选择入职日期"
          style="width: 100%"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="教师状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="TeacherStatus.ACTIVE">在职</el-radio>
          <el-radio :label="TeacherStatus.INACTIVE">离职</el-radio>
          <el-radio :label="TeacherStatus.SUSPENDED">休假</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import BaseModal from '@/components/common/BaseModal/index.vue'
import { teacherApi } from '@/api/modules/teacher'
import { departmentApi } from '@/api/modules/department'
import type { Teacher, Department, CreateTeacherData, UpdateTeacherData } from '@/types/database'
import { UserStatus, TeacherStatus } from '@/types/database'

interface Props {
  modelValue: boolean
  teacher?: Teacher | null
}

const props = withDefaults(defineProps<Props>(), {
  teacher: null
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

// 部门选项
const departmentOptions = ref<Department[]>([])

// 部门加载状态
const departmentsLoading = ref(false)

// 是否为编辑模式
const isEdit = computed(() => !!props.teacher)

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})

// 表单数据
const formData = reactive<CreateTeacherData & { confirmPassword?: string }>({
  user_data: {
    username: '',
    password: '',
    email: '',
    phone: '',
    real_name: '',
    status: UserStatus.ACTIVE
  },
  teacher_no: '',
  dept_id: undefined,
  title: '',
  hire_date: '',
  status: TeacherStatus.ACTIVE,
  confirmPassword: ''
})

// 表单验证规则
const formRules: FormRules = {
  'user_data.username': [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  'user_data.password': [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.user_data.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  'user_data.real_name': [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '真实姓名长度为 2 到 10 个字符', trigger: 'blur' }
  ],
  'user_data.email': [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  'user_data.phone': [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  teacher_no: [
    { required: true, message: '请输入教师工号', trigger: 'blur' },
    { min: 6, max: 20, message: '教师工号长度为 6 到 20 个字符', trigger: 'blur' }
  ],
  dept_id: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请选择职称', trigger: 'change' }
  ],
  hire_date: [
    { required: true, message: '请选择入职日期', trigger: 'change' }
  ]
}

// 获取部门列表
const fetchDepartments = async () => {
  try {
    departmentsLoading.value = true
    const response = await departmentApi.getAll()
    departmentOptions.value = response.data
  } catch (error) {
    console.error('获取部门列表失败:', error)
  } finally {
    departmentsLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    user_data: {
      username: '',
      password: '',
      email: '',
      phone: '',
      real_name: '',
      status: UserStatus.ACTIVE
    },
    teacher_no: '',
    dept_id: undefined,
    title: '',
    hire_date: '',
    status: TeacherStatus.ACTIVE,
    confirmPassword: ''
  })
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 填充表单数据
const fillFormData = (teacher: Teacher) => {
  Object.assign(formData, {
    user_data: {
      username: teacher.user?.username || '',
      email: teacher.user?.email || '',
      phone: teacher.user?.phone || '',
      real_name: teacher.user?.real_name || '',
      status: teacher.user?.status || UserStatus.ACTIVE
    },
    teacher_no: teacher.teacher_no,
    dept_id: teacher.dept_id,
    title: teacher.title || '',
    hire_date: teacher.hire_date || '',
    status: teacher.status
  })
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    if (isEdit.value && props.teacher) {
      // 编辑教师
      const updateData: UpdateTeacherData = {
        user_data: {
          email: formData.user_data.email,
          phone: formData.user_data.phone,
          real_name: formData.user_data.real_name,
          status: formData.user_data.status
        },
        teacher_no: formData.teacher_no,
        dept_id: formData.dept_id,
        title: formData.title,
        hire_date: formData.hire_date,
        status: formData.status
      }
      await teacherApi.update(props.teacher.teacher_id, updateData)
      ElMessage.success('更新教师成功')
    } else {
      // 新增教师
      const createData: CreateTeacherData = {
        user_data: {
          username: formData.user_data.username,
          password: formData.user_data.password,
          email: formData.user_data.email,
          phone: formData.user_data.phone,
          real_name: formData.user_data.real_name,
          status: formData.user_data.status
        },
        teacher_no: formData.teacher_no,
        dept_id: formData.dept_id,
        title: formData.title,
        hire_date: formData.hire_date,
        status: formData.status
      }
      await teacherApi.create(createData)
      ElMessage.success('创建教师成功')
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
    fetchDepartments()
    if (props.teacher) {
      fillFormData(props.teacher)
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

.el-divider {
  margin: 16px 0;
}
</style>
