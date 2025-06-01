import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/modules/auth'
import type { LoginForm } from '@/types/user'

export const useAuth = () => {
  const router = useRouter()
  const authStore = useAuthStore()
  const loading = ref(false)

  // 登录
  const login = async (loginForm: LoginForm) => {
    loading.value = true
    try {
      const response = await authApi.login(loginForm)
      authStore.setAuth(response)
      ElMessage.success('登录成功')

      // 跳转到首页或之前访问的页面
      const redirect = router.currentRoute.value.query.redirect as string
      await router.push(redirect || '/')

      return response
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('登出API调用失败:', error)
    } finally {
      authStore.logout()
      await router.push('/login')
      ElMessage.success('已退出登录')
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const user = await authApi.getProfile()
      authStore.updateUser(user)
      return user
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 检查登录状态
  const checkAuth = async () => {
    if (!authStore.token) {
      await router.push('/login')
      return false
    }

    // 如果没有用户信息，尝试获取
    if (!authStore.user) {
      try {
        await getUserInfo()
      } catch (error) {
        await router.push('/login')
        return false
      }
    }

    return true
  }

  return {
    loading,
    login,
    logout,
    getUserInfo,
    checkAuth
  }
}
