import { request } from '../../utils/request'
import type { ApiResponse, PageQuery, PageResponse } from '../../types/common'
import type {
  Department,
  CreateDepartmentData,
  UpdateDepartmentData
} from '../../types/database'
import { API_ENDPOINTS } from '../../constants/api'

// 部门查询参数类型
interface DepartmentQuery extends PageQuery {
  dept_name?: string
  dept_code?: string
  parent_id?: number
  status?: number
}

// ========================================
// 部门管理API
// ========================================
export const departmentApi = {
  // 获取部门列表
  getList: (params?: DepartmentQuery): Promise<ApiResponse<PageResponse<Department>>> => {
    return request.get(API_ENDPOINTS.DEPARTMENTS.LIST, { params })
  },

  // 获取所有部门（不分页）
  getAll: (): Promise<ApiResponse<Department[]>> => {
    return request.get(API_ENDPOINTS.DEPARTMENTS.ALL)
  },

  // 获取部门树形结构
  getTree: (): Promise<ApiResponse<Department[]>> => {
    return request.get(API_ENDPOINTS.DEPARTMENTS.TREE)
  },

  // 获取部门详情
  getDetail: (id: number): Promise<ApiResponse<Department | null>> => {
    return request.get(API_ENDPOINTS.DEPARTMENTS.DETAIL(id))
  },

  // 创建部门
  create: (data: CreateDepartmentData): Promise<ApiResponse<Department>> => {
    return request.post(API_ENDPOINTS.DEPARTMENTS.CREATE, data)
  },

  // 更新部门
  update: (id: number, data: UpdateDepartmentData): Promise<ApiResponse<Department | null>> => {
    return request.put(API_ENDPOINTS.DEPARTMENTS.UPDATE(id), data)
  },

  // 删除部门
  delete: (id: number): Promise<ApiResponse<null>> => {
    return request.delete(API_ENDPOINTS.DEPARTMENTS.DELETE(id))
  }
}

export default departmentApi
