<template>
  <div class="personal-info">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>个人信息</h2>
      <p>查看和管理我的个人信息</p>
    </div>

    <el-row :gutter="20" v-loading="loading">
      <!-- 基本信息 -->
      <el-col :span="16">
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="真实姓名">
              {{ userInfo.real_name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="用户名">
              {{ userInfo.username || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag
                v-for="role in userInfo.roles"
                :key="role.role_id"
                type="primary"
                size="small"
                style="margin-right: 8px;"
              >
                {{ role.role_name }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="手机号码">
              {{ userInfo.phone || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱地址">
              {{ userInfo.email || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="账户状态">
              <el-tag
                :type="getUserStatusTagType(userInfo.status)"
                size="small"
              >
                {{ getUserStatusText(userInfo.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ userInfo.created_at ? formatDate(userInfo.created_at) : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="最后登录">
              {{ userInfo.updated_at ? formatDate(userInfo.updated_at) : '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 角色专有信息 -->
        <el-card v-if="roleSpecificInfo" class="info-card" shadow="never" style="margin-top: 20px;">
          <template #header>
            <span>{{ getRoleInfoTitle() }}</span>
          </template>

          <!-- 学生信息 -->
          <el-descriptions v-if="isStudent && studentInfo" :column="2" border>
            <el-descriptions-item label="学号">
              {{ studentInfo.student_no || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="入学年份">
              {{ studentInfo.enrollment_year || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="专业">
              {{ studentInfo.department?.dept_name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="班级">
              {{ studentInfo.class_name || '-' }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 教师信息 -->
          <el-descriptions v-if="isTeacher && teacherInfo" :column="2" border>
            <el-descriptions-item label="工号">
              {{ teacherInfo.teacher_no || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="职位">
              {{ teacherInfo.title || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="所属院系">
              {{ teacherInfo.department?.dept_name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="入职时间">
              {{ teacherInfo.hire_date ? formatDate(teacherInfo.hire_date) : '-' }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 管理员信息 -->
          <el-descriptions v-if="isAdmin" :column="2" border>
            <el-descriptions-item label="管理级别">
              超级管理员
            </el-descriptions-item>
            <el-descriptions-item label="权限范围">
              <span v-if="userInfo.permissions && userInfo.permissions.length > 0">
                {{ userInfo.permissions.length }} 项权限
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 学习/工作统计 -->
        <el-card v-if="showStats" class="info-card" shadow="never" style="margin-top: 20px;">
          <template #header>
            <span>{{ getStatsTitle() }}</span>
          </template>

          <!-- 学生统计 -->
          <el-row v-if="isStudent" :gutter="20">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ studyStats.totalCredits }}</div>
                <div class="stat-label">已修学分</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ studyStats.passedCourses }}</div>
                <div class="stat-label">通过课程</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ studyStats.averageGPA }}</div>
                <div class="stat-label">平均绩点</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ studyStats.rank || '-' }}</div>
                <div class="stat-label">专业排名</div>
              </div>
            </el-col>
          </el-row>

          <!-- 教师统计 -->
          <el-row v-if="isTeacher" :gutter="20">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ teachingStats.totalCourses }}</div>
                <div class="stat-label">授课数量</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ teachingStats.totalStudents }}</div>
                <div class="stat-label">学生总数</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ teachingStats.averageRating }}</div>
                <div class="stat-label">教学评分</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ teachingStats.researchProjects }}</div>
                <div class="stat-label">科研项目</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- 操作区域 -->
      <el-col :span="8">
        <!-- 快捷操作 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <span>快捷操作</span>
          </template>

          <div class="quick-actions">
            <el-button type="primary" @click="showPasswordDialog = true" class="action-button">
              <el-icon><Lock /></el-icon>
              修改密码
            </el-button>
            <el-button @click="showContactDialog = true" class="action-button">
              <el-icon><Phone /></el-icon>
              更新联系方式
            </el-button>
            <el-button v-if="isStudent" @click="downloadStudentCard" class="action-button">
              <el-icon><CreditCard /></el-icon>
              下载学生证
            </el-button>
            <el-button v-if="isTeacher" @click="downloadTeacherCard" class="action-button">
              <el-icon><CreditCard /></el-icon>
              下载工作证
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="500px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="changePassword" :loading="passwordLoading">
          确认修改
        </el-button>
      </template>
    </el-dialog>

    <!-- 更新联系方式对话框 -->
    <el-dialog
      v-model="showContactDialog"
      title="更新联系方式"
      width="500px"
    >
      <el-form
        ref="contactFormRef"
        :model="contactForm"
        :rules="contactRules"
        label-width="100px"
      >
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="contactForm.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="contactForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showContactDialog = false">取消</el-button>
        <el-button type="primary" @click="updateContact" :loading="contactLoading">
          确认更新
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Lock,
  Phone,
  CreditCard
} from '@element-plus/icons-vue'
import { userApi, authApi, studentApi, teacherApi } from '@/api/modules'
import { useAuthStore } from '@/stores/auth'
import type { User, Student, Teacher } from '@/types/database'
import { UserStatus } from '@/types/database'

const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const passwordLoading = ref(false)
const contactLoading = ref(false)
const showPasswordDialog = ref(false)
const showContactDialog = ref(false)

// 用户信息
const userInfo = ref<User>({
  user_id: 0,
  username: '',
  email: '',
  phone: '',
  real_name: '',
  status: UserStatus.ACTIVE,
  created_at: '',
  updated_at: '',
  roles: [],
  permissions: []
})

// 角色专有信息
const studentInfo = ref<Student | null>(null)
const teacherInfo = ref<Teacher | null>(null)

// 表单引用
const passwordFormRef = ref()
const contactFormRef = ref()

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 联系方式表单
const contactForm = reactive({
  phone: '',
  email: ''
})

// 表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const contactRules = {
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 计算属性 - 判断用户角色
const isStudent = computed(() => {
  return userInfo.value.roles?.some(role => role.role_name === '学生')
})

const isTeacher = computed(() => {
  return userInfo.value.roles?.some(role => role.role_name === '教师')
})

const isAdmin = computed(() => {
  return userInfo.value.roles?.some(role => role.role_name === '管理员' || role.role_name === '超级管理员')
})

const roleSpecificInfo = computed(() => {
  return isStudent.value || isTeacher.value || isAdmin.value
})

const showStats = computed(() => {
  return isStudent.value || isTeacher.value
})

// 计算属性 - 学习统计
const studyStats = computed(() => {
  return {
    totalCredits: 45,
    passedCourses: 12,
    averageGPA: '3.45',
    rank: '15/120'
  }
})

// 计算属性 - 教学统计
const teachingStats = computed(() => {
  return {
    totalCourses: 8,
    totalStudents: 240,
    averageRating: '4.7',
    researchProjects: 3
  }
})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    loading.value = true

    // 获取当前用户基本信息
    const currentUser = authStore.user
    if (!currentUser) {
      throw new Error('用户未登录')
    }

    // 获取完整的用户信息
    const userResponse = await userApi.getDetail(currentUser.user_id)
    if (userResponse.data) {
      userInfo.value = userResponse.data
    } else {
      throw new Error('获取用户信息为空')
    }

    // 根据角色获取专有信息
    if (isStudent.value) {
      try {
        const studentResponse = await studentApi.getByUser(currentUser.user_id)
        studentInfo.value = studentResponse.data
      } catch (error) {
        console.warn('获取学生信息失败:', error)
      }
    }

    if (isTeacher.value) {
      try {
        const teacherResponse = await teacherApi.getByUser(currentUser.user_id)
        teacherInfo.value = teacherResponse.data
      } catch (error) {
        console.warn('获取教师信息失败:', error)
      }
    }

    // 初始化表单数据
    contactForm.phone = userInfo.value.phone || ''
    contactForm.email = userInfo.value.email || ''
  } catch (error) {
    console.error('获取用户信息失败：', error)
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true

    await authApi.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    // 重置表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''

    showPasswordDialog.value = false
    ElMessage.success('密码修改成功')
  } catch (error) {
    console.error('修改密码失败：', error)
    ElMessage.error('修改密码失败')
  } finally {
    passwordLoading.value = false
  }
}

// 更新联系方式
const updateContact = async () => {
  if (!contactFormRef.value) return

  try {
    await contactFormRef.value.validate()
    contactLoading.value = true

    await userApi.update(userInfo.value.user_id, {
      phone: contactForm.phone,
      email: contactForm.email
    })

    // 更新本地数据
    userInfo.value.phone = contactForm.phone
    userInfo.value.email = contactForm.email

    // 更新 store 中的用户信息
    authStore.updateUser(userInfo.value)

    showContactDialog.value = false
    ElMessage.success('联系方式更新成功')
  } catch (error) {
    console.error('更新联系方式失败：', error)
    ElMessage.error('更新联系方式失败')
  } finally {
    contactLoading.value = false
  }
}

// 下载学生证
const downloadStudentCard = () => {
  ElMessage.info('学生证下载功能开发中...')
}

// 下载工作证
const downloadTeacherCard = () => {
  ElMessage.info('工作证下载功能开发中...')
}

// 工具函数
const getRoleInfoTitle = () => {
  if (isStudent.value) return '学籍信息'
  if (isTeacher.value) return '职工信息'
  if (isAdmin.value) return '管理信息'
  return '角色信息'
}

const getStatsTitle = () => {
  if (isStudent.value) return '学习统计'
  if (isTeacher.value) return '教学统计'
  return '统计信息'
}

const getUserStatusText = (status?: UserStatus) => {
  if (!status) return '-'
  const statusMap: Record<UserStatus, string> = {
    [UserStatus.ACTIVE]: '正常',
    [UserStatus.INACTIVE]: '未激活',
    [UserStatus.LOCKED]: '已锁定'
  }
  return statusMap[status] || status
}

const getUserStatusTagType = (status?: UserStatus) => {
  if (!status) return ''
  const typeMap: Record<UserStatus, string> = {
    [UserStatus.ACTIVE]: 'success',
    [UserStatus.INACTIVE]: 'warning',
    [UserStatus.LOCKED]: 'danger'
  }
  return typeMap[status] || ''
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  fetchUserInfo()
})
</script>

<style lang="scss" scoped>
.personal-info {
  padding: $spacing-lg;
  background-color: $bg-page;
  min-height: 100vh;
}

.page-header {
  margin-bottom: $spacing-xl;

  h2 {
    color: $text-primary;
    margin: 0 0 $spacing-xs 0;
    font-size: 24px;
    font-weight: 600;
  }

  p {
    color: $text-regular;
    margin: 0;
    font-size: 14px;
  }
}

.info-card {
  border: none;
  box-shadow: $box-shadow-light;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.stat-item {
  text-align: center;
  padding: $spacing-md;
  border-radius: 8px;
  background: linear-gradient(135deg, $primary-color, $primary-color-light);
  color: white;

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 12px;
    opacity: 0.9;
  }
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .action-button {
    width: 100%;
    justify-content: flex-start;

    .el-icon {
      margin-right: $spacing-xs;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .personal-info {
    padding: $spacing-md;
  }

  .el-col {
    margin-bottom: $spacing-lg;
  }

  .stat-item {
    margin-bottom: $spacing-md;
  }
}
</style>
