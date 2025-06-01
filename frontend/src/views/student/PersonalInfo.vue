<template>
  <div class="personal-info">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>个人信息</h2>
      <p>查看和管理我的个人信息</p>
    </div>

    <el-row :gutter="20">
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
              {{ studentInfo.user?.realName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="学号">
              {{ studentInfo.studentId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="用户名">
              {{ studentInfo.user?.username || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="入学年份">
              {{ studentInfo.enrollmentYear || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号码">
              {{ studentInfo.user?.phone || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱地址">
              {{ studentInfo.user?.email || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="账户状态">
              <el-tag
                :type="getUserStatusTagType(studentInfo.user?.status)"
                size="small"
              >
                {{ getUserStatusText(studentInfo.user?.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ studentInfo.user?.createdAt ? formatDate(studentInfo.user.createdAt) : '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 学籍信息 -->
        <el-card class="info-card" shadow="never" style="margin-top: 20px;">
          <template #header>
            <span>学籍信息</span>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="专业">
              {{ studentInfo.major || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="班级">
              {{ studentInfo.className || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="学籍状态">
              <el-tag
                :type="getStatusTagType(studentInfo.status)"
                size="small"
              >
                {{ getStatusText(studentInfo.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="入学年份">
              {{ studentInfo.enrollmentYear || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 学习统计 -->
        <el-card class="info-card" shadow="never" style="margin-top: 20px;">
          <template #header>
            <span>学习统计</span>
          </template>

          <el-row :gutter="20">
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
            <el-button @click="downloadStudentCard" class="action-button">
              <el-icon><CreditCard /></el-icon>
              下载学生证
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
import { userApi } from '@/api/modules'
import type { Student } from '@/types/user'
import { StudentStatus, UserStatus } from '@/types/user'

// 响应式数据
const loading = ref(false)
const passwordLoading = ref(false)
const contactLoading = ref(false)
const showPasswordDialog = ref(false)
const showContactDialog = ref(false)

// 学生信息
const studentInfo = ref<Student>({
  id: 0,
  userId: 0,
  studentId: '',
  enrollmentYear: 0,
  major: '',
  className: '',
  status: StudentStatus.ENROLLED,
  user: {
    id: 0,
    username: '',
    email: '',
    phone: '',
    realName: '',
    avatar: '',
    status: UserStatus.ACTIVE,
    createdAt: '',
    updatedAt: '',
    roles: [],
    permissions: []
  }
})

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

// 计算属性 - 学习统计
const studyStats = computed(() => {
  // 这里应该从实际的选课和成绩数据中计算
  // 暂时使用模拟数据
  return {
    totalCredits: 45,
    passedCourses: 12,
    averageGPA: '3.45',
    rank: '15/120'
  }
})

// 获取学生信息
const fetchStudentInfo = async () => {
  try {
    loading.value = true
    // 这里应该调用获取当前学生信息的API
    // 暂时使用模拟数据
    const mockData: Student = {
      id: 1,
      userId: 4,
      studentId: 'S001',
      enrollmentYear: 2021,
      major: '计算机科学与技术',
      className: '计科2021-1班',
      status: StudentStatus.ENROLLED,
      user: {
        id: 4,
        username: 'student001',
        email: 'student@example.com',
        phone: '13800138000',
        realName: '李同学',
        avatar: '',
        status: UserStatus.ACTIVE,
        createdAt: '2021-09-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        roles: [],
        permissions: []
      }
    }

    studentInfo.value = mockData

    // 初始化表单数据
    if (studentInfo.value.user) {
      contactForm.phone = studentInfo.value.user.phone || ''
      contactForm.email = studentInfo.value.user.email || ''
    }
  } catch (error) {
    console.error('获取学生信息失败：', error)
    ElMessage.error('获取学生信息失败')
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

    // 调用修改密码API - 暂时模拟
    // 实际应该调用专门的密码修改API
    ElMessage.success('密码修改功能暂未实现，请联系管理员')

    // 重置表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''

    showPasswordDialog.value = false
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

    // 调用更新联系方式API
    await userApi.updateUser(studentInfo.value.userId, {
      phone: contactForm.phone,
      email: contactForm.email
    })

    // 更新本地数据
    if (studentInfo.value.user) {
      studentInfo.value.user.phone = contactForm.phone
      studentInfo.value.user.email = contactForm.email
    }

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

// 工具函数
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

const getStatusText = (status: StudentStatus) => {
  const statusMap: Record<StudentStatus, string> = {
    [StudentStatus.ENROLLED]: '在读',
    [StudentStatus.GRADUATED]: '已毕业',
    [StudentStatus.SUSPENDED]: '休学',
    [StudentStatus.DROPPED]: '退学'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status: StudentStatus) => {
  const typeMap: Record<StudentStatus, string> = {
    [StudentStatus.ENROLLED]: 'success',
    [StudentStatus.GRADUATED]: 'info',
    [StudentStatus.SUSPENDED]: 'warning',
    [StudentStatus.DROPPED]: 'danger'
  }
  return typeMap[status] || ''
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  fetchStudentInfo()
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
