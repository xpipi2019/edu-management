/**
 * @fileoverview 教育管理系统前端认证状态管理
 * @description 基于Pinia的用户认证、权限管理和状态持久化
 * @author XPIPI
 * @version 1.0.0
 * @date 2025-06-09
 * @license MIT
 * @copyright © 2025 XPIPI. All rights reserved.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginForm, LoginResponse } from '@/types/database'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const user = ref<User | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userRoles = computed(() => {
    const roles = user.value?.roles?.map(role => role.role_code) || []
    console.log('计算用户角色:', roles)
    return roles
  })
  const userPermissions = computed(() => {
    if (!user.value?.roles) {
      console.log('无法获取权限: 用户没有角色')
      return []
    }

    // 从用户的所有角色中提取权限
    const permissions = new Set<string>()

    // 直接从用户对象获取权限列表
    if (user.value.permissions && Array.isArray(user.value.permissions)) {
      user.value.permissions.forEach(permission => {
        permissions.add(permission)
      })
      console.log('从用户对象直接获取的权限:', Array.from(permissions))
      return Array.from(permissions)
    }

    // 如果用户对象没有权限列表，则从角色中提取
    user.value.roles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(permission => {
          permissions.add(permission.permission_code)
        })
      }
    })

    const permissionsList = Array.from(permissions)
    console.log('从角色中提取的权限:', permissionsList)
    return permissionsList
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
        console.log('从localStorage恢复用户信息:', user.value)
        console.log('用户角色:', user.value?.roles)
        console.log('用户权限:', user.value?.permissions)
      } catch (error) {
        console.error('解析用户信息失败:', error)
        clearAuth()
      }
    }
  }

  // 设置认证信息
  const setAuth = (authData: LoginResponse) => {
    token.value = authData.token
    refreshToken.value = authData.refresh_token
    user.value = authData.user

    console.log('设置认证信息:', {
      token: authData.token ? '已设置' : '未设置',
      refreshToken: authData.refresh_token ? '已设置' : '未设置',
      user: authData.user ? '已设置' : '未设置'
    })

    if (authData.user) {
      console.log('用户角色:', authData.user.roles)
      console.log('用户权限:', authData.user.permissions)
    }

    // 保存到localStorage
    localStorage.setItem('token', authData.token)
    localStorage.setItem('refreshToken', authData.refresh_token)
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

    console.log('已清除认证信息')
  }

  // 登出
  const logout = () => {
    clearAuth()
    // 可以在这里调用登出API
    console.log('用户已登出')
  }

  // 更新用户信息
  const updateUser = (userData: User) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(user.value))

    console.log('更新用户信息:', userData)
    console.log('用户角色:', userData.roles)
    console.log('用户权限:', userData.permissions)
  }

  // 检查权限
  const hasPermission = (permission: string | string[]): boolean => {
    if (!user.value) return false

    const permissions = userPermissions.value
    console.log(`检查权限 [${Array.isArray(permission) ? permission.join(', ') : permission}]，用户权限: [${permissions.join(', ')}]`)

    if (Array.isArray(permission)) {
      return permission.some(p => permissions.includes(p))
    }
    return permissions.includes(permission)
  }

  // 检查角色
  const hasRole = (role: string | string[]): boolean => {
    if (!user.value) return false

    const roles = userRoles.value
    console.log(`检查角色 [${Array.isArray(role) ? role.join(', ') : role}]，用户角色: [${roles.join(', ')}]`)

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
