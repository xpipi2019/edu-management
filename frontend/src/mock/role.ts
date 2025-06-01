import type { MockMethod } from 'vite-plugin-mock'

// 角色接口
interface Role {
  id: number
  name: string
  code: string
  description: string
  createdAt: string
  updatedAt: string
  permissions: Permission[]
}

// 权限接口
interface Permission {
  id: number
  name: string
  code: string
  module: string
  description: string
}

// Mock权限数据
const mockPermissions: Permission[] = [
  { id: 1, name: '用户管理', code: 'USER_MANAGE', module: 'user', description: '用户管理权限' },
  { id: 2, name: '角色管理', code: 'ROLE_MANAGE', module: 'role', description: '角色管理权限' },
  { id: 3, name: '课程管理', code: 'COURSE_MANAGE', module: 'course', description: '课程管理权限' },
  { id: 4, name: '排课管理', code: 'SCHEDULE_MANAGE', module: 'schedule', description: '排课管理权限' },
  { id: 5, name: '成绩管理', code: 'GRADE_MANAGE', module: 'grade', description: '成绩管理权限' },
  { id: 6, name: '部门管理', code: 'DEPARTMENT_MANAGE', module: 'system', description: '部门管理权限' },
  { id: 7, name: '教师管理', code: 'TEACHER_MANAGE', module: 'teacher', description: '教师管理权限' },
  { id: 8, name: '学生管理', code: 'STUDENT_MANAGE', module: 'student', description: '学生管理权限' }
]

// Mock角色数据
const mockRoles: Role[] = [
  {
    id: 1,
    name: '超级管理员',
    code: 'SUPER_ADMIN',
    description: '系统超级管理员',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    permissions: mockPermissions
  },
  {
    id: 2,
    name: '教务管理员',
    code: 'ACADEMIC_ADMIN',
    description: '教务管理员',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    permissions: mockPermissions.filter(p => ['COURSE_MANAGE', 'SCHEDULE_MANAGE', 'GRADE_MANAGE'].includes(p.code))
  },
  {
    id: 3,
    name: '教师',
    code: 'TEACHER',
    description: '教师',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    permissions: mockPermissions.filter(p => ['GRADE_MANAGE'].includes(p.code))
  },
  {
    id: 4,
    name: '学生',
    code: 'STUDENT',
    description: '学生',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    permissions: []
  }
]

export default [
  // 获取角色列表
  {
    url: '/api/roles',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10, keyword = '', name = '', code = '' } = query

      let filteredRoles = [...mockRoles]

      // 关键词搜索
      if (keyword) {
        filteredRoles = filteredRoles.filter(role =>
          role.name.includes(keyword) ||
          role.code.includes(keyword) ||
          role.description?.includes(keyword)
        )
      }

      // 按角色名搜索
      if (name) {
        filteredRoles = filteredRoles.filter(role =>
          role.name.includes(name)
        )
      }

      // 按角色代码搜索
      if (code) {
        filteredRoles = filteredRoles.filter(role =>
          role.code.includes(code)
        )
      }

      // 分页
      const start = (page - 1) * pageSize
      const end = start + parseInt(pageSize)
      const pageData = filteredRoles.slice(start, end)

      return {
        code: 0,
        message: '获取成功',
        data: {
          list: pageData,
          total: filteredRoles.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },
  // 获取所有角色
  {
    url: '/api/roles/all',
    method: 'get',
    response: () => {
      return {
        code: 0,
        message: '获取成功',
        data: mockRoles
      }
    }
  },
  // 创建角色
  {
    url: '/api/roles',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newRole: Role = {
        id: mockRoles.length + 1,
        name: body.name,
        code: body.code,
        description: body.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: []
      }
      mockRoles.push(newRole)
      return {
        code: 0,
        message: '创建成功',
        data: newRole
      }
    }
  },
  // 更新角色
  {
    url: '/api/roles/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = Number(url.split('/').pop())
      const roleIndex = mockRoles.findIndex(r => r.id === id)
      if (roleIndex === -1) {
        return {
          code: 404,
          message: '角色不存在'
        }
      }
      mockRoles[roleIndex] = {
        ...mockRoles[roleIndex],
        ...body,
        updatedAt: new Date().toISOString()
      }
      return {
        code: 0,
        message: '更新成功',
        data: mockRoles[roleIndex]
      }
    }
  },
  // 删除角色
  {
    url: '/api/roles/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/').pop())
      const roleIndex = mockRoles.findIndex(r => r.id === id)
      if (roleIndex === -1) {
        return {
          code: 404,
          message: '角色不存在'
        }
      }
      mockRoles.splice(roleIndex, 1)
      return {
        code: 0,
        message: '删除成功'
      }
    }
  },
  // 获取角色详情
  {
    url: '/api/roles/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/').pop())
      const role = mockRoles.find(r => r.id === id)
      if (!role) {
        return {
          code: 404,
          message: '角色不存在'
        }
      }
      return {
        code: 0,
        message: '获取成功',
        data: role
      }
    }
  },
  // 获取角色权限
  {
    url: '/api/roles/:id/permissions',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/')[3])
      const role = mockRoles.find(r => r.id === id)
      if (!role) {
        return {
          code: 404,
          message: '角色不存在'
        }
      }
      return {
        code: 0,
        message: '获取成功',
        data: role.permissions
      }
    }
  }
] as MockMethod[]
