import type { MockMethod } from 'vite-plugin-mock'

// 用户状态枚举
enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED'
}

// 简化的Mock用户数据用于认证
const authUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    phone: '13800138001',
    realName: '系统管理员',
    avatar: '',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [
      {
        id: 1,
        name: '超级管理员',
        code: 'SUPER_ADMIN',
        description: '系统超级管理员',
        permissions: [
          { id: 1, name: '用户管理', code: 'USER_MANAGE', module: 'user', description: '用户管理权限' },
          { id: 2, name: '角色管理', code: 'ROLE_MANAGE', module: 'role', description: '角色管理权限' },
          { id: 3, name: '课程管理', code: 'COURSE_MANAGE', module: 'course', description: '课程管理权限' },
          { id: 4, name: '开课管理', code: 'COURSE_OFFERING_MANAGE', module: 'course', description: '开课管理权限' },
          { id: 5, name: '选课管理', code: 'ENROLLMENT_MANAGE', module: 'enrollment', description: '选课管理权限' },
          { id: 6, name: '成绩管理', code: 'GRADE_MANAGE', module: 'grade', description: '成绩管理权限' },
          { id: 7, name: '排课管理', code: 'SCHEDULE_MANAGE', module: 'schedule', description: '排课管理权限' },
          { id: 8, name: '学籍管理', code: 'STUDENT_STATUS_MANAGE', module: 'student', description: '学籍管理权限' },
          { id: 9, name: '奖惩管理', code: 'REWARD_PUNISHMENT_MANAGE', module: 'student', description: '奖惩管理权限' },
          { id: 10, name: '系统管理', code: 'SYSTEM_MANAGE', module: 'system', description: '系统管理权限' },
          { id: 11, name: '部门管理', code: 'DEPARTMENT_MANAGE', module: 'system', description: '部门管理权限' },
          { id: 12, name: '教师管理', code: 'TEACHER_MANAGE', module: 'teacher', description: '教师管理权限' },
          { id: 13, name: '学生管理', code: 'STUDENT_MANAGE', module: 'student', description: '学生管理权限' },
          { id: 52, name: '教室管理', code: 'CLASSROOM_MANAGE', module: 'system', description: '教室管理权限' }
        ]
      }
    ],
    permissions: [
      'USER_MANAGE', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_VIEW', 'USER_EDIT',
      'ROLE_MANAGE', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'ROLE_VIEW', 'ROLE_EDIT',
      'COURSE_MANAGE', 'COURSE_CREATE', 'COURSE_UPDATE', 'COURSE_DELETE', 'COURSE_VIEW', 'COURSE_EDIT',
      'COURSE_OFFERING_MANAGE', 'COURSE_OFFERING_CREATE', 'COURSE_OFFERING_UPDATE', 'COURSE_OFFERING_DELETE', 'COURSE_OFFERING_VIEW', 'COURSE_OFFERING_EDIT',
      'ENROLLMENT_MANAGE', 'ENROLLMENT_APPROVE', 'ENROLLMENT_VIEW', 'ENROLLMENT_CREATE', 'ENROLLMENT_EDIT', 'ENROLLMENT_DELETE',
      'GRADE_MANAGE', 'GRADE_INPUT', 'GRADE_UPDATE', 'GRADE_VIEW', 'GRADE_EDIT',
      'SCHEDULE_MANAGE', 'SCHEDULE_CREATE', 'SCHEDULE_UPDATE', 'SCHEDULE_DELETE', 'SCHEDULE_VIEW', 'SCHEDULE_EDIT',
      'STUDENT_STATUS_MANAGE', 'STUDENT_STATUS_UPDATE', 'STUDENT_STATUS_VIEW',
      'REWARD_PUNISHMENT_MANAGE', 'REWARD_PUNISHMENT_CREATE', 'REWARD_PUNISHMENT_UPDATE', 'REWARD_PUNISHMENT_DELETE', 'REWARD_PUNISHMENT_VIEW',
      'SYSTEM_MANAGE', 'DEPARTMENT_MANAGE', 'CLASSROOM_MANAGE', 'DEPARTMENT_VIEW', 'DEPARTMENT_CREATE', 'DEPARTMENT_EDIT', 'DEPARTMENT_DELETE',
      'TEACHER_MANAGE', 'TEACHER_VIEW', 'TEACHER_CREATE', 'TEACHER_EDIT', 'TEACHER_DELETE',
      'STUDENT_MANAGE', 'STUDENT_VIEW', 'STUDENT_CREATE', 'STUDENT_EDIT', 'STUDENT_DELETE',
      'MY_COURSES_VIEW', 'STUDENT_LIST_VIEW', 'MY_ENROLLMENT_VIEW', 'MY_GRADE_VIEW'
    ]
  },
  {
    id: 2,
    username: 'academic',
    email: 'academic@example.com',
    phone: '13800138002',
    realName: '教务管理员',
    avatar: '',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [
      {
        id: 2,
        name: '教务管理员',
        code: 'ACADEMIC_ADMIN',
        description: '教务管理员',
        permissions: [
          { id: 3, name: '课程管理', code: 'COURSE_MANAGE', module: 'course', description: '课程管理权限' },
          { id: 4, name: '开课管理', code: 'COURSE_OFFERING_MANAGE', module: 'course', description: '开课管理权限' },
          { id: 5, name: '选课管理', code: 'ENROLLMENT_MANAGE', module: 'enrollment', description: '选课管理权限' },
          { id: 6, name: '成绩管理', code: 'GRADE_MANAGE', module: 'grade', description: '成绩管理权限' },
          { id: 7, name: '排课管理', code: 'SCHEDULE_MANAGE', module: 'schedule', description: '排课管理权限' },
          { id: 8, name: '学籍管理', code: 'STUDENT_STATUS_MANAGE', module: 'student', description: '学籍管理权限' },
          { id: 9, name: '奖惩管理', code: 'REWARD_PUNISHMENT_MANAGE', module: 'student', description: '奖惩管理权限' },
          { id: 11, name: '部门管理', code: 'DEPARTMENT_MANAGE', module: 'system', description: '部门管理权限' },
          { id: 12, name: '教师管理', code: 'TEACHER_MANAGE', module: 'teacher', description: '教师管理权限' },
          { id: 13, name: '学生管理', code: 'STUDENT_MANAGE', module: 'student', description: '学生管理权限' },
          { id: 52, name: '教室管理', code: 'CLASSROOM_MANAGE', module: 'system', description: '教室管理权限' }
        ]
      }
    ],
    permissions: [
      'COURSE_MANAGE', 'COURSE_CREATE', 'COURSE_UPDATE', 'COURSE_DELETE', 'COURSE_VIEW', 'COURSE_EDIT',
      'COURSE_OFFERING_MANAGE', 'COURSE_OFFERING_CREATE', 'COURSE_OFFERING_UPDATE', 'COURSE_OFFERING_DELETE', 'COURSE_OFFERING_VIEW', 'COURSE_OFFERING_EDIT',
      'ENROLLMENT_MANAGE', 'ENROLLMENT_APPROVE', 'ENROLLMENT_VIEW', 'ENROLLMENT_CREATE', 'ENROLLMENT_EDIT', 'ENROLLMENT_DELETE',
      'GRADE_MANAGE', 'GRADE_INPUT', 'GRADE_UPDATE', 'GRADE_VIEW', 'GRADE_EDIT',
      'SCHEDULE_MANAGE', 'SCHEDULE_CREATE', 'SCHEDULE_UPDATE', 'SCHEDULE_DELETE', 'SCHEDULE_VIEW', 'SCHEDULE_EDIT',
      'STUDENT_STATUS_MANAGE', 'STUDENT_STATUS_UPDATE', 'STUDENT_STATUS_VIEW',
      'REWARD_PUNISHMENT_MANAGE', 'REWARD_PUNISHMENT_CREATE', 'REWARD_PUNISHMENT_UPDATE', 'REWARD_PUNISHMENT_DELETE', 'REWARD_PUNISHMENT_VIEW',
      'DEPARTMENT_MANAGE', 'CLASSROOM_MANAGE', 'DEPARTMENT_VIEW', 'DEPARTMENT_CREATE', 'DEPARTMENT_EDIT', 'DEPARTMENT_DELETE',
      'TEACHER_MANAGE', 'TEACHER_VIEW', 'TEACHER_CREATE', 'TEACHER_EDIT', 'TEACHER_DELETE',
      'STUDENT_MANAGE', 'STUDENT_VIEW', 'STUDENT_CREATE', 'STUDENT_EDIT', 'STUDENT_DELETE',
      'MY_COURSES_VIEW', 'STUDENT_LIST_VIEW', 'MY_ENROLLMENT_VIEW', 'MY_GRADE_VIEW'
    ]
  },
  {
    id: 3,
    username: 'teacher',
    email: 'teacher@example.com',
    phone: '13800138003',
    realName: '张老师',
    avatar: '',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [
      {
        id: 3,
        name: '教师',
        code: 'TEACHER',
        description: '教师',
        permissions: [
          { id: 15, name: '课程查看', code: 'COURSE_VIEW', module: 'course', description: '查看课程信息权限' },
          { id: 16, name: '开课查看', code: 'COURSE_OFFERING_VIEW', module: 'course', description: '查看开课信息权限' },
          { id: 17, name: '选课查看', code: 'ENROLLMENT_VIEW', module: 'enrollment', description: '查看选课信息权限' },
          { id: 6, name: '成绩管理', code: 'GRADE_MANAGE', module: 'grade', description: '成绩管理权限' },
          { id: 18, name: '成绩录入', code: 'GRADE_INPUT', module: 'grade', description: '录入成绩权限' },
          { id: 19, name: '成绩查看', code: 'GRADE_VIEW', module: 'grade', description: '查看成绩权限' },
          { id: 20, name: '我的课程查看', code: 'MY_COURSES_VIEW', module: 'course', description: '查看我的课程权限' },
          { id: 21, name: '学生名单查看', code: 'STUDENT_LIST_VIEW', module: 'course', description: '查看学生名单权限' }
        ]
      }
    ],
    permissions: [
      'COURSE_VIEW',
      'COURSE_OFFERING_VIEW',
      'ENROLLMENT_VIEW',
      'GRADE_MANAGE', 'GRADE_INPUT', 'GRADE_VIEW', 'GRADE_EDIT',
      'MY_COURSES_VIEW',
      'STUDENT_LIST_VIEW'
    ]
  },
  {
    id: 4,
    username: 'student',
    email: 'student@example.com',
    phone: '13800138004',
    realName: '李同学',
    avatar: '',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [
      {
        id: 4,
        name: '学生',
        code: 'STUDENT',
        description: '学生',
        permissions: [
          { id: 15, name: '课程查看', code: 'COURSE_VIEW', module: 'course', description: '查看课程信息权限' },
          { id: 16, name: '开课查看', code: 'COURSE_OFFERING_VIEW', module: 'course', description: '查看开课信息权限' },
          { id: 17, name: '选课查看', code: 'ENROLLMENT_VIEW', module: 'enrollment', description: '查看选课信息权限' },
          { id: 19, name: '成绩查看', code: 'GRADE_VIEW', module: 'grade', description: '查看成绩权限' },
          { id: 22, name: '我的选课查看', code: 'MY_ENROLLMENT_VIEW', module: 'enrollment', description: '查看我的选课权限' },
          { id: 23, name: '我的成绩查看', code: 'MY_GRADE_VIEW', module: 'grade', description: '查看我的成绩权限' }
        ]
      }
    ],
    permissions: [
      'COURSE_VIEW',
      'COURSE_OFFERING_VIEW',
      'ENROLLMENT_VIEW', 'ENROLLMENT_CREATE',
      'GRADE_VIEW',
      'MY_ENROLLMENT_VIEW',
      'MY_GRADE_VIEW'
    ]
  }
]

export default [
  // 登录接口
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }: any) => {
      const { username, password } = body

      // 简单的用户验证
      const user = authUsers.find(u => u.username === username)

      if (!user || password !== '123456') {
        return {
          code: 401,
          message: '用户名或密码错误',
          data: null
        }
      }

      return {
        code: 0,
        message: '登录成功',
        data: {
          token: `mock-token-${user.id}-${Date.now()}`,
          refreshToken: `mock-refresh-token-${user.id}-${Date.now()}`,
          user
        }
      }
    }
  },

  // 登出接口
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => {
      return {
        code: 0,
        message: '登出成功',
        data: null
      }
    }
  },

  // 获取用户信息接口
  {
    url: '/api/auth/profile',
    method: 'get',
    response: ({ headers }: any) => {
      const authorization = headers.authorization

      if (!authorization || !authorization.startsWith('Bearer ')) {
        return {
          code: 401,
          message: '未授权访问',
          data: null
        }
      }

      // 从token中提取用户ID (模拟)
      const token = authorization.replace('Bearer ', '')
      const userIdMatch = token.match(/mock-token-(\d+)-/)

      if (!userIdMatch) {
        return {
          code: 401,
          message: '无效的token',
          data: null
        }
      }

      const userId = parseInt(userIdMatch[1])
      const user = authUsers.find(u => u.id === userId)

      if (!user) {
        return {
          code: 404,
          message: '用户不存在',
          data: null
        }
      }

      return {
        code: 0,
        message: '获取成功',
        data: user
      }
    }
  },

  // 刷新token接口
  {
    url: '/api/auth/refresh',
    method: 'post',
    response: ({ body }: any) => {
      const { refreshToken } = body

      if (!refreshToken || !refreshToken.startsWith('mock-refresh-token-')) {
        return {
          code: 401,
          message: '无效的刷新token',
          data: null
        }
      }

      // 从refreshToken中提取用户ID
      const userIdMatch = refreshToken.match(/mock-refresh-token-(\d+)-/)

      if (!userIdMatch) {
        return {
          code: 401,
          message: '无效的刷新token',
          data: null
        }
      }

      const userId = parseInt(userIdMatch[1])
      const user = authUsers.find(u => u.id === userId)

      if (!user) {
        return {
          code: 404,
          message: '用户不存在',
          data: null
        }
      }

      return {
        code: 0,
        message: '刷新成功',
        data: {
          token: `mock-token-${user.id}-${Date.now()}`,
          refreshToken: `mock-refresh-token-${user.id}-${Date.now()}`,
          user
        }
      }
    }
  }
] as MockMethod[]
