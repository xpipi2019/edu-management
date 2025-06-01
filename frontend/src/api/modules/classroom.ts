import { request } from '@/utils/request'
import { API_ENDPOINTS } from '@/constants/api'
import type { Classroom, ClassroomStatus } from '@/types/course'
import type { PageResponse, PageQuery } from '@/types/common'

// 教室查询参数
export interface ClassroomQuery extends PageQuery {
  name?: string
  building?: string
  capacity?: number
  status?: ClassroomStatus
}

// 创建教室数据
export interface CreateClassroomData {
  name: string
  building: string
  capacity: number
  type?: string
  location?: string
}

// 更新教室数据
export interface UpdateClassroomData {
  name?: string
  building?: string
  capacity?: number
  type?: string
  location?: string
  status?: ClassroomStatus
}

// 教室相关API
export const classroomApi = {
  // 获取教室列表
  getClassrooms: (params: ClassroomQuery): Promise<PageResponse<Classroom>> => {
    return request.get(API_ENDPOINTS.CLASSROOMS.LIST, { params })
  },

  // 创建教室
  createClassroom: (data: CreateClassroomData): Promise<Classroom> => {
    return request.post(API_ENDPOINTS.CLASSROOMS.CREATE, data)
  },

  // 更新教室
  updateClassroom: (id: number, data: UpdateClassroomData): Promise<Classroom> => {
    return request.put(API_ENDPOINTS.CLASSROOMS.UPDATE(id), data)
  },

  // 删除教室
  deleteClassroom: (id: number): Promise<void> => {
    return request.delete(API_ENDPOINTS.CLASSROOMS.DELETE(id))
  },

  // 获取可用教室
  getAvailableClassrooms: (params?: {
    dayOfWeek?: number
    startTime?: number
    endTime?: number
    capacity?: number
  }): Promise<Classroom[]> => {
    return request.get(API_ENDPOINTS.CLASSROOMS.AVAILABLE, { params })
  },

  // 获取所有教室（用于下拉选择）
  getAllClassrooms: (): Promise<Classroom[]> => {
    return request.get(API_ENDPOINTS.CLASSROOMS.ALL)
  }
}
