import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Permission, Role } from '@/constants/permission'

export const usePermission = () => {
  const authStore = useAuthStore()

  // 检查权限
  const hasPermission = (permission: Permission | Permission[] | string | string[]): boolean => {
    if (!authStore.user) return false

    const userPermissions = authStore.userPermissions

    if (Array.isArray(permission)) {
      return permission.some(p => userPermissions.includes(p))
    }

    return userPermissions.includes(permission)
  }

  // 检查所有权限
  const hasAllPermissions = (permissions: Permission[] | string[]): boolean => {
    if (!authStore.user) return false

    const userPermissions = authStore.userPermissions
    return permissions.every(p => userPermissions.includes(p))
  }

  // 检查角色
  const hasRole = (role: Role | Role[] | string | string[]): boolean => {
    if (!authStore.user) return false

    const userRoles = authStore.userRoles

    if (Array.isArray(role)) {
      return role.some(r => userRoles.includes(r))
    }

    return userRoles.includes(role)
  }

  // 检查所有角色
  const hasAllRoles = (roles: Role[] | string[]): boolean => {
    if (!authStore.user) return false

    const userRoles = authStore.userRoles
    return roles.every(r => userRoles.includes(r))
  }

  // 是否为超级管理员
  const isSuperAdmin = computed(() => hasRole(Role.SUPER_ADMIN))

  // 是否为教务管理员
  const isAcademicAdmin = computed(() => hasRole(Role.ACADEMIC_ADMIN))

  // 是否为教师
  const isTeacher = computed(() => hasRole(Role.TEACHER))

  // 是否为学生
  const isStudent = computed(() => hasRole(Role.STUDENT))

  // 是否为管理员（超级管理员或教务管理员）
  const isAdmin = computed(() => isSuperAdmin.value || isAcademicAdmin.value)

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
