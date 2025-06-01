import { request } from '@/utils/request'
import { API_ENDPOINTS } from '@/constants/api'
import type { Permission } from '@/types/user'
import type { PageResponse } from '@/types/common'

// 权限相关API
export const permissionApi = {
  // 获取权限列表
  getPermissions: (params?: { module?: string }): Promise<PageResponse<Permission>> => {
    return request.get(API_ENDPOINTS.PERMISSIONS.LIST, { params })
  },

  // 获取所有权限（不分页）
  getAllPermissions: (): Promise<Permission[]> => {
    return request.get(API_ENDPOINTS.PERMISSIONS.ALL)
  },

  // 按模块分组获取权限
  getPermissionsByModule: (): Promise<Record<string, Permission[]>> => {
    return request.get(API_ENDPOINTS.PERMISSIONS.BY_MODULE)
  }
}
