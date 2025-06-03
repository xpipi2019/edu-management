import { request } from '../../utils/request'
import type { ApiResponse, PageQuery, PageResponse } from '../../types/common'
import type {
  Role,
  Permission,
  RoleQuery,
  CreateRoleData,
  UpdateRoleData
} from '../../types/database'
import { API_ENDPOINTS } from '../../constants/api'

// ========================================
// 角色管理API
// ========================================
export const roleApi = {
  // 获取角色列表
  getList: (params?: RoleQuery): Promise<ApiResponse<PageResponse<Role>>> => {
    return request.get(API_ENDPOINTS.ROLES.LIST, { params })
  },

  // 获取所有角色（不分页）
  getAll: (): Promise<ApiResponse<Role[]>> => {
    return request.get(API_ENDPOINTS.ROLES.ALL)
  },

  // 获取角色详情
  getDetail: (id: number): Promise<ApiResponse<Role | null>> => {
    return request.get(API_ENDPOINTS.ROLES.DETAIL(id))
  },

  // 创建角色
  create: (data: CreateRoleData): Promise<ApiResponse<Role>> => {
    return request.post(API_ENDPOINTS.ROLES.CREATE, data)
  },

  // 更新角色
  update: (id: number, data: UpdateRoleData): Promise<ApiResponse<Role | null>> => {
    return request.put(API_ENDPOINTS.ROLES.UPDATE(id), data)
  },

  // 删除角色
  delete: (id: number): Promise<ApiResponse<null>> => {
    return request.delete(API_ENDPOINTS.ROLES.DELETE(id))
  },

  // 获取角色权限
  getPermissions: (id: number): Promise<ApiResponse<Permission[]>> => {
    return request.get(API_ENDPOINTS.ROLES.PERMISSIONS(id))
  },

  // 分配权限
  assignPermissions: (id: number, permissionIds: number[]): Promise<ApiResponse<null>> => {
    return request.post(API_ENDPOINTS.ROLES.ASSIGN_PERMISSIONS(id), { permission_ids: permissionIds })
  }
}

export default roleApi
