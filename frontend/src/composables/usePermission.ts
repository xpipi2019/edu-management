import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Permission, Role } from '@/constants/permission'

export const usePermission = () => {
  const authStore = useAuthStore()

  // 检查权限
  const hasPermission = (permission: Permission | Permission[] | string | string[]): boolean => {
    if (!authStore.user) {
      console.log('权限检查: 用户未登录')
      return false
    }

    const userPermissions = authStore.userPermissions
    console.log('用户权限列表:', userPermissions)

    if (Array.isArray(permission)) {
      const result = permission.some(p => userPermissions.includes(p))
      console.log(`权限检查(数组): [${permission.join(', ')}], 结果: ${result}`)
      return result
    }

    const result = userPermissions.includes(permission)
    console.log(`权限检查(单个): ${permission}, 结果: ${result}`)
    return result
  }

  // 检查所有权限
  const hasAllPermissions = (permissions: Permission[] | string[]): boolean => {
    if (!authStore.user) {
      console.log('全部权限检查: 用户未登录')
      return false
    }

    const userPermissions = authStore.userPermissions
    const result = permissions.every(p => userPermissions.includes(p))
    console.log(`全部权限检查: [${permissions.join(', ')}], 结果: ${result}`)
    return result
  }

  // 检查角色
  const hasRole = (role: Role | Role[] | string | string[]): boolean => {
    if (!authStore.user) {
      console.log('角色检查: 用户未登录')
      return false
    }

    const userRoles = authStore.userRoles
    console.log('用户角色列表:', userRoles)

    if (Array.isArray(role)) {
      const result = role.some(r => userRoles.includes(r))
      console.log(`角色检查(数组): [${role.join(', ')}], 结果: ${result}`)
      return result
    }

    const result = userRoles.includes(role)
    console.log(`角色检查(单个): ${role}, 结果: ${result}`)
    return result
  }

  // 检查所有角色
  const hasAllRoles = (roles: Role[] | string[]): boolean => {
    if (!authStore.user) {
      console.log('全部角色检查: 用户未登录')
      return false
    }

    const userRoles = authStore.userRoles
    const result = roles.every(r => userRoles.includes(r))
    console.log(`全部角色检查: [${roles.join(', ')}], 结果: ${result}`)
    return result
  }

  // 是否为超级管理员
  const isSuperAdmin = computed(() => {
    const result = hasRole(Role.SUPER_ADMIN)
    console.log(`超级管理员检查: ${result}`)
    return result
  })

  // 是否为教务管理员
  const isAcademicAdmin = computed(() => {
    const result = hasRole(Role.ACADEMIC_ADMIN)
    console.log(`教务管理员检查: ${result}`)
    return result
  })

  // 是否为教师
  const isTeacher = computed(() => {
    const result = hasRole(Role.TEACHER)
    console.log(`教师检查: ${result}`)
    return result
  })

  // 是否为学生
  const isStudent = computed(() => {
    const result = hasRole(Role.STUDENT)
    console.log(`学生检查: ${result}`)
    return result
  })

  // 是否为管理员（超级管理员或教务管理员）
  const isAdmin = computed(() => {
    const result = isSuperAdmin.value || isAcademicAdmin.value
    console.log(`管理员检查: ${result}`)
    return result
  })

  return {
    hasPermission,
    hasAllPermissions,
    hasRole,
    hasAllRoles,
    isSuperAdmin,
    isAcademicAdmin,
    isTeacher,
    isStudent,
    isAdmin
  }
}
