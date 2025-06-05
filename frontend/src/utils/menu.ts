import type { MenuItem } from '@/constants/menu'
import { Permission } from '@/constants/permission'

// 菜单项显示条件判断
export const getMenuVisibility = (userPermissions: string[]): Record<string, boolean> => {
  return {
    // 系统管理模块
    showUserManagement: userPermissions.includes(Permission.USER_MANAGE),
    showRoleManagement: userPermissions.includes(Permission.ROLE_MANAGE),
    showDepartmentManagement: userPermissions.includes(Permission.DEPARTMENT_MANAGE),

    // 课程管理模块
    showCourseManagement: userPermissions.includes(Permission.COURSE_MANAGE),
    showCourseOfferingManagement: userPermissions.includes(Permission.COURSE_OFFERING_MANAGE),

    // 教学管理模块
    showScheduleManagement: userPermissions.includes(Permission.SCHEDULE_MANAGE),
    showClassroomManagement: userPermissions.includes(Permission.CLASSROOM_MANAGE),
    showGradeManagement: userPermissions.includes(Permission.GRADE_MANAGE),

    // 学生管理模块
    showStudentStatusManagement: userPermissions.includes(Permission.STUDENT_STATUS_MANAGE),
    showRewardPunishmentManagement: userPermissions.includes(Permission.REWARD_PUNISHMENT_MANAGE),

    // 教师功能
    showMyCourses: userPermissions.includes(Permission.MY_COURSES_VIEW),

    // 学生功能
    showCourseSelection: userPermissions.includes(Permission.MY_ENROLLMENT_VIEW),
    showGradeQuery: userPermissions.includes(Permission.MY_GRADE_VIEW)
  }
}

// 获取菜单项的显示状态
export const isMenuItemVisible = (item: MenuItem, userPermissions: string[]): boolean => {
  if (!item.permission) return true

  if (Array.isArray(item.permission)) {
    return item.permission.some(permission => userPermissions.includes(permission))
  }

  return userPermissions.includes(item.permission)
}

// 计算菜单项数量（用于统计）
export const getMenuStats = (menuItems: MenuItem[], userPermissions: string[]) => {
  let totalMenus = 0
  let visibleMenus = 0
  let totalSubMenus = 0
  let visibleSubMenus = 0

  const countMenus = (items: MenuItem[]) => {
    items.forEach(item => {
      totalMenus++

      if (isMenuItemVisible(item, userPermissions)) {
        visibleMenus++
      }

      if (item.children && item.children.length > 0) {
        item.children.forEach(child => {
          totalSubMenus++
          if (isMenuItemVisible(child, userPermissions)) {
            visibleSubMenus++
          }
        })
        countMenus(item.children)
      }
    })
  }

  countMenus(menuItems)

  return {
    totalMenus,
    visibleMenus,
    totalSubMenus,
    visibleSubMenus,
    visibilityRate: totalMenus > 0 ? Math.round((visibleMenus / totalMenus) * 100) : 0
  }
}
