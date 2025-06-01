import type { MockMethod } from 'vite-plugin-mock'

// 用户状态枚举
enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED'
}

// 用户接口
interface User {
  id: number
  username: string
  email: string
  phone: string
  realName: string
  avatar: string
  status: UserStatus
  createdAt: string
  updatedAt: string
  roles: any[]
  permissions: string[]
}

// 创建用户数据接口
interface CreateUserData {
  username: string
  email: string
  phone: string
  realName: string
}

// 更新用户数据接口
interface UpdateUserData {
  email?: string
  phone?: string
  realName?: string
  status?: UserStatus
}

// 模拟用户数据
const users: User[] = [
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
          { id: 13, name: '学生管理', code: 'STUDENT_MANAGE', module: 'student', description: '学生管理权限' }
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
          { id: 13, name: '学生管理', code: 'STUDENT_MANAGE', module: 'student', description: '学生管理权限' }
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
      'DEPARTMENT_MANAGE', 'DEPARTMENT_VIEW', 'DEPARTMENT_CREATE', 'DEPARTMENT_EDIT', 'DEPARTMENT_DELETE',
      'TEACHER_MANAGE', 'TEACHER_VIEW', 'TEACHER_CREATE', 'TEACHER_EDIT', 'TEACHER_DELETE',
      'STUDENT_MANAGE', 'STUDENT_VIEW', 'STUDENT_CREATE', 'STUDENT_EDIT', 'STUDENT_DELETE',
      'MY_COURSES_VIEW', 'STUDENT_LIST_VIEW'
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
  },
  {
    id: 5,
    username: 'S2024002',
    email: 'student2@example.com',
    phone: '13800138005',
    realName: '王同学',
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
  },
  {
    id: 6,
    username: 'S2024003',
    email: 'student3@example.com',
    phone: '13800138006',
    realName: '张同学',
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
  },
  {
    id: 7,
    username: 'S2024004',
    email: 'student4@example.com',
    phone: '13800138007',
    realName: '赵同学',
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
  // 创建用户
  {
    url: '/api/users',
    method: 'post',
    response: ({ body }: { body: CreateUserData }) => {
      const newUser: User = {
        id: users.length + 1,
        username: body.username,
        email: body.email,
        phone: body.phone,
        realName: body.realName,
        avatar: '',
        status: UserStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roles: [],
        permissions: []
      }
      users.push(newUser)
      return {
        code: 0,
        message: '创建成功',
        data: newUser
      }
    }
  },
  // 获取用户列表
  {
    url: '/api/users',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10, keyword = '', username = '', email = '', status, roleId } = query

      let filteredUsers = [...users]

      // 关键词搜索
      if (keyword) {
        filteredUsers = filteredUsers.filter(user =>
          user.username.includes(keyword) ||
          user.realName.includes(keyword) ||
          user.email.includes(keyword) ||
          user.phone.includes(keyword)
        )
      }

      // 按用户名搜索
      if (username) {
        filteredUsers = filteredUsers.filter(user =>
          user.username.includes(username)
        )
      }

      // 按邮箱搜索
      if (email) {
        filteredUsers = filteredUsers.filter(user =>
          user.email.includes(email)
        )
      }

      // 按状态筛选
      if (status) {
        filteredUsers = filteredUsers.filter(user => user.status === status)
      }

      // 按角色筛选
      if (roleId) {
        filteredUsers = filteredUsers.filter(user =>
          user.roles.some(role => role.id === parseInt(roleId))
        )
      }

      // 分页
      const start = (page - 1) * pageSize
      const end = start + parseInt(pageSize)
      const pageData = filteredUsers.slice(start, end)

      return {
        code: 0,
        message: '获取成功',
        data: {
          list: pageData,
          total: filteredUsers.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },
  // 获取用户详情
  {
    url: '/api/users/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/').pop())
      const user = users.find(u => u.id === id)
      if (!user) {
        return {
          code: 404,
          message: '用户不存在'
        }
      }
      return {
        code: 0,
        message: '获取成功',
        data: user
      }
    }
  },
  // 更新用户
  {
    url: '/api/users/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: UpdateUserData }) => {
      const id = Number(url.split('/').pop())
      const userIndex = users.findIndex(u => u.id === id)
      if (userIndex === -1) {
        return {
          code: 404,
          message: '用户不存在'
        }
      }
      users[userIndex] = {
        ...users[userIndex],
        ...body,
        updatedAt: new Date().toISOString()
      }
      return {
        code: 0,
        message: '更新成功',
        data: users[userIndex]
      }
    }
  },
  // 删除用户
  {
    url: '/api/users/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/').pop())
      const userIndex = users.findIndex(u => u.id === id)
      if (userIndex === -1) {
        return {
          code: 404,
          message: '用户不存在'
        }
      }
      users.splice(userIndex, 1)
      return {
        code: 0,
        message: '删除成功'
      }
    }
  },
  // 重置密码
  {
    url: '/api/users/:id/reset-password',
    method: 'post',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/')[3])
      const user = users.find(u => u.id === id)
      if (!user) {
        return {
          code: 404,
          message: '用户不存在'
        }
      }
      return {
        code: 0,
        message: '密码重置成功',
        data: { password: '123456' }
      }
    }
  },
  // 批量删除用户
  {
    url: '/api/users/batch',
    method: 'delete',
    response: ({ body }: { body: { ids: number[] } }) => {
      const { ids } = body
      const deletedCount = ids.filter(id => {
        const index = users.findIndex(u => u.id === id)
        if (index !== -1) {
          users.splice(index, 1)
          return true
        }
        return false
      }).length
      return {
        code: 0,
        message: `成功删除${deletedCount}个用户`
      }
    }
  },
  // 切换用户状态
  {
    url: '/api/users/:id/toggle-status',
    method: 'post',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/')[3])
      const user = users.find(u => u.id === id)
      if (!user) {
        return {
          code: 404,
          message: '用户不存在'
        }
      }
      user.status = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE
      user.updatedAt = new Date().toISOString()
      return {
        code: 0,
        message: '状态切换成功',
        data: user
      }
    }
  },
  // 获取教师信息
  {
    url: '/api/teachers/user/:userId',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const userId = Number(url.split('/')[4])
      const user = users.find(u => u.id === userId)
      if (!user) {
        return {
          code: 404,
          message: '用户不存在'
        }
      }
      // 构造教师信息
      const teacherInfo = {
        id: userId,
        userId: userId,
        employeeId: 'T' + String(userId).padStart(3, '0'),
        realName: user.realName,
        department: '计算机学院',
        title: '讲师',
        phone: user.phone,
        email: user.email
      }
      return {
        code: 0,
        message: '获取成功',
        data: teacherInfo
      }
    }
  },
  // 获取学生信息
  {
    url: '/api/students/user/:userId',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const userId = Number(url.split('/')[4])
      const user = users.find(u => u.id === userId)
      if (!user) {
        return {
          code: 404,
          message: '用户不存在'
        }
      }
      // 构造学生信息
      const studentInfo = {
        id: userId,
        userId: userId,
        studentId: 'S' + String(userId).padStart(3, '0'),
        realName: user.realName,
        className: '计算机2024-1班',
        major: '计算机科学与技术',
        grade: '2024',
        phone: user.phone,
        email: user.email,
        enrollmentDate: '2024-09-01'
      }
      return {
        code: 0,
        message: '获取成功',
        data: studentInfo
      }
    }
  }
] as MockMethod[]
