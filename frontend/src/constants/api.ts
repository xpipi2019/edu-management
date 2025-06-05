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
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password'
  },

  // 用户管理
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: string | number) => `/users/${id}`,
    DELETE: (id: string | number) => `/users/${id}`,
    DETAIL: (id: string | number) => `/users/${id}`,
    BATCH_DELETE: '/users/batch-delete',
    RESET_PASSWORD: (id: string | number) => `/users/${id}/reset-password`,
    TOGGLE_STATUS: (id: string | number) => `/users/${id}/toggle-status`,
    ASSIGN_ROLES: (id: string | number) => `/users/${id}/assign-roles`
  },

  // 角色管理
  ROLES: {
    LIST: '/roles',
    ALL: '/roles/all',
    CREATE: '/roles',
    UPDATE: (id: number) => `/roles/${id}`,
    DELETE: (id: number) => `/roles/${id}`,
    DETAIL: (id: number) => `/roles/${id}`,
    PERMISSIONS: (id: number) => `/roles/${id}/permissions`,
    ASSIGN_PERMISSIONS: (id: number) => `/roles/${id}/assign-permissions`
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
    ALL: '/departments/all',
    CREATE: '/departments',
    UPDATE: (id: number) => `/departments/${id}`,
    DELETE: (id: number) => `/departments/${id}`,
    DETAIL: (id: number) => `/departments/${id}`,
    TREE: '/departments/tree'
  },

  // 教师管理
  TEACHERS: {
    LIST: '/teachers',
    CREATE: '/teachers',
    UPDATE: (id: number) => `/teachers/${id}`,
    DELETE: (id: number) => `/teachers/${id}`,
    DETAIL: (id: number) => `/teachers/${id}`,
    BY_USER: (userId: number) => `/teachers/by-user/${userId}`,
    BY_DEPARTMENT: (deptId: number) => `/teachers/by-department/${deptId}`,
    INFO_LIST: '/teachers/info-list' // 使用视图的教师信息列表
  },

  // 学生管理
  STUDENTS: {
    LIST: '/students',
    CREATE: '/students',
    UPDATE: (id: number) => `/students/${id}`,
    DELETE: (id: number) => `/students/${id}`,
    DETAIL: (id: number) => `/students/${id}`,
    BY_USER: (userId: number) => `/students/by-user/${userId}`,
    BY_DEPARTMENT: (deptId: number) => `/students/by-department/${deptId}`,
    BY_CLASS: (className: string) => `/students/by-class/${className}`,
    INFO_LIST: '/students/info-list', // 使用视图的学生信息列表
    TRANSCRIPT: (id: number) => `/students/${id}/transcript`,
    GPA: (id: number) => `/students/${id}/gpa`
  },

  // 课程管理
  COURSES: {
    LIST: '/courses',
    CREATE: '/courses',
    UPDATE: (id: number) => `/courses/${id}`,
    DELETE: (id: number) => `/courses/${id}`,
    DETAIL: (id: number) => `/courses/${id}`,
    BY_DEPARTMENT: (deptId: number) => `/courses/by-department/${deptId}`,
    BY_TYPE: (type: string) => `/courses/by-type/${type}`
  },

  // 开课管理
  COURSE_OFFERINGS: {
    LIST: '/course-offerings',
    CREATE: '/course-offerings',
    UPDATE: (id: number) => `/course-offerings/${id}`,
    DELETE: (id: number) => `/course-offerings/${id}`,
    DETAIL: (id: number) => `/course-offerings/${id}`,
    BY_SEMESTER: (semester: string) => `/course-offerings/by-semester/${semester}`,
    BY_TEACHER: (teacherId: number) => `/course-offerings/by-teacher/${teacherId}`,
    BY_COURSE: (courseId: number) => `/course-offerings/by-course/${courseId}`,
    INFO_LIST: '/course-offerings/info-list', // 使用视图的开课信息列表
    MY_COURSES: '/course-offerings/my-courses' // 教师查看自己的开课
  },

  // 选课管理
  ENROLLMENTS: {
    LIST: '/enrollments',
    CREATE: '/enrollments',
    DELETE: (id: number) => `/enrollments/${id}`,
    UPDATE: (id: number) => `/enrollments/${id}`,
    DETAIL: (id: number) => `/enrollments/${id}`,
    BY_STUDENT: (studentId: number) => `/enrollments/by-student/${studentId}`,
    BY_OFFERING: (offeringId: number) => `/enrollments/by-offering/${offeringId}`,
    MY_ENROLLMENTS: '/enrollments/my-enrollments', // 学生查看自己的选课
    APPROVE: (id: number) => `/enrollments/${id}/approve`,
    REJECT: (id: number) => `/enrollments/${id}/reject`,
    WITHDRAW: (id: number) => `/enrollments/${id}/withdraw`
  },

  // 成绩管理
  GRADES: {
    LIST: '/grades',
    UPDATE: (id: number) => `/grades/${id}`,
    DETAIL: (id: number) => `/grades/${id}`,
    BY_ENROLLMENT: (enrollmentId: number) => `/grades/by-enrollment/${enrollmentId}`,
    BY_STUDENT: (studentId: number) => `/grades/by-student/${studentId}`,
    BY_OFFERING: (offeringId: number) => `/grades/by-offering/${offeringId}`,
    BATCH_UPDATE: '/grades/batch-update',
    MY_GRADES: '/grades/my-grades', // 学生查看自己的成绩
    COURSE_GRADES: (offeringId: number) => `/grades/course-offerings/${offeringId}`, // 教师录入课程成绩
    STUDENT_GRADES: '/grades/student-grades' // 使用视图的学生成绩详情
  },

  // 排课管理
  SCHEDULES: {
    LIST: '/schedules',
    CREATE: '/schedules',
    UPDATE: (id: number) => `/schedules/${id}`,
    DELETE: (id: number) => `/schedules/${id}`,
    DETAIL: (id: number) => `/schedules/${id}`,
    BY_OFFERING: (offeringId: number) => `/schedules/by-offering/${offeringId}`,
    BY_CLASSROOM: (classroomId: number) => `/schedules/by-classroom/${classroomId}`,
    BY_SEMESTER: (semester: string) => `/schedules/by-semester/${semester}`,
    MY_SCHEDULE: '/schedules/my-schedule', // 教师/学生查看自己的课程表
    CONFLICTS: '/schedules/conflicts', // 检查排课冲突
    INFO_LIST: '/schedules/info-list' // 使用视图的排课信息列表
  },

  // 教室管理
  CLASSROOMS: {
    LIST: '/classrooms',
    ALL: '/classrooms/all',
    CREATE: '/classrooms',
    UPDATE: (id: number) => `/classrooms/${id}`,
    DELETE: (id: number) => `/classrooms/${id}`,
    DETAIL: (id: number) => `/classrooms/${id}`,
    BY_BUILDING: (building: string) => `/classrooms/by-building/${building}`,
    BY_TYPE: (type: string) => `/classrooms/by-type/${type}`,
    AVAILABLE: '/classrooms/available' // 查找可用教室
  },

  // 学籍管理
  STUDENT_STATUS: {
    LIST: '/student-status',
    CREATE: '/student-status',
    UPDATE: (id: number) => `/student-status/${id}`,
    DELETE: (id: number) => `/student-status/${id}`,
    DETAIL: (id: number) => `/student-status/${id}`,
    BY_STUDENT: (studentId: number) => `/student-status/by-student/${studentId}`,
    BY_TYPE: (type: string) => `/student-status/by-type/${type}`,
    HISTORY: (studentId: number) => `/students/${studentId}/status-history`,
    CURRENT: (studentId: number) => `/students/${studentId}/current-status`
  },

  // 奖惩管理
  REWARD_PUNISHMENT: {
    LIST: '/reward-punishments',
    CREATE: '/reward-punishments',
    UPDATE: (id: number) => `/reward-punishments/${id}`,
    DELETE: (id: number) => `/reward-punishments/${id}`,
    DETAIL: (id: number) => `/reward-punishments/${id}`,
    BY_STUDENT: (studentId: number) => `/reward-punishments/by-student/${studentId}`,
    BY_TYPE: (type: string) => `/reward-punishments/by-type/${type}`,
    STATISTICS: '/reward-punishments/statistics'
  },

  // 统计报表
  STATISTICS: {
    DASHBOARD: '/statistics/dashboard',
    OVERVIEW: '/statistics/overview',
    ENROLLMENT_STATS: '/statistics/enrollment',
    GRADE_STATS: '/statistics/grades',
    TEACHER_WORKLOAD: '/statistics/teacher-workload',
    DEPARTMENT_STATS: '/statistics/departments',
    STUDENT_DISTRIBUTION: '/statistics/student-distribution'
  },

  // 系统管理
  SYSTEM: {
    BACKUP: '/system/backup',
    RESTORE: '/system/restore',
    LOGS: '/system/logs',
    CONFIG: '/system/config'
  }
} as const

// 常用查询参数
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// 请求超时时间
export const REQUEST_TIMEOUT = 10000

// 文件上传配置
export const UPLOAD_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  CHUNK_SIZE: 1024 * 1024 // 1MB
} as const
