import type { MockMethod } from 'vite-plugin-mock'

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
  // 用户管理权限
  { id: 1, name: '用户管理', code: 'USER_MANAGE', module: 'user', description: '用户管理权限' },
  { id: 2, name: '用户创建', code: 'USER_CREATE', module: 'user', description: '创建用户权限' },
  { id: 3, name: '用户更新', code: 'USER_UPDATE', module: 'user', description: '更新用户权限' },
  { id: 4, name: '用户删除', code: 'USER_DELETE', module: 'user', description: '删除用户权限' },
  { id: 5, name: '用户查看', code: 'USER_VIEW', module: 'user', description: '查看用户权限' },
  { id: 6, name: '用户编辑', code: 'USER_EDIT', module: 'user', description: '编辑用户权限' },

  // 角色管理权限
  { id: 7, name: '角色管理', code: 'ROLE_MANAGE', module: 'role', description: '角色管理权限' },
  { id: 8, name: '角色创建', code: 'ROLE_CREATE', module: 'role', description: '创建角色权限' },
  { id: 9, name: '角色更新', code: 'ROLE_UPDATE', module: 'role', description: '更新角色权限' },
  { id: 10, name: '角色删除', code: 'ROLE_DELETE', module: 'role', description: '删除角色权限' },
  { id: 11, name: '角色查看', code: 'ROLE_VIEW', module: 'role', description: '查看角色权限' },
  { id: 12, name: '角色编辑', code: 'ROLE_EDIT', module: 'role', description: '编辑角色权限' },

  // 课程管理权限
  { id: 13, name: '课程管理', code: 'COURSE_MANAGE', module: 'course', description: '课程管理权限' },
  { id: 14, name: '课程创建', code: 'COURSE_CREATE', module: 'course', description: '创建课程权限' },
  { id: 15, name: '课程更新', code: 'COURSE_UPDATE', module: 'course', description: '更新课程权限' },
  { id: 16, name: '课程删除', code: 'COURSE_DELETE', module: 'course', description: '删除课程权限' },
  { id: 17, name: '课程查看', code: 'COURSE_VIEW', module: 'course', description: '查看课程权限' },
  { id: 18, name: '课程编辑', code: 'COURSE_EDIT', module: 'course', description: '编辑课程权限' },

  // 开课管理权限
  { id: 19, name: '开课管理', code: 'COURSE_OFFERING_MANAGE', module: 'course', description: '开课管理权限' },
  { id: 20, name: '开课创建', code: 'COURSE_OFFERING_CREATE', module: 'course', description: '创建开课权限' },
  { id: 21, name: '开课更新', code: 'COURSE_OFFERING_UPDATE', module: 'course', description: '更新开课权限' },
  { id: 22, name: '开课删除', code: 'COURSE_OFFERING_DELETE', module: 'course', description: '删除开课权限' },
  { id: 23, name: '开课查看', code: 'COURSE_OFFERING_VIEW', module: 'course', description: '查看开课权限' },
  { id: 24, name: '开课编辑', code: 'COURSE_OFFERING_EDIT', module: 'course', description: '编辑开课权限' },

  // 选课管理权限
  { id: 25, name: '选课管理', code: 'ENROLLMENT_MANAGE', module: 'enrollment', description: '选课管理权限' },
  { id: 26, name: '选课审批', code: 'ENROLLMENT_APPROVE', module: 'enrollment', description: '选课审批权限' },
  { id: 27, name: '选课查看', code: 'ENROLLMENT_VIEW', module: 'enrollment', description: '查看选课权限' },
  { id: 28, name: '选课创建', code: 'ENROLLMENT_CREATE', module: 'enrollment', description: '创建选课权限' },
  { id: 29, name: '选课编辑', code: 'ENROLLMENT_EDIT', module: 'enrollment', description: '编辑选课权限' },
  { id: 30, name: '选课删除', code: 'ENROLLMENT_DELETE', module: 'enrollment', description: '删除选课权限' },

  // 成绩管理权限
  { id: 31, name: '成绩管理', code: 'GRADE_MANAGE', module: 'grade', description: '成绩管理权限' },
  { id: 32, name: '成绩录入', code: 'GRADE_INPUT', module: 'grade', description: '成绩录入权限' },
  { id: 33, name: '成绩更新', code: 'GRADE_UPDATE', module: 'grade', description: '成绩更新权限' },
  { id: 34, name: '成绩查看', code: 'GRADE_VIEW', module: 'grade', description: '成绩查看权限' },
  { id: 35, name: '成绩编辑', code: 'GRADE_EDIT', module: 'grade', description: '成绩编辑权限' },

  // 排课管理权限
  { id: 36, name: '排课管理', code: 'SCHEDULE_MANAGE', module: 'schedule', description: '排课管理权限' },
  { id: 37, name: '排课创建', code: 'SCHEDULE_CREATE', module: 'schedule', description: '创建排课权限' },
  { id: 38, name: '排课更新', code: 'SCHEDULE_UPDATE', module: 'schedule', description: '更新排课权限' },
  { id: 39, name: '排课删除', code: 'SCHEDULE_DELETE', module: 'schedule', description: '删除排课权限' },
  { id: 40, name: '排课查看', code: 'SCHEDULE_VIEW', module: 'schedule', description: '查看排课权限' },
  { id: 41, name: '排课编辑', code: 'SCHEDULE_EDIT', module: 'schedule', description: '编辑排课权限' },

  // 学籍管理权限
  { id: 42, name: '学籍管理', code: 'STUDENT_STATUS_MANAGE', module: 'student', description: '学籍管理权限' },
  { id: 43, name: '学籍更新', code: 'STUDENT_STATUS_UPDATE', module: 'student', description: '学籍更新权限' },
  { id: 44, name: '学籍查看', code: 'STUDENT_STATUS_VIEW', module: 'student', description: '学籍查看权限' },

  // 奖惩管理权限
  { id: 45, name: '奖惩管理', code: 'REWARD_PUNISHMENT_MANAGE', module: 'student', description: '奖惩管理权限' },
  { id: 46, name: '奖惩创建', code: 'REWARD_PUNISHMENT_CREATE', module: 'student', description: '创建奖惩权限' },
  { id: 47, name: '奖惩更新', code: 'REWARD_PUNISHMENT_UPDATE', module: 'student', description: '更新奖惩权限' },
  { id: 48, name: '奖惩删除', code: 'REWARD_PUNISHMENT_DELETE', module: 'student', description: '删除奖惩权限' },
  { id: 49, name: '奖惩查看', code: 'REWARD_PUNISHMENT_VIEW', module: 'student', description: '查看奖惩权限' },

  // 系统管理权限
  { id: 50, name: '系统管理', code: 'SYSTEM_MANAGE', module: 'system', description: '系统管理权限' },
  { id: 51, name: '部门管理', code: 'DEPARTMENT_MANAGE', module: 'system', description: '部门管理权限' },
  { id: 52, name: '教室管理', code: 'CLASSROOM_MANAGE', module: 'system', description: '教室管理权限' },
  { id: 53, name: '部门查看', code: 'DEPARTMENT_VIEW', module: 'system', description: '部门查看权限' },
  { id: 54, name: '部门创建', code: 'DEPARTMENT_CREATE', module: 'system', description: '部门创建权限' },
  { id: 55, name: '部门编辑', code: 'DEPARTMENT_EDIT', module: 'system', description: '部门编辑权限' },
  { id: 56, name: '部门删除', code: 'DEPARTMENT_DELETE', module: 'system', description: '部门删除权限' },

  // 教师管理权限
  { id: 57, name: '教师管理', code: 'TEACHER_MANAGE', module: 'teacher', description: '教师管理权限' },
  { id: 58, name: '教师查看', code: 'TEACHER_VIEW', module: 'teacher', description: '教师查看权限' },
  { id: 59, name: '教师创建', code: 'TEACHER_CREATE', module: 'teacher', description: '教师创建权限' },
  { id: 60, name: '教师编辑', code: 'TEACHER_EDIT', module: 'teacher', description: '教师编辑权限' },
  { id: 61, name: '教师删除', code: 'TEACHER_DELETE', module: 'teacher', description: '教师删除权限' },

  // 学生管理权限
  { id: 62, name: '学生管理', code: 'STUDENT_MANAGE', module: 'student', description: '学生管理权限' },
  { id: 63, name: '学生查看', code: 'STUDENT_VIEW', module: 'student', description: '学生查看权限' },
  { id: 64, name: '学生创建', code: 'STUDENT_CREATE', module: 'student', description: '学生创建权限' },
  { id: 65, name: '学生编辑', code: 'STUDENT_EDIT', module: 'student', description: '学生编辑权限' },
  { id: 66, name: '学生删除', code: 'STUDENT_DELETE', module: 'student', description: '学生删除权限' },

  // 教师业务权限
  { id: 67, name: '我的课程查看', code: 'MY_COURSES_VIEW', module: 'course', description: '查看我的课程权限' },
  { id: 68, name: '学生名单查看', code: 'STUDENT_LIST_VIEW', module: 'course', description: '查看学生名单权限' },

  // 学生业务权限
  { id: 69, name: '我的选课查看', code: 'MY_ENROLLMENT_VIEW', module: 'enrollment', description: '查看我的选课权限' },
  { id: 70, name: '我的成绩查看', code: 'MY_GRADE_VIEW', module: 'grade', description: '查看我的成绩权限' }
]

// 模块列表
const mockModules = [
  { code: 'user', name: '用户管理' },
  { code: 'role', name: '角色管理' },
  { code: 'course', name: '课程管理' },
  { code: 'enrollment', name: '选课管理' },
  { code: 'grade', name: '成绩管理' },
  { code: 'schedule', name: '排课管理' },
  { code: 'student', name: '学生管理' },
  { code: 'system', name: '系统管理' },
  { code: 'teacher', name: '教师管理' }
]

export default [
  // 获取权限列表
  {
    url: '/api/permissions',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 20, module = '' } = query

      let filteredPermissions = [...mockPermissions]

      // 按模块筛选
      if (module) {
        filteredPermissions = filteredPermissions.filter(permission =>
          permission.module === module
        )
      }

      // 分页
      const start = (page - 1) * pageSize
      const end = start + parseInt(pageSize)
      const pageData = filteredPermissions.slice(start, end)

      return {
        code: 0,
        message: '获取成功',
        data: {
          list: pageData,
          total: filteredPermissions.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },
  // 获取所有权限
  {
    url: '/api/permissions/all',
    method: 'get',
    response: () => {
      return {
        code: 0,
        message: '获取成功',
        data: mockPermissions
      }
    }
  },
  // 按模块获取权限
  {
    url: '/api/permissions/by-module',
    method: 'get',
    response: () => {
      const permissionsByModule = mockModules.map(module => ({
        module: module.code,
        moduleName: module.name,
        permissions: mockPermissions.filter(p => p.module === module.code)
      }))
      return {
        code: 0,
        message: '获取成功',
        data: permissionsByModule
      }
    }
  },
  // 获取权限模块列表
  {
    url: '/api/permissions/modules',
    method: 'get',
    response: () => {
      return {
        code: 0,
        message: '获取成功',
        data: mockModules
      }
    }
  }
] as MockMethod[]
