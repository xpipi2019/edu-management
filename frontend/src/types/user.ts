import type { PageQuery } from './common'

// 用户基本信息
export interface User {
  id: number
  username: string
  email: string
  phone?: string
  realName: string
  avatar?: string
  status: UserStatus
  createdAt: string
  updatedAt: string
  roles: Role[]
  permissions: string[]
}

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED'
}

// 角色信息
export interface Role {
  id: number
  name: string
  code: string
  description?: string
  permissions: Permission[]
}

// 权限信息
export interface Permission {
  id: number
  name: string
  code: string
  module: string
  description?: string
}

// 用户查询参数
export interface UserQuery extends PageQuery {
  username?: string
  email?: string
  status?: UserStatus
  roleId?: number
}

// 创建用户数据
export interface CreateUserData {
  username: string
  password: string
  email: string
  phone?: string
  realName: string
  roleIds: number[]
}

// 更新用户数据
export interface UpdateUserData {
  email?: string
  phone?: string
  realName?: string
  status?: UserStatus
  roleIds?: number[]
}

// 登录表单
export interface LoginForm {
  username: string
  password: string
  remember?: boolean
}

// 登录响应
export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
}

// 教师信息
export interface Teacher {
  id: number
  userId: number
  employeeId: string
  title: string
  education: string
  hireDate: string
  major: string
  bio?: string
  user: User
}

// 学生信息
export interface Student {
  id: number
  userId: number
  studentId: string
  enrollmentYear: number
  major: string
  className: string
  status: StudentStatus
  user: User
}

// 学生状态枚举
export enum StudentStatus {
  ENROLLED = 'ENROLLED',
  SUSPENDED = 'SUSPENDED',
  GRADUATED = 'GRADUATED',
  DROPPED = 'DROPPED'
}

// 部门信息
export interface Department {
  id: number
  name: string
  code: string
  parentId?: number
  description?: string
  children?: Department[]
  createdAt: string
  updatedAt: string
}

// 部门查询参数
export interface DepartmentQuery {
  name?: string
  parentId?: number
}

// 创建部门数据
export interface CreateDepartmentData {
  name: string
  code: string
  parentId?: number
  description?: string
}

// 更新部门数据
export interface UpdateDepartmentData {
  name?: string
  code?: string
  parentId?: number
  description?: string
}

// 角色查询参数
export interface RoleQuery extends PageQuery {
  name?: string
  code?: string
}

// 创建角色数据
export interface CreateRoleData {
  name: string
  code: string
  description?: string
  permissionIds: number[]
}

// 更新角色数据
export interface UpdateRoleData {
  name?: string
  code?: string
  description?: string
  permissionIds?: number[]
}
