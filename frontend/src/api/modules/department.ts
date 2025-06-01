import { request } from '@/utils/request'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  Department,
  DepartmentQuery,
  CreateDepartmentData,
  UpdateDepartmentData
} from '@/types/user'
import type { PageResponse } from '@/types/common'

// 部门相关API
export const departmentApi = {
  // 获取部门树
  getDepartmentTree: (): Promise<Department[]> => {
    return request.get(API_ENDPOINTS.DEPARTMENTS.TREE)
  },

  // 获取部门列表
  getDepartments: (params?: DepartmentQuery): Promise<PageResponse<Department>> => {
    return request.get(API_ENDPOINTS.DEPARTMENTS.LIST, { params })
  },

  // 创建部门
  createDepartment: (data: CreateDepartmentData): Promise<Department> => {
    return request.post(API_ENDPOINTS.DEPARTMENTS.CREATE, data)
  },

  // 更新部门
  updateDepartment: (id: number, data: UpdateDepartmentData): Promise<Department> => {
    return request.put(API_ENDPOINTS.DEPARTMENTS.UPDATE(id), data)
  },

  // 删除部门
  deleteDepartment: (id: number): Promise<void> => {
    return request.delete(API_ENDPOINTS.DEPARTMENTS.DELETE(id))
  }
}
