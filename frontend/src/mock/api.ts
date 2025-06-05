import type {
  ApiResponse, PageResponse, PageQuery
} from '../types/common'
import type {
  User, Role, Permission, Department, Teacher, Student, Course, CourseOffering,
  Enrollment, Grade, RewardPunishment, StudentStatus, Classroom, Schedule,
  CreateUserData, UpdateUserData, CreateTeacherData, UpdateTeacherData,
  CreateStudentData, UpdateStudentData, CreateCourseData, UpdateCourseData,
  CreateCourseOfferingData, UpdateCourseOfferingData, CreateEnrollmentData,
  UpdateGradeData, CreateScheduleData, UpdateScheduleData, CreateClassroomData,
  UpdateClassroomData, CreateRewardPunishmentData, UpdateRewardPunishmentData,
  CreateStudentStatusData, UpdateStudentStatusData, CreateRoleData, UpdateRoleData,
  CreateDepartmentData, UpdateDepartmentData, UserQuery, TeacherQuery, StudentQuery,
  CourseQuery, CourseOfferingQuery, EnrollmentQuery, GradeQuery, ScheduleQuery,
  ClassroomQuery, RewardPunishmentQuery, StudentStatusQuery, LoginForm, LoginResponse,
  BatchOperationData, ResetPasswordData, ToggleStatusData, StudentTranscript, StudentGPA,
  StudentInfo, TeacherInfo, CourseOfferingInfo, StudentGrade, ScheduleInfo,
  CourseType, ClassroomType
} from '../types/database'
import {
  CourseStatus, OfferingStatus, EnrollmentStatus, ClassroomStatus,
  RewardPunishmentType, StudentStatusType
} from '../types/database'

import { mockDatabase } from './database'

// 分页查询工具函数
function paginate<T>(
  data: T[],
  query: PageQuery = {}
): PageResponse<T> {
  const { page = 1, pageSize = 20 } = query
  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    list: data.slice(start, end),
    total: data.length,
    page,
    pageSize
  }
}

// 过滤工具函数
function filterData<T>(data: T[], filters: Record<string, any>): T[] {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true

      const itemValue = (item as any)[key]
      if (typeof value === 'string' && typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase())
      }
      return itemValue === value
    })
  })
}

// ========================================
// 认证API
// ========================================
export const authApi = {
  login(data: LoginForm): ApiResponse<LoginResponse | null> {
    const user = mockDatabase.users.find(u => u.username === data.username)
    if (!user) {
      return {
        code: 1,
        message: '用户名或密码错误',
        data: null
      }
    }

    // 模拟密码验证（实际应用中应该验证加密后的密码）
    if (data.password !== '123456') {
      return {
        code: 1,
        message: '用户名或密码错误',
        data: null
      }
    }

    return {
      code: 0,
      message: '登录成功',
      data: {
        token: 'mock-jwt-token-' + user.user_id,
        refresh_token: 'mock-refresh-token-' + user.user_id,
        user
      }
    }
  },

  logout(): ApiResponse<null> {
    return {
      code: 0,
      message: '退出成功',
      data: null
    }
  },

  getProfile(): ApiResponse<User> {
    // 返回当前登录用户信息（这里返回管理员）
    return {
      code: 0,
      message: '获取成功',
      data: mockDatabase.users[0]
    }
  },

  changePassword(data: { oldPassword: string; newPassword: string }): ApiResponse<null> {
    return {
      code: 0,
      message: '密码修改成功',
      data: null
    }
  }
}

// ========================================
// 用户管理API
// ========================================
export const userApi = {
  getList(query: UserQuery): ApiResponse<PageResponse<User>> {
    let filteredData = filterData(mockDatabase.users, {
      username: query.username,
      real_name: query.real_name,
      email: query.email,
      status: query.status
    })

    // 按角色过滤
    if (query.role_code) {
      filteredData = filteredData.filter(user =>
        user.roles?.some(role => role.role_code === query.role_code)
      )
    }

    return {
      code: 0,
      message: '获取成功',
      data: paginate(filteredData, query)
    }
  },

  create(data: CreateUserData): ApiResponse<User> {
    const newUser: User = {
      user_id: mockDatabase.users.length + 1,
      username: data.username,
      real_name: data.real_name,
      email: data.email,
      phone: data.phone,
      status: data.status || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      roles: data.role_ids ? mockDatabase.roles.filter(r => data.role_ids!.includes(r.role_id)) : []
    }

    mockDatabase.users.push(newUser)

    return {
      code: 0,
      message: '创建成功',
      data: newUser
    }
  },

  update(id: number, data: UpdateUserData): ApiResponse<User | null> {
    const index = mockDatabase.users.findIndex(u => u.user_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '用户不存在',
        data: null
      }
    }

    const updatedUser = {
      ...mockDatabase.users[index],
      ...data,
      updated_at: new Date().toISOString(),
      roles: data.role_ids ? mockDatabase.roles.filter(r => data.role_ids!.includes(r.role_id)) : mockDatabase.users[index].roles
    }

    mockDatabase.users[index] = updatedUser

    return {
      code: 0,
      message: '更新成功',
      data: updatedUser
    }
  },

  delete(id: number): ApiResponse<null> {
    const index = mockDatabase.users.findIndex(u => u.user_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '用户不存在',
        data: null
      }
    }

    mockDatabase.users.splice(index, 1)

    return {
      code: 0,
      message: '删除成功',
      data: null
    }
  },

  getDetail(id: number): ApiResponse<User | null> {
    const user = mockDatabase.users.find(u => u.user_id === id)
    if (!user) {
      return {
        code: 1,
        message: '用户不存在',
        data: null
      }
    }

    return {
      code: 0,
      message: '获取成功',
      data: user
    }
  },

  batchDelete(data: BatchOperationData): ApiResponse<null> {
    data.ids.forEach(id => {
      const index = mockDatabase.users.findIndex(u => u.user_id === id)
      if (index !== -1) {
        mockDatabase.users.splice(index, 1)
      }
    })

    return {
      code: 0,
      message: '批量删除成功',
      data: null
    }
  },

  resetPassword(id: number, data: ResetPasswordData): ApiResponse<null> {
    const user = mockDatabase.users.find(u => u.user_id === id)
    if (!user) {
      return {
        code: 1,
        message: '用户不存在',
        data: null
      }
    }

    return {
      code: 0,
      message: '密码重置成功',
      data: null
    }
  },

  toggleStatus(id: number, data: ToggleStatusData): ApiResponse<User | null> {
    const user = mockDatabase.users.find(u => u.user_id === id)
    if (!user) {
      return {
        code: 1,
        message: '用户不存在',
        data: null
      }
    }

    user.status = data.status
    user.updated_at = new Date().toISOString()

    return {
      code: 0,
      message: '状态更新成功',
      data: user
    }
  }
}

// ========================================
// 角色管理API
// ========================================
export const roleApi = {
  getList(query: PageQuery): ApiResponse<PageResponse<Role>> {
    return {
      code: 0,
      message: '获取成功',
      data: paginate(mockDatabase.roles, query)
    }
  },

  getAll(): ApiResponse<Role[]> {
    return {
      code: 0,
      message: '获取成功',
      data: mockDatabase.roles
    }
  },

  create(data: CreateRoleData): ApiResponse<Role> {
    const newRole: Role = {
      role_id: mockDatabase.roles.length + 1,
      role_name: data.role_name,
      role_code: data.role_code,
      description: data.description,
      status: data.status || 1,
      created_at: new Date().toISOString(),
      permissions: data.permission_ids ? mockDatabase.permissions.filter(p => data.permission_ids!.includes(p.permission_id)) : []
    }

    mockDatabase.roles.push(newRole)

    return {
      code: 0,
      message: '创建成功',
      data: newRole
    }
  },

  update(id: number, data: UpdateRoleData): ApiResponse<Role | null> {
    const index = mockDatabase.roles.findIndex(r => r.role_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '角色不存在',
        data: null
      }
    }

    const updatedRole = {
      ...mockDatabase.roles[index],
      ...data,
      permissions: data.permission_ids ? mockDatabase.permissions.filter(p => data.permission_ids!.includes(p.permission_id)) : mockDatabase.roles[index].permissions
    }

    mockDatabase.roles[index] = updatedRole

    return {
      code: 0,
      message: '更新成功',
      data: updatedRole
    }
  },

  delete(id: number): ApiResponse<null> {
    const index = mockDatabase.roles.findIndex(r => r.role_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '角色不存在',
        data: null
      }
    }

    mockDatabase.roles.splice(index, 1)

    return {
      code: 0,
      message: '删除成功',
      data: null
    }
  },

  getDetail(id: number): ApiResponse<Role | null> {
    const role = mockDatabase.roles.find(r => r.role_id === id)
    if (!role) {
      return {
        code: 1,
        message: '角色不存在',
        data: null
      }
    }

    return {
      code: 0,
      message: '获取成功',
      data: role
    }
  },

  assignPermissions(id: number, permissionIds: number[]): ApiResponse<null> {
    const roleIndex = mockDatabase.roles.findIndex(r => r.role_id === id)
    if (roleIndex === -1) {
      return {
        code: 1,
        message: '角色不存在',
        data: null
      }
    }

    // 根据权限ID获取权限对象
    const permissions = mockDatabase.permissions.filter(p => permissionIds.includes(p.permission_id))

    // 更新角色的权限
    mockDatabase.roles[roleIndex].permissions = permissions

    return {
      code: 0,
      message: '权限分配成功',
      data: null
    }
  }
}

// ========================================
// 权限管理API
// ========================================
export const permissionApi = {
  getList(): ApiResponse<Permission[]> {
    return {
      code: 0,
      message: '获取成功',
      data: mockDatabase.permissions
    }
  },

  getAll(): ApiResponse<Permission[]> {
    return {
      code: 0,
      message: '获取成功',
      data: mockDatabase.permissions
    }
  },

  getByModule(): ApiResponse<Record<string, Permission[]>> {
    const moduleGroups = mockDatabase.permissions.reduce((groups, permission) => {
      const module = permission.module
      if (!groups[module]) {
        groups[module] = []
      }
      groups[module].push(permission)
      return groups
    }, {} as Record<string, Permission[]>)

    return {
      code: 0,
      message: '获取成功',
      data: moduleGroups
    }
  }
}

// ========================================
// 部门管理API
// ========================================
export const departmentApi = {
  getList(query: PageQuery): ApiResponse<PageResponse<Department>> {
    return {
      code: 0,
      message: '获取成功',
      data: paginate(mockDatabase.departments, query)
    }
  },

  getAll(): ApiResponse<Department[]> {
    return {
      code: 0,
      message: '获取成功',
      data: mockDatabase.departments
    }
  },

  getTree(): ApiResponse<Department[]> {
    // 构建树形结构
    const tree = mockDatabase.departments
      .filter(dept => !dept.parent_id)
      .map(dept => ({
        ...dept,
        children: mockDatabase.departments.filter(child => child.parent_id === dept.dept_id)
      }))

    return {
      code: 0,
      message: '获取成功',
      data: tree
    }
  },

  create(data: CreateDepartmentData): ApiResponse<Department> {
    const newDept: Department = {
      dept_id: mockDatabase.departments.length + 1,
      dept_name: data.dept_name,
      dept_code: data.dept_code,
      parent_id: data.parent_id,
      description: data.description,
      status: data.status || 1
    }

    mockDatabase.departments.push(newDept)

    return {
      code: 0,
      message: '创建成功',
      data: newDept
    }
  },

  update(id: number, data: UpdateDepartmentData): ApiResponse<Department | null> {
    const index = mockDatabase.departments.findIndex(d => d.dept_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '部门不存在',
        data: null
      }
    }

    const updatedDept = {
      ...mockDatabase.departments[index],
      ...data
    }

    mockDatabase.departments[index] = updatedDept

    return {
      code: 0,
      message: '更新成功',
      data: updatedDept
    }
  },

  delete(id: number): ApiResponse<null> {
    const index = mockDatabase.departments.findIndex(d => d.dept_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '部门不存在',
        data: null
      }
    }

    // 检查是否有子部门
    const hasChildren = mockDatabase.departments.some(d => d.parent_id === id)
    if (hasChildren) {
      return {
        code: 1,
        message: '该部门下有子部门，无法删除',
        data: null
      }
    }

    mockDatabase.departments.splice(index, 1)

    return {
      code: 0,
      message: '删除成功',
      data: null
    }
  }
}

// ========================================
// 教师管理API
// ========================================
export const teacherApi = {
  getList(query: TeacherQuery): ApiResponse<PageResponse<Teacher>> {
    const filteredData = filterData(mockDatabase.teachers, {
      teacher_no: query.teacher_no,
      dept_id: query.dept_id,
      title: query.title,
      status: query.status
    }).filter(teacher => {
      if (query.real_name && teacher.user?.real_name) {
        return teacher.user.real_name.toLowerCase().includes(query.real_name.toLowerCase())
      }
      return true
    })

    return {
      code: 0,
      message: '获取成功',
      data: paginate(filteredData, query)
    }
  },

  getInfoList(query: TeacherQuery): ApiResponse<PageResponse<TeacherInfo>> {
    const filteredData = filterData(mockDatabase.teacherInfos, {
      teacher_no: query.teacher_no,
      title: query.title
    }).filter(info => {
      if (query.real_name) {
        return info.real_name.toLowerCase().includes(query.real_name.toLowerCase())
      }
      return true
    })

    return {
      code: 0,
      message: '获取成功',
      data: paginate(filteredData, query)
    }
  },

  getByUser(userId: number): ApiResponse<Teacher | null> {
    const teacher = mockDatabase.teachers.find(t => t.user_id === userId)

    return {
      code: 0,
      message: '获取成功',
      data: teacher || null
    }
  },

  getByDepartment(deptId: number): ApiResponse<Teacher[]> {
    const teachers = mockDatabase.teachers.filter(t => t.dept_id === deptId)

    return {
      code: 0,
      message: '获取成功',
      data: teachers
    }
  },

  create(data: CreateTeacherData): ApiResponse<Teacher> {
    // 先创建用户
    const newUser: User = {
      user_id: mockDatabase.users.length + 1,
      username: data.user_data.username,
      real_name: data.user_data.real_name,
      email: data.user_data.email,
      phone: data.user_data.phone,
      status: data.user_data.status || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      roles: []
    }

    mockDatabase.users.push(newUser)

    // 再创建教师
    const newTeacher: Teacher = {
      teacher_id: mockDatabase.teachers.length + 1,
      user_id: newUser.user_id,
      teacher_no: data.teacher_no,
      dept_id: data.dept_id,
      title: data.title,
      hire_date: data.hire_date,
      status: data.status || 1,
      user: newUser,
      department: data.dept_id ? mockDatabase.departments.find(d => d.dept_id === data.dept_id) : undefined
    }

    mockDatabase.teachers.push(newTeacher)

    return {
      code: 0,
      message: '创建成功',
      data: newTeacher
    }
  },

  update(id: number, data: UpdateTeacherData): ApiResponse<Teacher | null> {
    const index = mockDatabase.teachers.findIndex(t => t.teacher_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '教师不存在',
        data: null
      }
    }

    const teacher = mockDatabase.teachers[index]

    // 更新用户信息
    if (data.user_data && teacher.user) {
      const userIndex = mockDatabase.users.findIndex(u => u.user_id === teacher.user_id)
      if (userIndex !== -1) {
        mockDatabase.users[userIndex] = {
          ...mockDatabase.users[userIndex],
          ...data.user_data,
          updated_at: new Date().toISOString()
        }
      }
    }

    // 更新教师信息
    const updatedTeacher = {
      ...teacher,
      teacher_no: data.teacher_no || teacher.teacher_no,
      dept_id: data.dept_id || teacher.dept_id,
      title: data.title || teacher.title,
      hire_date: data.hire_date || teacher.hire_date,
      status: data.status !== undefined ? data.status : teacher.status,
      department: data.dept_id ? mockDatabase.departments.find(d => d.dept_id === data.dept_id) : teacher.department
    }

    mockDatabase.teachers[index] = updatedTeacher

    return {
      code: 0,
      message: '更新成功',
      data: updatedTeacher
    }
  },

  delete(id: number): ApiResponse<null> {
    const index = mockDatabase.teachers.findIndex(t => t.teacher_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '教师不存在',
        data: null
      }
    }

    const teacher = mockDatabase.teachers[index]

    // 同时删除用户记录
    const userIndex = mockDatabase.users.findIndex(u => u.user_id === teacher.user_id)
    if (userIndex !== -1) {
      mockDatabase.users.splice(userIndex, 1)
    }

    mockDatabase.teachers.splice(index, 1)

    return {
      code: 0,
      message: '删除成功',
      data: null
    }
  },

  getDetail(id: number): ApiResponse<Teacher | null> {
    const teacher = mockDatabase.teachers.find(t => t.teacher_id === id)
    if (!teacher) {
      return {
        code: 1,
        message: '教师不存在',
        data: null
      }
    }

    return {
      code: 0,
      message: '获取成功',
      data: teacher
    }
  }
}

// ========================================
// 学生管理API
// ========================================
export const studentApi = {
  getList(query: StudentQuery): ApiResponse<PageResponse<Student>> {
    const filteredData = filterData(mockDatabase.students, {
      student_no: query.student_no,
      dept_id: query.dept_id,
      class_name: query.class_name,
      grade: query.grade,
      enrollment_year: query.enrollment_year
    }).filter(student => {
      if (query.real_name && student.user?.real_name) {
        return student.user.real_name.toLowerCase().includes(query.real_name.toLowerCase())
      }
      return true
    })

    return {
      code: 0,
      message: '获取成功',
      data: paginate(filteredData, query)
    }
  },

  getInfoList(query: StudentQuery): ApiResponse<PageResponse<StudentInfo>> {
    const filteredData = filterData(mockDatabase.studentInfos, {
      student_no: query.student_no,
      class_name: query.class_name,
      grade: query.grade,
      enrollment_year: query.enrollment_year
    }).filter(info => {
      if (query.real_name) {
        return info.real_name.toLowerCase().includes(query.real_name.toLowerCase())
      }
      return true
    })

    return {
      code: 0,
      message: '获取成功',
      data: paginate(filteredData, query)
    }
  },

  getByUser(userId: number): ApiResponse<Student | null> {
    const student = mockDatabase.students.find(s => s.user_id === userId)

    return {
      code: 0,
      message: '获取成功',
      data: student || null
    }
  },

  getByDepartment(deptId: number): ApiResponse<Student[]> {
    const students = mockDatabase.students.filter(s => s.dept_id === deptId)

    return {
      code: 0,
      message: '获取成功',
      data: students
    }
  },

  getByClass(className: string): ApiResponse<Student[]> {
    const students = mockDatabase.students.filter(s => s.class_name === className)

    return {
      code: 0,
      message: '获取成功',
      data: students
    }
  },

  create(data: CreateStudentData): ApiResponse<Student> {
    // 先创建用户
    const newUser: User = {
      user_id: mockDatabase.users.length + 1,
      username: data.user_data.username,
      real_name: data.user_data.real_name,
      email: data.user_data.email,
      phone: data.user_data.phone,
      status: data.user_data.status || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      roles: []
    }

    mockDatabase.users.push(newUser)

    // 再创建学生
    const newStudent: Student = {
      student_id: mockDatabase.students.length + 1,
      user_id: newUser.user_id,
      student_no: data.student_no,
      dept_id: data.dept_id,
      class_name: data.class_name,
      grade: data.grade,
      enrollment_year: data.enrollment_year,
      user: newUser,
      department: data.dept_id ? mockDatabase.departments.find(d => d.dept_id === data.dept_id) : undefined
    }

    mockDatabase.students.push(newStudent)

    return {
      code: 0,
      message: '创建成功',
      data: newStudent
    }
  },

  update(id: number, data: UpdateStudentData): ApiResponse<Student | null> {
    const index = mockDatabase.students.findIndex(s => s.student_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '学生不存在',
        data: null
      }
    }

    const student = mockDatabase.students[index]

    // 更新用户信息
    if (data.user_data && student.user) {
      const userIndex = mockDatabase.users.findIndex(u => u.user_id === student.user_id)
      if (userIndex !== -1) {
        mockDatabase.users[userIndex] = {
          ...mockDatabase.users[userIndex],
          ...data.user_data,
          updated_at: new Date().toISOString()
        }
      }
    }

    // 更新学生信息
    const updatedStudent = {
      ...student,
      student_no: data.student_no || student.student_no,
      dept_id: data.dept_id || student.dept_id,
      class_name: data.class_name || student.class_name,
      grade: data.grade || student.grade,
      enrollment_year: data.enrollment_year || student.enrollment_year,
      department: data.dept_id ? mockDatabase.departments.find(d => d.dept_id === data.dept_id) : student.department
    }

    mockDatabase.students[index] = updatedStudent

    return {
      code: 0,
      message: '更新成功',
      data: updatedStudent
    }
  },

  delete(id: number): ApiResponse<null> {
    const index = mockDatabase.students.findIndex(s => s.student_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '学生不存在',
        data: null
      }
    }

    const student = mockDatabase.students[index]

    // 同时删除用户记录
    const userIndex = mockDatabase.users.findIndex(u => u.user_id === student.user_id)
    if (userIndex !== -1) {
      mockDatabase.users.splice(userIndex, 1)
    }

    mockDatabase.students.splice(index, 1)

    return {
      code: 0,
      message: '删除成功',
      data: null
    }
  },

  getDetail(id: number): ApiResponse<Student | null> {
    const student = mockDatabase.students.find(s => s.student_id === id)
    if (!student) {
      return {
        code: 1,
        message: '学生不存在',
        data: null
      }
    }

    return {
      code: 0,
      message: '获取成功',
      data: student
    }
  },

  getTranscript(id: number): ApiResponse<StudentTranscript | null> {
    const student = mockDatabase.students.find(s => s.student_id === id)
    if (!student) {
      return {
        code: 1,
        message: '学生不存在',
        data: null
      }
    }

    const studentInfo = mockDatabase.studentInfos.find(info => info.student_id === id)
    const grades = mockDatabase.studentGrades.filter(grade => grade.student_no === student.student_no)

    // 计算GPA和总学分
    let totalCredits = 0
    let totalGradePoints = 0

    grades.forEach(grade => {
      if (grade.grade_point && grade.final_score && grade.final_score >= 60) {
        totalCredits += grade.credits
        totalGradePoints += grade.grade_point * grade.credits
      }
    })

    const gpa = totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0

    return {
      code: 0,
      message: '获取成功',
      data: {
        student_info: studentInfo!,
        grades,
        gpa,
        total_credits: totalCredits
      }
    }
  },

  getGPA(id: number): ApiResponse<StudentGPA | null> {
    const student = mockDatabase.students.find(s => s.student_id === id)
    if (!student) {
      return {
        code: 1,
        message: '学生不存在',
        data: null
      }
    }

    const grades = mockDatabase.studentGrades.filter(grade =>
      grade.student_no === student.student_no &&
      grade.final_score &&
      grade.final_score >= 60
    )

    let totalCredits = 0
    let totalGradePoints = 0

    grades.forEach(grade => {
      if (grade.grade_point) {
        totalCredits += grade.credits
        totalGradePoints += grade.grade_point * grade.credits
      }
    })

    const gpa = totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0

    return {
      code: 0,
      message: '获取成功',
      data: {
        student_no: student.student_no,
        student_name: student.user?.real_name || '',
        gpa,
        total_credits: totalCredits,
        course_count: grades.length
      }
    }
  }
}

// ========================================
// 课程管理API
// ========================================
export const courseApi = {
  getList(query: CourseQuery): ApiResponse<PageResponse<Course>> {
    const filteredData = filterData(mockDatabase.courses, {
      course_name: query.course_name,
      course_code: query.course_code,
      course_type: query.course_type,
      status: query.status
    })

    return {
      code: 0,
      message: '获取成功',
      data: paginate(filteredData, query)
    }
  },

  getAll(): ApiResponse<Course[]> {
    return {
      code: 0,
      message: '获取成功',
      data: mockDatabase.courses
    }
  },

  getByDepartment(deptId: number): ApiResponse<Course[]> {
    // 根据部门筛选课程（通过课程的开课信息中的教师部门）
    const courses = mockDatabase.courses.filter(course => {
      const offerings = mockDatabase.courseOfferings.filter(o => o.course_id === course.course_id)
      return offerings.some(offering => {
        const teacher = mockDatabase.teachers.find(t => t.teacher_id === offering.teacher_id)
        return teacher?.dept_id === deptId
      })
    })

    return {
      code: 0,
      message: '获取成功',
      data: courses
    }
  },

  getByType(type: string): ApiResponse<Course[]> {
    const courses = mockDatabase.courses.filter(course => course.course_type === type)

    return {
      code: 0,
      message: '获取成功',
      data: courses
    }
  },

  create(data: CreateCourseData): ApiResponse<Course> {
    const newCourse: Course = {
      course_id: mockDatabase.courses.length + 1,
      course_name: data.course_name,
      course_code: data.course_code,
      credits: data.credits,
      hours: data.hours,
      course_type: data.course_type,
      description: data.description,
      status: data.status || CourseStatus.ACTIVE
    }

    mockDatabase.courses.push(newCourse)

    return {
      code: 0,
      message: '创建成功',
      data: newCourse
    }
  },

  update(id: number, data: UpdateCourseData): ApiResponse<Course | null> {
    const index = mockDatabase.courses.findIndex(c => c.course_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '课程不存在',
        data: null
      }
    }

    const updatedCourse = {
      ...mockDatabase.courses[index],
      ...data
    }

    mockDatabase.courses[index] = updatedCourse

    return {
      code: 0,
      message: '更新成功',
      data: updatedCourse
    }
  },

  delete(id: number): ApiResponse<null> {
    const index = mockDatabase.courses.findIndex(c => c.course_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '课程不存在',
        data: null
      }
    }

    mockDatabase.courses.splice(index, 1)

    return {
      code: 0,
      message: '删除成功',
      data: null
    }
  },

  getDetail(id: number): ApiResponse<Course | null> {
    const course = mockDatabase.courses.find(c => c.course_id === id)
    if (!course) {
      return {
        code: 1,
        message: '课程不存在',
        data: null
      }
    }

    return {
      code: 0,
      message: '获取成功',
      data: course
    }
  }
}

// ========================================
// 开课管理API
// ========================================
export const courseOfferingApi = {
  getList(query: CourseOfferingQuery): ApiResponse<PageResponse<CourseOffering>> {
    const filteredData = filterData(mockDatabase.courseOfferings, {
      course_id: query.course_id,
      teacher_id: query.teacher_id,
      semester: query.semester,
      status: query.status
    })

    return {
      code: 0,
      message: '获取成功',
      data: paginate(filteredData, query)
    }
  },

  getInfoList(query: CourseOfferingQuery): ApiResponse<PageResponse<CourseOfferingInfo>> {
    const filteredData = filterData(mockDatabase.courseOfferingInfos, {
      semester: query.semester
    })

    return {
      code: 0,
      message: '获取成功',
      data: paginate(filteredData, query)
    }
  },

  getBySemester(semester: string): ApiResponse<CourseOffering[]> {
    const offerings = mockDatabase.courseOfferings.filter(o => o.semester === semester)

    return {
      code: 0,
      message: '获取成功',
      data: offerings
    }
  },

  getByTeacher(teacherId: number): ApiResponse<CourseOffering[]> {
    const offerings = mockDatabase.courseOfferings.filter(o => o.teacher_id === teacherId)

    return {
      code: 0,
      message: '获取成功',
      data: offerings
    }
  },

  getByCourse(courseId: number): ApiResponse<CourseOffering[]> {
    const offerings = mockDatabase.courseOfferings.filter(o => o.course_id === courseId)

    return {
      code: 0,
      message: '获取成功',
      data: offerings
    }
  },

  getMyCourses(): ApiResponse<CourseOfferingInfo[]> {
    // 模拟返回当前登录教师的开课（这里返回所有开课信息作为示例）
    return {
      code: 0,
      message: '获取成功',
      data: mockDatabase.courseOfferingInfos
    }
  },

  create(data: CreateCourseOfferingData): ApiResponse<CourseOffering> {
    const newOffering: CourseOffering = {
      offering_id: mockDatabase.courseOfferings.length + 1,
      course_id: data.course_id,
      teacher_id: data.teacher_id,
      semester: data.semester,
      max_students: data.max_students || 50,
      current_students: 0,
      status: data.status || OfferingStatus.ACTIVE,
      course: mockDatabase.courses.find(c => c.course_id === data.course_id),
      teacher: mockDatabase.teachers.find(t => t.teacher_id === data.teacher_id)
    }

    mockDatabase.courseOfferings.push(newOffering)

    return {
      code: 0,
      message: '创建成功',
      data: newOffering
    }
  },

  update(id: number, data: UpdateCourseOfferingData): ApiResponse<CourseOffering | null> {
    const index = mockDatabase.courseOfferings.findIndex(o => o.offering_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '开课记录不存在',
        data: null
      }
    }

    const updatedOffering = {
      ...mockDatabase.courseOfferings[index],
      ...data
    }

    mockDatabase.courseOfferings[index] = updatedOffering

    return {
      code: 0,
      message: '更新成功',
      data: updatedOffering
    }
  },

  delete(id: number): ApiResponse<null> {
    const index = mockDatabase.courseOfferings.findIndex(o => o.offering_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '开课记录不存在',
        data: null
      }
    }

    mockDatabase.courseOfferings.splice(index, 1)

    return {
      code: 0,
      message: '删除成功',
      data: null
    }
  },

  getDetail(id: number): ApiResponse<CourseOffering | null> {
    const offering = mockDatabase.courseOfferings.find(o => o.offering_id === id)
    if (!offering) {
      return {
        code: 1,
        message: '开课记录不存在',
        data: null
      }
    }

    return {
      code: 0,
      message: '获取成功',
      data: offering
    }
  }
}

// ========================================
// 选课管理API
// ========================================
export const enrollmentApi = {
  getList(query: EnrollmentQuery): ApiResponse<PageResponse<Enrollment>> {
    const filteredData = filterData(mockDatabase.enrollments, {
      student_id: query.student_id,
      offering_id: query.offering_id,
      status: query.status
    })

    return {
      code: 0,
      message: '获取成功',
      data: paginate(filteredData, query)
    }
  },

  getByStudent(studentId: number): ApiResponse<Enrollment[]> {
    const enrollments = mockDatabase.enrollments.filter(e => e.student_id === studentId)

    return {
      code: 0,
      message: '获取成功',
      data: enrollments
    }
  },

  getByOffering(offeringId: number): ApiResponse<Enrollment[]> {
    const enrollments = mockDatabase.enrollments.filter(e => e.offering_id === offeringId)

    return {
      code: 0,
      message: '获取成功',
      data: enrollments
    }
  },

  getMyEnrollments(): ApiResponse<Enrollment[]> {
    // 模拟返回当前登录学生的选课（这里返回所有选课作为示例）
    return {
      code: 0,
      message: '获取成功',
      data: mockDatabase.enrollments
    }
  },

  create(data: CreateEnrollmentData): ApiResponse<Enrollment> {
    const newEnrollment: Enrollment = {
      enrollment_id: mockDatabase.enrollments.length + 1,
      student_id: data.student_id,
      offering_id: data.offering_id,
      enrollment_date: new Date().toISOString(),
      status: EnrollmentStatus.ENROLLED,
      student: mockDatabase.students.find(s => s.student_id === data.student_id),
      course_offering: mockDatabase.courseOfferings.find(o => o.offering_id === data.offering_id)
    }

    mockDatabase.enrollments.push(newEnrollment)

    return {
      code: 0,
      message: '选课成功',
      data: newEnrollment
    }
  },

  delete(id: number): ApiResponse<null> {
    const index = mockDatabase.enrollments.findIndex(e => e.enrollment_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '选课记录不存在',
        data: null
      }
    }

    mockDatabase.enrollments.splice(index, 1)

    return {
      code: 0,
      message: '退课成功',
      data: null
    }
  },

  getDetail(id: number): ApiResponse<Enrollment | null> {
    const enrollment = mockDatabase.enrollments.find(e => e.enrollment_id === id)
    if (!enrollment) {
      return {
        code: 1,
        message: '选课记录不存在',
        data: null
      }
    }

    return {
      code: 0,
      message: '获取成功',
      data: enrollment
    }
  },

  approve(id: number): ApiResponse<Enrollment | null> {
    const index = mockDatabase.enrollments.findIndex(e => e.enrollment_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '选课记录不存在',
        data: null
      }
    }

    mockDatabase.enrollments[index].status = EnrollmentStatus.ENROLLED

    return {
      code: 0,
      message: '审批成功',
      data: mockDatabase.enrollments[index]
    }
  },

  reject(id: number): ApiResponse<Enrollment | null> {
    const index = mockDatabase.enrollments.findIndex(e => e.enrollment_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '选课记录不存在',
        data: null
      }
    }

    mockDatabase.enrollments[index].status = EnrollmentStatus.WITHDRAWN

    return {
      code: 0,
      message: '已拒绝选课申请',
      data: mockDatabase.enrollments[index]
    }
  },

  withdraw(id: number): ApiResponse<null> {
    const index = mockDatabase.enrollments.findIndex(e => e.enrollment_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '选课记录不存在',
        data: null
      }
    }

    mockDatabase.enrollments[index].status = EnrollmentStatus.WITHDRAWN

    return {
      code: 0,
      message: '退课成功',
      data: null
    }
  }
}

// ========================================
// 成绩管理API
// ========================================
export const gradeApi = {
  getList(query: GradeQuery): ApiResponse<PageResponse<Grade>> {
    const filteredData = filterData(mockDatabase.grades, {
      student_id: query.student_id,
      offering_id: query.offering_id
    })

    return {
      code: 0,
      message: '获取成功',
      data: paginate(filteredData, query)
    }
  },

  getByStudent(studentId: number): ApiResponse<StudentGrade[]> {
    const grades = mockDatabase.studentGrades.filter(grade => grade.student_no === studentId.toString())

    return {
      code: 0,
      message: '获取成功',
      data: grades
    }
  },

  getByOffering(offeringId: number): ApiResponse<Grade[]> {
    const grades = mockDatabase.grades.filter(grade => grade.enrollment_id === offeringId)

    return {
      code: 0,
      message: '获取成功',
      data: grades
    }
  },

  getByEnrollment(enrollmentId: number): ApiResponse<Grade | null> {
    const grade = mockDatabase.grades.find(g => g.enrollment_id === enrollmentId)

    return {
      code: 0,
      message: '获取成功',
      data: grade || null
    }
  },

  getMyGrades(): ApiResponse<StudentGrade[]> {
    // 模拟返回当前登录学生的成绩（这里返回所有成绩作为示例）
    return {
      code: 0,
      message: '获取成功',
      data: mockDatabase.studentGrades
    }
  },

  getCourseGrades(offeringId: number): ApiResponse<Grade[]> {
    const grades = mockDatabase.grades.filter(grade => grade.enrollment_id === offeringId)

    return {
      code: 0,
      message: '获取成功',
      data: grades
    }
  },

  getStudentGrades(query: PageQuery): ApiResponse<PageResponse<StudentGrade>> {
    return {
      code: 0,
      message: '获取成功',
      data: paginate(mockDatabase.studentGrades, query)
    }
  },

  update(id: number, data: UpdateGradeData): ApiResponse<Grade | null> {
    const index = mockDatabase.grades.findIndex(g => g.grade_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '成绩记录不存在',
        data: null
      }
    }

    const updatedGrade = {
      ...mockDatabase.grades[index],
      ...data
    }

    mockDatabase.grades[index] = updatedGrade

    return {
      code: 0,
      message: '成绩更新成功',
      data: updatedGrade
    }
  },

  batchUpdate(data: { grades: Array<{ id: number; usual_score?: number; exam_score?: number }> }): ApiResponse<null> {
    data.grades.forEach(gradeData => {
      const index = mockDatabase.grades.findIndex(g => g.grade_id === gradeData.id)
      if (index !== -1) {
        mockDatabase.grades[index] = {
          ...mockDatabase.grades[index],
          usual_score: gradeData.usual_score,
          exam_score: gradeData.exam_score
        }
      }
    })

    return {
      code: 0,
      message: '批量更新成功',
      data: null
    }
  }
}

// ========================================
// 排课管理API
// ========================================
export const scheduleApi = {
  getList(query: ScheduleQuery): ApiResponse<PageResponse<Schedule>> {
    const filteredData = filterData(mockDatabase.schedules, {
      classroom_id: query.classroom_id,
      day_of_week: query.day_of_week
    })

    return {
      code: 0,
      message: '获取成功',
      data: paginate(filteredData, query)
    }
  },

  getInfoList(query: ScheduleQuery): ApiResponse<PageResponse<ScheduleInfo>> {
    const filteredData = filterData(mockDatabase.scheduleInfos, {
      semester: query.semester
    })

    return {
      code: 0,
      message: '获取成功',
      data: paginate(filteredData, query)
    }
  },

  getByOffering(offeringId: number): ApiResponse<Schedule[]> {
    const schedules = mockDatabase.schedules.filter(s => s.offering_id === offeringId)

    return {
      code: 0,
      message: '获取成功',
      data: schedules
    }
  },

  getByClassroom(classroomId: number): ApiResponse<Schedule[]> {
    const schedules = mockDatabase.schedules.filter(s => s.classroom_id === classroomId)

    return {
      code: 0,
      message: '获取成功',
      data: schedules
    }
  },

  getBySemester(semester: string): ApiResponse<Schedule[]> {
    // 通过开课记录的学期筛选排课
    const offeringsInSemester = mockDatabase.courseOfferings
      .filter(o => o.semester === semester)
      .map(o => o.offering_id)

    const schedules = mockDatabase.schedules.filter(s =>
      offeringsInSemester.includes(s.offering_id)
    )

    return {
      code: 0,
      message: '获取成功',
      data: schedules
    }
  },

  getMySchedule(): ApiResponse<ScheduleInfo[]> {
    // 模拟返回当前用户的课程表（这里返回所有排课信息作为示例）
    return {
      code: 0,
      message: '获取成功',
      data: mockDatabase.scheduleInfos
    }
  },

  checkConflicts(data: {
    classroom_id?: number
    teacher_id?: number
    day_of_week: number
    start_time: string
    end_time: string
    weeks: string
    exclude_schedule_id?: number
  }): ApiResponse<{ conflicts: boolean; details?: string[] }> {
    const conflicts: string[] = []

    // 检查教室冲突
    if (data.classroom_id) {
      const conflictingSchedules = mockDatabase.schedules.filter(s =>
        s.classroom_id === data.classroom_id &&
        s.day_of_week === data.day_of_week &&
        s.start_time === data.start_time &&
        (data.exclude_schedule_id ? s.schedule_id !== data.exclude_schedule_id : true)
      )

      if (conflictingSchedules.length > 0) {
        conflicts.push(`教室 ${data.classroom_id} 在指定时间已被占用`)
      }
    }

    // 检查教师冲突
    if (data.teacher_id) {
      const teacherOfferings = mockDatabase.courseOfferings.filter(o => o.teacher_id === data.teacher_id)
      const teacherSchedules = mockDatabase.schedules.filter(s =>
        teacherOfferings.some(o => o.offering_id === s.offering_id) &&
        s.day_of_week === data.day_of_week &&
        s.start_time === data.start_time &&
        (data.exclude_schedule_id ? s.schedule_id !== data.exclude_schedule_id : true)
      )

      if (teacherSchedules.length > 0) {
        conflicts.push(`教师在指定时间已有其他课程安排`)
      }
    }

    return {
      code: 0,
      message: '检查完成',
      data: {
        conflicts: conflicts.length > 0,
        details: conflicts.length > 0 ? conflicts : undefined
      }
    }
  },

  create(data: CreateScheduleData): ApiResponse<Schedule> {
    const newSchedule: Schedule = {
      schedule_id: mockDatabase.schedules.length + 1,
      offering_id: data.offering_id,
      classroom_id: data.classroom_id,
      day_of_week: data.day_of_week,
      start_time: data.start_time,
      end_time: data.end_time,
      weeks: data.weeks,
      course_offering: mockDatabase.courseOfferings.find(o => o.offering_id === data.offering_id),
      classroom: mockDatabase.classrooms.find(c => c.classroom_id === data.classroom_id)
    }

    mockDatabase.schedules.push(newSchedule)

    return {
      code: 0,
      message: '排课成功',
      data: newSchedule
    }
  },

  update(id: number, data: UpdateScheduleData): ApiResponse<Schedule | null> {
    const index = mockDatabase.schedules.findIndex(s => s.schedule_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '排课记录不存在',
        data: null
      }
    }

    const updatedSchedule = {
      ...mockDatabase.schedules[index],
      ...data
    }

    mockDatabase.schedules[index] = updatedSchedule

    return {
      code: 0,
      message: '更新成功',
      data: updatedSchedule
    }
  },

  delete(id: number): ApiResponse<null> {
    const index = mockDatabase.schedules.findIndex(s => s.schedule_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '排课记录不存在',
        data: null
      }
    }

    mockDatabase.schedules.splice(index, 1)

    return {
      code: 0,
      message: '删除成功',
      data: null
    }
  },

  getDetail(id: number): ApiResponse<Schedule | null> {
    const schedule = mockDatabase.schedules.find(s => s.schedule_id === id)
    if (!schedule) {
      return {
        code: 1,
        message: '排课记录不存在',
        data: null
      }
    }

    return {
      code: 0,
      message: '获取成功',
      data: schedule
    }
  }
}

// ========================================
// 教室管理API
// ========================================
export const classroomApi = {
  getList(query: ClassroomQuery): ApiResponse<PageResponse<Classroom>> {
    let filteredData = filterData(mockDatabase.classrooms, {
      room_no: query.room_no,
      building: query.building,
      room_type: query.room_type,
      status: query.status
    })

    // 按容量筛选
    if (query.min_capacity) {
      filteredData = filteredData.filter(classroom => classroom.capacity >= query.min_capacity!)
    }

    return {
      code: 0,
      message: '获取成功',
      data: paginate(filteredData, query)
    }
  },

  getAll(): ApiResponse<Classroom[]> {
    return {
      code: 0,
      message: '获取成功',
      data: mockDatabase.classrooms
    }
  },

  getByBuilding(building: string): ApiResponse<Classroom[]> {
    const classrooms = mockDatabase.classrooms.filter(c => c.building === building)

    return {
      code: 0,
      message: '获取成功',
      data: classrooms
    }
  },

  getByType(type: string): ApiResponse<Classroom[]> {
    const classrooms = mockDatabase.classrooms.filter(c => c.room_type === type)

    return {
      code: 0,
      message: '获取成功',
      data: classrooms
    }
  },

  getAvailable(query: { day_of_week: number; start_time: string; semester: string }): ApiResponse<Classroom[]> {
    // 找出在指定时间被占用的教室
    const occupiedClassrooms = mockDatabase.schedules
      .filter(s =>
        s.day_of_week === query.day_of_week &&
        s.start_time === query.start_time
      )
      .map(s => s.classroom_id)

    // 返回可用的教室
    const availableClassrooms = mockDatabase.classrooms.filter(c =>
      c.status === ClassroomStatus.ACTIVE &&
      !occupiedClassrooms.includes(c.classroom_id)
    )

    return {
      code: 0,
      message: '获取成功',
      data: availableClassrooms
    }
  },

  create(data: CreateClassroomData): ApiResponse<Classroom> {
    const newClassroom: Classroom = {
      classroom_id: mockDatabase.classrooms.length + 1,
      room_no: data.room_no,
      building: data.building,
      floor: data.floor,
      capacity: data.capacity,
      room_type: data.room_type,
      equipment: data.equipment,
      status: data.status || ClassroomStatus.ACTIVE
    }

    mockDatabase.classrooms.push(newClassroom)

    return {
      code: 0,
      message: '创建成功',
      data: newClassroom
    }
  },

  update(id: number, data: UpdateClassroomData): ApiResponse<Classroom | null> {
    const index = mockDatabase.classrooms.findIndex(c => c.classroom_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '教室不存在',
        data: null
      }
    }

    const updatedClassroom = {
      ...mockDatabase.classrooms[index],
      ...data
    }

    mockDatabase.classrooms[index] = updatedClassroom

    return {
      code: 0,
      message: '更新成功',
      data: updatedClassroom
    }
  },

  delete(id: number): ApiResponse<null> {
    const index = mockDatabase.classrooms.findIndex(c => c.classroom_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '教室不存在',
        data: null
      }
    }

    mockDatabase.classrooms.splice(index, 1)

    return {
      code: 0,
      message: '删除成功',
      data: null
    }
  },

  getDetail(id: number): ApiResponse<Classroom | null> {
    const classroom = mockDatabase.classrooms.find(c => c.classroom_id === id)
    if (!classroom) {
      return {
        code: 1,
        message: '教室不存在',
        data: null
      }
    }

    return {
      code: 0,
      message: '获取成功',
      data: classroom
    }
  }
}

// ========================================
// 奖惩管理API
// ========================================
export const rewardPunishmentApi = {
  getList(query: RewardPunishmentQuery): ApiResponse<PageResponse<RewardPunishment>> {
    const filteredData = filterData(mockDatabase.rewardPunishments, {
      student_id: query.student_id,
      type: query.type
    })

    return {
      code: 0,
      message: '获取成功',
      data: paginate(filteredData, query)
    }
  },

  getByStudent(studentId: number): ApiResponse<RewardPunishment[]> {
    const records = mockDatabase.rewardPunishments.filter(rp => rp.student_id === studentId)

    return {
      code: 0,
      message: '获取成功',
      data: records
    }
  },

  getByType(type: string): ApiResponse<RewardPunishment[]> {
    const records = mockDatabase.rewardPunishments.filter(rp => rp.type === type)

    return {
      code: 0,
      message: '获取成功',
      data: records
    }
  },

  getStatistics(): ApiResponse<{
    total_rewards: number
    total_punishments: number
    recent_records: RewardPunishment[]
  }> {
    const totalRewards = mockDatabase.rewardPunishments.filter(rp => rp.type === RewardPunishmentType.REWARD).length
    const totalPunishments = mockDatabase.rewardPunishments.filter(rp => rp.type === RewardPunishmentType.PUNISHMENT).length
    const recentRecords = mockDatabase.rewardPunishments
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)

    return {
      code: 0,
      message: '获取成功',
      data: {
        total_rewards: totalRewards,
        total_punishments: totalPunishments,
        recent_records: recentRecords
      }
    }
  },

  create(data: CreateRewardPunishmentData): ApiResponse<RewardPunishment> {
    const newRecord: RewardPunishment = {
      record_id: mockDatabase.rewardPunishments.length + 1,
      student_id: data.student_id,
      type: data.type,
      category: data.category,
      description: data.description,
      occur_date: data.occur_date,
      created_at: new Date().toISOString(),
      student: mockDatabase.students.find(s => s.student_id === data.student_id)
    }

    mockDatabase.rewardPunishments.push(newRecord)

    return {
      code: 0,
      message: '创建成功',
      data: newRecord
    }
  },

  update(id: number, data: UpdateRewardPunishmentData): ApiResponse<RewardPunishment | null> {
    const index = mockDatabase.rewardPunishments.findIndex(rp => rp.record_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '奖惩记录不存在',
        data: null
      }
    }

    const updatedRecord = {
      ...mockDatabase.rewardPunishments[index],
      ...data
    }

    mockDatabase.rewardPunishments[index] = updatedRecord

    return {
      code: 0,
      message: '更新成功',
      data: updatedRecord
    }
  },

  delete(id: number): ApiResponse<null> {
    const index = mockDatabase.rewardPunishments.findIndex(rp => rp.record_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '奖惩记录不存在',
        data: null
      }
    }

    mockDatabase.rewardPunishments.splice(index, 1)

    return {
      code: 0,
      message: '删除成功',
      data: null
    }
  },

  getDetail(id: number): ApiResponse<RewardPunishment | null> {
    const record = mockDatabase.rewardPunishments.find(rp => rp.record_id === id)
    if (!record) {
      return {
        code: 1,
        message: '奖惩记录不存在',
        data: null
      }
    }

    return {
      code: 0,
      message: '获取成功',
      data: record
    }
  }
}

// ========================================
// 学籍管理API
// ========================================
export const studentStatusApi = {
  getList(query: StudentStatusQuery): ApiResponse<PageResponse<StudentStatus>> {
    const filteredData = filterData(mockDatabase.studentStatuses, {
      student_id: query.student_id,
      status_type: query.status_type
    })

    return {
      code: 0,
      message: '获取成功',
      data: paginate(filteredData, query)
    }
  },

  getByStudent(studentId: number): ApiResponse<StudentStatus[]> {
    const statuses = mockDatabase.studentStatuses.filter(ss => ss.student_id === studentId)

    return {
      code: 0,
      message: '获取成功',
      data: statuses
    }
  },

  getByType(type: string): ApiResponse<StudentStatus[]> {
    const statuses = mockDatabase.studentStatuses.filter(ss => ss.status_type === type)

    return {
      code: 0,
      message: '获取成功',
      data: statuses
    }
  },

  getHistory(studentId: number): ApiResponse<StudentStatus[]> {
    const history = mockDatabase.studentStatuses
      .filter(ss => ss.student_id === studentId)
      .sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime())

    return {
      code: 0,
      message: '获取成功',
      data: history
    }
  },

  getCurrent(studentId: number): ApiResponse<StudentStatus | null> {
    const currentStatus = mockDatabase.studentStatuses
      .filter(ss =>
        ss.student_id === studentId &&
        (!ss.end_date || new Date(ss.end_date) > new Date())
      )
      .sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime())[0]

    return {
      code: 0,
      message: '获取成功',
      data: currentStatus || null
    }
  },

  create(data: CreateStudentStatusData): ApiResponse<StudentStatus> {
    const newStatus: StudentStatus = {
      status_id: mockDatabase.studentStatuses.length + 1,
      student_id: data.student_id,
      status_type: data.status_type,
      effective_date: data.effective_date,
      end_date: data.end_date,
      reason: data.reason,
      created_at: new Date().toISOString(),
      student: mockDatabase.students.find(s => s.student_id === data.student_id)
    }

    mockDatabase.studentStatuses.push(newStatus)

    return {
      code: 0,
      message: '创建成功',
      data: newStatus
    }
  },

  update(id: number, data: UpdateStudentStatusData): ApiResponse<StudentStatus | null> {
    const index = mockDatabase.studentStatuses.findIndex(ss => ss.status_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '学籍记录不存在',
        data: null
      }
    }

    const updatedStatus = {
      ...mockDatabase.studentStatuses[index],
      ...data
    }

    mockDatabase.studentStatuses[index] = updatedStatus

    return {
      code: 0,
      message: '更新成功',
      data: updatedStatus
    }
  },

  delete(id: number): ApiResponse<null> {
    const index = mockDatabase.studentStatuses.findIndex(ss => ss.status_id === id)
    if (index === -1) {
      return {
        code: 1,
        message: '学籍记录不存在',
        data: null
      }
    }

    mockDatabase.studentStatuses.splice(index, 1)

    return {
      code: 0,
      message: '删除成功',
      data: null
    }
  },

  getDetail(id: number): ApiResponse<StudentStatus | null> {
    const status = mockDatabase.studentStatuses.find(ss => ss.status_id === id)
    if (!status) {
      return {
        code: 1,
        message: '学籍记录不存在',
        data: null
      }
    }

    return {
      code: 0,
      message: '获取成功',
      data: status
    }
  }
}

// ========================================
// 统计数据API
// ========================================
export const statisticsApi = {
  getSystemOverview(): ApiResponse<any> {
    // 计算真实的统计数据
    const activeUsers = mockDatabase.users.filter(u => u.status === 1).length
    const totalStudents = mockDatabase.students.length
    const activeTeachers = mockDatabase.teachers.filter(t => t.status === 1).length
    const activeCourses = mockDatabase.courses.filter(c => c.status === 1).length
    const currentOfferings = mockDatabase.courseOfferings.filter(co => co.status === 1).length
    const totalEnrollments = mockDatabase.enrollments.filter(e => e.status === 1).length

    return {
      code: 0,
      message: '获取成功',
      data: {
        activeUsers,
        totalStudents,
        activeTeachers,
        activeCourses,
        currentOfferings,
        totalEnrollments
      }
    }
  },

  getDashboardStats(): ApiResponse<any> {
    return {
      code: 0,
      message: '获取成功',
      data: {
        overview: statisticsApi.getSystemOverview().data,
        recentNotices: [
          {
            id: 1,
            title: '关于期末考试安排的通知',
            content: '2024年春季学期期末考试将于6月15日开始...',
            publishTime: '2024-05-20',
            publisher: '教务处'
          },
          {
            id: 2,
            title: '选课系统维护通知',
            content: '选课系统将于本周六进行维护升级...',
            publishTime: '2024-05-18',
            publisher: '信息中心'
          }
        ]
      }
    }
  }
}

// 导出所有API
export const mockApi = {
  auth: authApi,
  user: userApi,
  role: roleApi,
  permission: permissionApi,
  department: departmentApi,
  teacher: teacherApi,
  student: studentApi,
  course: courseApi,
  courseOffering: courseOfferingApi,
  enrollment: enrollmentApi,
  grade: gradeApi,
  schedule: scheduleApi,
  classroom: classroomApi,
  rewardPunishment: rewardPunishmentApi,
  studentStatus: studentStatusApi,
  statistics: statisticsApi
}

export default mockApi
