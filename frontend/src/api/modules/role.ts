import { request } from '@/utils/request'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  Role,
  RoleQuery,
  CreateRoleData,
  UpdateRoleData
} from '@/types/user'
import type { PageResponse } from '@/types/common'

// 角色相关API
export const roleApi = {
  // 获取角色列表
  getRoles: (params?: RoleQuery): Promise<PageResponse<Role>> => {
    return request.get(API_ENDPOINTS.ROLES.LIST, { params })
  },

  // 获取所有角色（不分页）
  getAllRoles: (): Promise<Role[]> => {
    return request.get(API_ENDPOINTS.ROLES.ALL)
  },

  // 获取角色详情
  getRoleById: (id: number): Promise<Role> => {
    return request.get(API_ENDPOINTS.ROLES.DETAIL(id))
  },

  // 创建角色
  createRole: (data: CreateRoleData): Promise<Role> => {
    return request.post(API_ENDPOINTS.ROLES.CREATE, data)
  },

  // 更新角色
  updateRole: (id: number, data: UpdateRoleData): Promise<Role> => {
    return request.put(API_ENDPOINTS.ROLES.UPDATE(id), data)
  },

  // 删除角色
  deleteRole: (id: number): Promise<void> => {
    return request.delete(API_ENDPOINTS.ROLES.DELETE(id))
  },

  // 分配权限给角色
  assignPermissions: (roleId: number, permissionIds: number[]): Promise<void> => {
    return request.post(API_ENDPOINTS.ROLES.PERMISSIONS(roleId), { permissionIds })
  }
}
