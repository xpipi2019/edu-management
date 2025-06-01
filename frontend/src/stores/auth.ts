import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginForm, LoginResponse } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const user = ref<User | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userRoles = computed(() => user.value?.roles.map(role => role.code) || [])
  const userPermissions = computed(() => {
    if (!user.value?.roles) return []

    // 从用户的所有角色中提取权限
    const permissions = new Set<string>()
    user.value.roles.forEach(role => {
      role.permissions?.forEach(permission => {
        permissions.add(permission.code)
      })
    })

    return Array.from(permissions)
  })

  // 从localStorage恢复状态
  const initAuth = () => {
    const savedToken = localStorage.getItem('token')
    const savedRefreshToken = localStorage.getItem('refreshToken')
    const savedUser = localStorage.getItem('user')

    if (savedToken) {
      token.value = savedToken
    }
    if (savedRefreshToken) {
      refreshToken.value = savedRefreshToken
    }
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('解析用户信息失败:', error)
        clearAuth()
      }
    }
  }

  // 设置认证信息
  const setAuth = (authData: LoginResponse) => {
    token.value = authData.token
    refreshToken.value = authData.refreshToken
    user.value = authData.user

    // 保存到localStorage
    localStorage.setItem('token', authData.token)
    localStorage.setItem('refreshToken', authData.refreshToken)
    localStorage.setItem('user', JSON.stringify(authData.user))
  }

  // 清除认证信息
  const clearAuth = () => {
    token.value = ''
    refreshToken.value = ''
    user.value = null

    // 清除localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  // 登出
  const logout = () => {
    clearAuth()
    // 可以在这里调用登出API
  }

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  // 检查权限
  const hasPermission = (permission: string | string[]): boolean => {
    if (!user.value) return false

    const permissions = userPermissions.value
    if (Array.isArray(permission)) {
      return permission.some(p => permissions.includes(p))
    }
    return permissions.includes(permission)
  }

  // 检查角色
  const hasRole = (role: string | string[]): boolean => {
    if (!user.value) return false

    const roles = userRoles.value
    if (Array.isArray(role)) {
      return role.some(r => roles.includes(r))
    }
    return roles.includes(role)
  }

  return {
    // 状态
    token,
    refreshToken,
    user,

    // 计算属性
    isLoggedIn,
    userRoles,
    userPermissions,

    // 方法
    initAuth,
    setAuth,
    clearAuth,
    logout,
    updateUser,
    hasPermission,
    hasRole
  }
})
