import request from '../../utils/request'
import type { ApiResponse } from '../../types/common'
import type { Permission } from '../../types/database'
import { API_ENDPOINTS } from '../../constants/api'

// 权限管理API
export const permissionApi = {
  // 获取权限列表
  getList: (): Promise<ApiResponse<Permission[]>> => {
    return request.get(API_ENDPOINTS.PERMISSIONS.LIST)
  },

  // 获取所有权限
  getAll: (): Promise<ApiResponse<Permission[]>> => {
    return request.get(API_ENDPOINTS.PERMISSIONS.ALL)
  },

  // 按模块获取权限
  getByModule: (): Promise<ApiResponse<Record<string, Permission[]>>> => {
    return request.get(API_ENDPOINTS.PERMISSIONS.BY_MODULE)
  },

  // 获取权限模块列表
  getModules: (): Promise<ApiResponse<string[]>> => {
    return request.get(API_ENDPOINTS.PERMISSIONS.MODULES)
  }
}

export default permissionApi
