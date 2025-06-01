import { request } from '@/utils/request'
import { API_ENDPOINTS } from '@/constants/api'
import type { Schedule } from '@/types/course'
import type { PageResponse, PageQuery } from '@/types/common'

// 排课查询参数
export interface ScheduleQuery extends PageQuery {
  courseOfferingId?: number
  classroomId?: number
  dayOfWeek?: number
  teacherId?: number
  semester?: string
  academicYear?: string
}

// 创建排课数据
export interface CreateScheduleData {
  courseOfferingId: number
  dayOfWeek: number
  startTime: number
  endTime: number
  classroom: string
  weeks: number[]
}

// 更新排课数据
export interface UpdateScheduleData {
  courseOfferingId?: number
  dayOfWeek?: number
  startTime?: number
  endTime?: number
  classroom?: string
  weeks?: number[]
}

// 冲突检测结果
export interface ConflictInfo {
  timeSlot: string
  conflictSchedules: Schedule[]
}

// 排课相关API
export const scheduleApi = {
  // 获取排课列表
  getSchedules: (params: ScheduleQuery): Promise<PageResponse<Schedule>> => {
    return request.get(API_ENDPOINTS.SCHEDULES.LIST, { params })
  },

  // 创建排课
  createSchedule: (data: CreateScheduleData): Promise<Schedule> => {
    return request.post(API_ENDPOINTS.SCHEDULES.CREATE, data)
  },

  // 更新排课
  updateSchedule: (id: number, data: UpdateScheduleData): Promise<Schedule> => {
    return request.put(API_ENDPOINTS.SCHEDULES.UPDATE(id), data)
  },

  // 删除排课
  deleteSchedule: (id: number): Promise<void> => {
    return request.delete(API_ENDPOINTS.SCHEDULES.DELETE(id))
  },

  // 批量删除排课
  batchDeleteSchedules: (ids: number[]): Promise<void> => {
    return request.post(`${API_ENDPOINTS.SCHEDULES.LIST}/batch-delete`, { ids })
  },

  // 获取我的课程表（学生/教师）
  getMySchedule: (): Promise<Schedule[]> => {
    return request.get(API_ENDPOINTS.SCHEDULES.MY_SCHEDULE)
  },

  // 检测排课冲突
  detectConflicts: (params?: {
    semester?: string
    academicYear?: string
  }): Promise<ConflictInfo[]> => {
    return request.get(API_ENDPOINTS.SCHEDULES.CONFLICTS, { params })
  },

  // 获取特定时间段的排课
  getSchedulesByTimeSlot: (params: {
    dayOfWeek: number
    startTime: number
    endTime: number
    weeks?: number[]
  }): Promise<Schedule[]> => {
    return request.get(`${API_ENDPOINTS.SCHEDULES.LIST}/by-time-slot`, { params })
  },

  // 获取教师的排课
  getTeacherSchedules: (teacherId: number, params?: {
    semester?: string
    academicYear?: string
  }): Promise<Schedule[]> => {
    return request.get(`${API_ENDPOINTS.SCHEDULES.LIST}/teacher/${teacherId}`, { params })
  },

  // 获取教室的排课
  getClassroomSchedules: (classroom: string, params?: {
    semester?: string
    academicYear?: string
  }): Promise<Schedule[]> => {
    return request.get(`${API_ENDPOINTS.SCHEDULES.LIST}/classroom/${classroom}`, { params })
  }
}
