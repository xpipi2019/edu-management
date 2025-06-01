import { request } from '@/utils/request'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  User,
  UserQuery,
  CreateUserData,
  UpdateUserData,
  Teacher,
  Student
} from '@/types/user'
import type { PageResponse } from '@/types/common'

// 用户相关API
export const userApi = {
  // 获取用户列表
  getUsers: (params: UserQuery): Promise<PageResponse<User>> => {
    return request.get(API_ENDPOINTS.USERS.LIST, { params })
  },

  // 获取用户详情
  getUserById: (id: number): Promise<User> => {
    return request.get(API_ENDPOINTS.USERS.DETAIL(id))
  },

  // 创建用户
  createUser: (data: CreateUserData): Promise<User> => {
    return request.post(API_ENDPOINTS.USERS.CREATE, data)
  },

  // 更新用户
  updateUser: (id: number, data: UpdateUserData): Promise<User> => {
    return request.put(API_ENDPOINTS.USERS.UPDATE(id), data)
  },

  // 删除用户
  deleteUser: (id: string | number): Promise<void> => {
    return request.delete(API_ENDPOINTS.USERS.DELETE(id))
  },

  // 批量删除用户
  batchDeleteUsers: (ids: (string | number)[]): Promise<void> => {
    return request.delete(API_ENDPOINTS.USERS.BATCH_DELETE, { data: { ids } })
  },

  // 重置用户密码
  resetPassword: (id: number): Promise<{ password: string }> => {
    return request.post(API_ENDPOINTS.USERS.RESET_PASSWORD(id))
  },

  // 启用/禁用用户
  toggleUserStatus: (id: number): Promise<User> => {
    return request.patch(API_ENDPOINTS.USERS.TOGGLE_STATUS(id))
  },

  // 获取教师信息
  getTeacherByUserId: (userId: number): Promise<Teacher> => {
    return request.get(API_ENDPOINTS.USERS.GET_TEACHER(userId))
  },

  // 获取学生信息
  getStudentByUserId: (userId: number): Promise<Student> => {
    return request.get(API_ENDPOINTS.USERS.GET_STUDENT(userId))
  }
}
