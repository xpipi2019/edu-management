import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/modules/auth'
import type { LoginForm } from '@/types/database'

export const useAuth = () => {
  const router = useRouter()
  const authStore = useAuthStore()
  const loading = ref(false)

  // 登录
  const login = async (loginForm: LoginForm) => {
    loading.value = true
    try {
      const response = await authApi.login(loginForm)

      // 检查响应是否成功
      if (response.code === 0 && response.data) {
        authStore.setAuth(response.data)
        ElMessage.success('登录成功')

        // 跳转到首页或之前访问的页面
        const redirect = router.currentRoute.value.query.redirect as string
        await router.push(redirect || '/')

        return response.data
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '登录失败')
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
      const response = await authApi.getProfile()

      if (response.code === 0 && response.data) {
        authStore.updateUser(response.data)
        return response.data
      } else {
        throw new Error(response.message || '获取用户信息失败')
      }
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
