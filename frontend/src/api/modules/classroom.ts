import { request } from '../../utils/request'
import type { ApiResponse, PageQuery, PageResponse } from '../../types/common'
import type {
  Classroom,
  ClassroomQuery,
  CreateClassroomData,
  UpdateClassroomData
} from '../../types/database'
import { API_ENDPOINTS } from '../../constants/api'

// ========================================
// 教室管理API
// ========================================
export const classroomApi = {
  // 获取教室列表
  getList: (params?: ClassroomQuery): Promise<ApiResponse<PageResponse<Classroom>>> => {
    return request.get(API_ENDPOINTS.CLASSROOMS.LIST, { params })
  },

  // 获取所有教室（不分页）
  getAll: (): Promise<ApiResponse<Classroom[]>> => {
    return request.get(API_ENDPOINTS.CLASSROOMS.ALL)
  },

  // 获取教室详情
  getDetail: (id: number): Promise<ApiResponse<Classroom | null>> => {
    return request.get(API_ENDPOINTS.CLASSROOMS.DETAIL(id))
  },

  // 根据建筑获取教室列表
  getByBuilding: (building: string): Promise<ApiResponse<Classroom[]>> => {
    return request.get(API_ENDPOINTS.CLASSROOMS.BY_BUILDING(building))
  },

  // 根据类型获取教室列表
  getByType: (type: string): Promise<ApiResponse<Classroom[]>> => {
    return request.get(API_ENDPOINTS.CLASSROOMS.BY_TYPE(type))
  },

  // 查找可用教室
  getAvailable: (params?: {
    date?: string
    time_slot?: string
    capacity?: number
    room_type?: string
  }): Promise<ApiResponse<Classroom[]>> => {
    return request.get(API_ENDPOINTS.CLASSROOMS.AVAILABLE, { params })
  },

  // 创建教室
  create: (data: CreateClassroomData): Promise<ApiResponse<Classroom>> => {
    return request.post(API_ENDPOINTS.CLASSROOMS.CREATE, data)
  },

  // 更新教室
  update: (id: number, data: UpdateClassroomData): Promise<ApiResponse<Classroom | null>> => {
    return request.put(API_ENDPOINTS.CLASSROOMS.UPDATE(id), data)
  },

  // 删除教室
  delete: (id: number): Promise<ApiResponse<null>> => {
    return request.delete(API_ENDPOINTS.CLASSROOMS.DELETE(id))
  }
}

export default classroomApi
