<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">教务管理系统</h1>
        <p class="login-subtitle">欢迎登录</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.remember">
            记住我
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-button"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <div class="demo-accounts">
          <h4>演示账号（密码都是：123456）：</h4>
          <div class="account-list">
            <div
              v-for="account in demoAccounts"
              :key="account.username"
              class="account-item"
              @click="fillAccount(account.username)"
            >
              <strong>{{ account.label }}</strong>: {{ account.username }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElForm, ElMessage } from 'element-plus'
import { useAuth } from '@/composables/useAuth'
import type { LoginForm } from '@/types/user'
import type { FormRules } from 'element-plus'

const { login, loading } = useAuth()

// 表单引用
const loginFormRef = ref<InstanceType<typeof ElForm>>()

// 登录表单数据
const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
  remember: false
})

// 演示账号数据
const demoAccounts = computed(() => [
  { username: 'admin', label: '超级管理员' },
  { username: 'academic', label: '教务人员' },
  { username: 'teacher', label: '教师' },
  { username: 'student', label: '学生' }
])

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 填充演示账号
const fillAccount = (username: string) => {
  Object.assign(loginForm, {
    username,
    password: '123456'
  })
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    await login(loginForm)
  } catch (error) {
    console.error('登录失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: $spacing-lg;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: $bg-white;
  border-radius: $border-radius-large;
  box-shadow: $box-shadow-dark;
  padding: $spacing-xl;
}

.login-header {
  text-align: center;
  margin-bottom: $spacing-xl;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 $spacing-sm 0;
}

.login-subtitle {
  font-size: 16px;
  color: $text-secondary;
  margin: 0;
}

.login-form {
  .el-form-item {
    margin-bottom: $spacing-lg;
  }
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.login-footer {
  margin-top: $spacing-lg;
}

.demo-accounts {
  h4 {
    font-size: 14px;
    color: $text-primary;
    margin: 0 0 $spacing-md 0;
    text-align: center;
  }
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.account-item {
  font-size: 12px;
  color: $text-secondary;
  background: $bg-light;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-base;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;

  &:hover {
    background: rgba($primary-color, 0.1);
    border-color: $primary-color;
    color: $primary-color;
  }

  strong {
    color: $text-primary;
  }
}

// 响应式设计
@media (max-width: 480px) {
  .login-container {
    padding: $spacing-md;
  }

  .login-card {
    padding: $spacing-lg;
  }

  .login-title {
    font-size: 24px;
  }
}
</style>
