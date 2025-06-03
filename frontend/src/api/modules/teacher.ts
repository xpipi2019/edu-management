import { request } from '../../utils/request'
import type { ApiResponse, PageQuery, PageResponse } from '../../types/common'
import type {
  Teacher,
  TeacherQuery,
  TeacherInfo,
  CreateTeacherData,
  UpdateTeacherData
} from '../../types/database'
import { API_ENDPOINTS } from '../../constants/api'

// ========================================
// 教师管理API
// ========================================
export const teacherApi = {
  // 获取教师列表
  getList: (params?: TeacherQuery): Promise<ApiResponse<PageResponse<Teacher>>> => {
    return request.get(API_ENDPOINTS.TEACHERS.LIST, { params })
  },

  // 获取教师信息列表（使用视图）
  getInfoList: (params?: PageQuery): Promise<ApiResponse<PageResponse<TeacherInfo>>> => {
    return request.get(API_ENDPOINTS.TEACHERS.INFO_LIST, { params })
  },

  // 获取教师详情
  getDetail: (id: number): Promise<ApiResponse<Teacher | null>> => {
    return request.get(API_ENDPOINTS.TEACHERS.DETAIL(id))
  },

  // 根据用户ID获取教师信息
  getByUser: (userId: number): Promise<ApiResponse<Teacher | null>> => {
    return request.get(API_ENDPOINTS.TEACHERS.BY_USER(userId))
  },

  // 根据部门获取教师列表
  getByDepartment: (deptId: number): Promise<ApiResponse<Teacher[]>> => {
    return request.get(API_ENDPOINTS.TEACHERS.BY_DEPARTMENT(deptId))
  },

  // 创建教师
  create: (data: CreateTeacherData): Promise<ApiResponse<Teacher>> => {
    return request.post(API_ENDPOINTS.TEACHERS.CREATE, data)
  },

  // 更新教师
  update: (id: number, data: UpdateTeacherData): Promise<ApiResponse<Teacher | null>> => {
    return request.put(API_ENDPOINTS.TEACHERS.UPDATE(id), data)
  },

  // 删除教师
  delete: (id: number): Promise<ApiResponse<null>> => {
    return request.delete(API_ENDPOINTS.TEACHERS.DELETE(id))
  }
}

export default teacherApi
