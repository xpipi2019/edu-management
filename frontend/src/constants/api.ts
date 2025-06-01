// API基础配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 响应状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const

// 业务状态码
export const BUSINESS_CODE = {
  SUCCESS: 0,
  FAIL: 1,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500
} as const

// API端点
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile'
  },

  // 用户管理
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: string | number) => `/users/${id}`,
    DELETE: (id: string | number) => `/users/${id}`,
    DETAIL: (id: string | number) => `/users/${id}`,
    RESET_PASSWORD: (id: string | number) => `/users/${id}/reset-password`,
    BATCH_DELETE: '/users/batch',
    TOGGLE_STATUS: (id: string | number) => `/users/${id}/toggle-status`,
    GET_TEACHER: (userId: string | number) => `/teachers/user/${userId}`,
    GET_STUDENT: (userId: string | number) => `/students/user/${userId}`
  },

  // 角色管理
  ROLES: {
    LIST: '/roles',
    ALL: '/roles/all',
    CREATE: '/roles',
    UPDATE: (id: number) => `/roles/${id}`,
    DELETE: (id: number) => `/roles/${id}`,
    DETAIL: (id: number) => `/roles/${id}`,
    PERMISSIONS: (id: number) => `/roles/${id}/permissions`
  },

  // 权限管理
  PERMISSIONS: {
    LIST: '/permissions',
    ALL: '/permissions/all',
    BY_MODULE: '/permissions/by-module',
    MODULES: '/permissions/modules'
  },

  // 部门管理
  DEPARTMENTS: {
    LIST: '/departments',
    CREATE: '/departments',
    UPDATE: (id: number) => `/departments/${id}`,
    DELETE: (id: number) => `/departments/${id}`,
    TREE: '/departments/tree'
  },

  // 课程管理
  COURSES: {
    LIST: '/courses',
    CREATE: '/courses',
    UPDATE: (id: number) => `/courses/${id}`,
    DELETE: (id: number) => `/courses/${id}`,
    DETAIL: (id: number) => `/courses/${id}`
  },

  // 开课管理
  COURSE_OFFERINGS: {
    LIST: '/course-offerings',
    CREATE: '/course-offerings',
    UPDATE: (id: number) => `/course-offerings/${id}`,
    DELETE: (id: number) => `/course-offerings/${id}`,
    DETAIL: (id: number) => `/course-offerings/${id}`,
    MY_COURSES: '/course-offerings/my-courses'
  },

  // 选课管理
  ENROLLMENTS: {
    LIST: '/enrollments',
    CREATE: '/enrollments',
    DELETE: (id: number) => `/enrollments/${id}`,
    APPROVE: (id: number) => `/enrollments/${id}/approve`,
    REJECT: (id: number) => `/enrollments/${id}/reject`,
    MY_ENROLLMENTS: '/enrollments/my-enrollments'
  },

  // 成绩管理
  GRADES: {
    LIST: '/grades',
    UPDATE: (id: number) => `/grades/${id}`,
    BATCH_UPDATE: '/grades/batch-update',
    MY_GRADES: '/grades/my-grades',
    COURSE_GRADES: (courseOfferingId: number) => `/grades/course-offerings/${courseOfferingId}`
  },

  // 排课管理
  SCHEDULES: {
    LIST: '/schedules',
    CREATE: '/schedules',
    UPDATE: (id: number) => `/schedules/${id}`,
    DELETE: (id: number) => `/schedules/${id}`,
    MY_SCHEDULE: '/schedules/my-schedule',
    CONFLICTS: '/schedules/conflicts'
  },

  // 教室管理
  CLASSROOMS: {
    LIST: '/classrooms',
    ALL: '/classrooms/all',
    CREATE: '/classrooms',
    UPDATE: (id: number) => `/classrooms/${id}`,
    DELETE: (id: number) => `/classrooms/${id}`,
    AVAILABLE: '/classrooms/available'
  },

  // 学籍管理
  STUDENT_STATUS: {
    LIST: '/student-status',
    CREATE: '/student-status',
    UPDATE: (id: number) => `/student-status/${id}`,
    DELETE: (id: number) => `/student-status/${id}`,
    HISTORY: (studentId: number) => `/students/${studentId}/status-history`
  },

  // 奖惩管理
  REWARD_PUNISHMENT: {
    LIST: '/reward-punishments',
    CREATE: '/reward-punishments',
    UPDATE: (id: number) => `/reward-punishments/${id}`,
    DELETE: (id: number) => `/reward-punishments/${id}`,
    STUDENT_RECORDS: (studentId: number) => `/reward-punishments/student/${studentId}`
  }
} as const
