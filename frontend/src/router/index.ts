import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Permission } from '@/constants/permission'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/Login.vue'),
      meta: {
        title: '登录',
        requiresAuth: false
      }
    },
    {
      path: '/',
      name: 'Layout',
      component: () => import('@/components/layout/AppLayout/index.vue'),
      redirect: '/dashboard',
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: {
            title: '仪表盘',
            requiresAuth: true
          }
        },
        // 通用路由
        {
          path: '/profile',
          name: 'PersonalInfo',
          component: () => import('@/views/PersonalInfo.vue'),
          meta: {
            title: '个人信息',
            requiresAuth: true
          }
        },
        {
          path: '/settings',
          name: 'Settings',
          component: () => import('@/views/Settings.vue'),
          meta: {
            title: '系统设置',
            requiresAuth: true
          }
        },
        // 用户管理路由
        {
          path: '/admin/users',
          name: 'UserManagement',
          component: () => import('@/views/admin/UserManagement.vue'),
          meta: {
            title: '用户管理',
            requiresAuth: true,
            permissions: [Permission.USER_MANAGE]
          }
        },
        {
          path: '/admin/roles',
          name: 'RoleManagement',
          component: () => import('@/views/admin/RoleManagement.vue'),
          meta: {
            title: '角色管理',
            requiresAuth: true,
            permissions: [Permission.ROLE_MANAGE]
          }
        },
        {
          path: '/admin/departments',
          name: 'DepartmentManagement',
          component: () => import('@/views/admin/DepartmentManagement.vue'),
          meta: {
            title: '部门管理',
            requiresAuth: true,
            permissions: [Permission.DEPARTMENT_MANAGE]
          }
        },
        {
          path: '/admin/teachers',
          name: 'TeacherManagement',
          component: () => import('@/views/admin/TeacherManagement.vue'),
          meta: {
            title: '教师管理',
            requiresAuth: true,
            permissions: [Permission.TEACHER_MANAGE]
          }
        },
        {
          path: '/admin/students',
          name: 'StudentManagement',
          component: () => import('@/views/admin/StudentManagement.vue'),
          meta: {
            title: '学生管理',
            requiresAuth: true,
            permissions: [Permission.STUDENT_MANAGE]
          }
        },
        // 课程管理路由
        {
          path: '/academic/courses',
          name: 'CourseManagement',
          component: () => import('@/views/academic/CourseManagement.vue'),
          meta: {
            title: '课程管理',
            requiresAuth: true,
            permissions: [Permission.COURSE_MANAGE]
          }
        },
        {
          path: '/academic/course-offerings',
          name: 'CourseOfferingManagement',
          component: () => import('@/views/academic/CourseOfferingManagement.vue'),
          meta: {
            title: '开课管理',
            requiresAuth: true,
            permissions: [Permission.COURSE_OFFERING_MANAGE]
          }
        },
        {
          path: '/academic/schedules',
          name: 'ScheduleManagement',
          component: () => import('@/views/academic/ScheduleManagement.vue'),
          meta: {
            title: '排课管理',
            requiresAuth: true,
            permissions: [Permission.SCHEDULE_MANAGE]
          }
        },
        // 教室管理路由
        {
          path: '/academic/classrooms',
          name: 'ClassroomManagement',
          component: () => import('@/views/academic/ClassroomManagement.vue'),
          meta: {
            title: '教室管理',
            requiresAuth: true,
            permissions: [Permission.CLASSROOM_MANAGE]
          }
        },
        // 学籍管理路由
        {
          path: '/academic/student-status',
          name: 'StudentStatusManagement',
          component: () => import('@/views/academic/StudentStatusManagement.vue'),
          meta: {
            title: '学籍状态管理',
            requiresAuth: true,
            permissions: [Permission.STUDENT_STATUS_MANAGE]
          }
        },
        {
          path: '/academic/reward-punishment',
          name: 'RewardPunishmentManagement',
          component: () => import('@/views/academic/RewardPunishmentManagement.vue'),
          meta: {
            title: '奖惩记录管理',
            requiresAuth: true,
            permissions: [Permission.REWARD_PUNISHMENT_MANAGE]
          }
        },
        // 教师路由
        {
          path: '/teacher/my-courses',
          name: 'MyCourses',
          component: () => import('@/views/teacher/MyCourses.vue'),
          meta: {
            title: '我的课程',
            requiresAuth: true,
            permissions: [Permission.MY_COURSES_VIEW]
          }
        },
        {
          path: '/teacher/grades',
          name: 'GradeManagement',
          component: () => import('@/views/teacher/GradeManagement.vue'),
          meta: {
            title: '成绩管理',
            requiresAuth: true,
            permissions: [Permission.GRADE_MANAGE]
          }
        },
        // 学生路由
        {
          path: '/student/courses',
          name: 'CourseSelection',
          component: () => import('@/views/student/CourseSelection.vue'),
          meta: {
            title: '选课',
            requiresAuth: true,
            permissions: [Permission.MY_ENROLLMENT_VIEW]
          }
        },
        {
          path: '/student/grades',
          name: 'GradeQuery',
          component: () => import('@/views/student/GradeQuery.vue'),
          meta: {
            title: '成绩查询',
            requiresAuth: true,
            permissions: [Permission.MY_GRADE_VIEW]
          }
        }
      ]
    },
    {
      path: '/403',
      name: 'Forbidden',
      component: () => import('@/views/error/403.vue'),
      meta: {
        title: '无权限访问'
      }
    },
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/views/error/404.vue'),
      meta: {
        title: '页面不存在'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    }
  ]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 教务管理系统`
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth !== false) {
    if (!authStore.token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 如果没有用户信息，尝试获取
    if (!authStore.user) {
      try {
        // 调用获取用户信息的API
        const { authApi } = await import('@/api/modules/auth')
        const response = await authApi.getProfile()
        if (response.code === 0 && response.data) {
          authStore.updateUser(response.data)
        } else {
          throw new Error('获取用户信息失败')
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        authStore.logout()
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }

    // 检查权限
    if (to.meta.permissions && Array.isArray(to.meta.permissions)) {
      const hasPermission = to.meta.permissions.some(permission =>
        authStore.hasPermission(permission)
      )

      if (!hasPermission) {
        next('/403')
        return
      }
    }
  }

  next()
})

export default router
