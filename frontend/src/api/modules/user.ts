import { request } from '../../utils/request'
import type { ApiResponse, PageQuery, PageResponse } from '../../types/common'
import type {
  User,
  UserQuery,
  CreateUserData,
  UpdateUserData,
  BatchOperationData,
  ResetPasswordData,
  ToggleStatusData
} from '../../types/database'
import { API_ENDPOINTS } from '../../constants/api'

// ========================================
// 用户管理API
// ========================================
export const userApi = {
  // 获取用户列表
  getList: (params?: UserQuery): Promise<ApiResponse<PageResponse<User>>> => {
    return request.get(API_ENDPOINTS.USERS.LIST, { params })
  },

  // 获取用户详情
  getDetail: (id: number): Promise<ApiResponse<User | null>> => {
    return request.get(API_ENDPOINTS.USERS.DETAIL(id))
  },

  // 创建用户
  create: (data: CreateUserData): Promise<ApiResponse<User>> => {
    return request.post(API_ENDPOINTS.USERS.CREATE, data)
  },

  // 更新用户
  update: (id: number, data: UpdateUserData): Promise<ApiResponse<User | null>> => {
    return request.put(API_ENDPOINTS.USERS.UPDATE(id), data)
  },

  // 删除用户
  delete: (id: number): Promise<ApiResponse<null>> => {
    return request.delete(API_ENDPOINTS.USERS.DELETE(id))
  },

  // 批量删除用户
  batchDelete: (data: BatchOperationData): Promise<ApiResponse<null>> => {
    return request.post(API_ENDPOINTS.USERS.BATCH_DELETE, data)
  },

  // 启用/禁用用户
  toggleStatus: (id: number, data: ToggleStatusData): Promise<ApiResponse<User | null>> => {
    return request.post(API_ENDPOINTS.USERS.TOGGLE_STATUS(id), data)
  },

  // 重置用户密码
  resetPassword: (id: number, data?: ResetPasswordData): Promise<ApiResponse<{ password: string }>> => {
    return request.post(API_ENDPOINTS.USERS.RESET_PASSWORD(id), data || {})
  },

  // 分配角色
  assignRoles: (id: number, roleIds: number[]): Promise<ApiResponse<null>> => {
    return request.post(API_ENDPOINTS.USERS.ASSIGN_ROLES(id), { role_ids: roleIds })
  }
}

export default userApi
