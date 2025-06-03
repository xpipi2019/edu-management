import { request } from '../../utils/request'
import type { ApiResponse, PageQuery, PageResponse } from '../../types/common'
import type {
  Schedule,
  ScheduleQuery,
  ScheduleInfo,
  CreateScheduleData,
  UpdateScheduleData
} from '../../types/database'
import { API_ENDPOINTS } from '../../constants/api'

// ========================================
// 排课管理API
// ========================================
export const scheduleApi = {
  // 获取排课列表
  getList: (params?: ScheduleQuery): Promise<ApiResponse<PageResponse<Schedule>>> => {
    return request.get(API_ENDPOINTS.SCHEDULES.LIST, { params })
  },

  // 获取排课信息列表（使用视图）
  getInfoList: (params?: PageQuery): Promise<ApiResponse<PageResponse<ScheduleInfo>>> => {
    return request.get(API_ENDPOINTS.SCHEDULES.INFO_LIST, { params })
  },

  // 获取排课详情
  getDetail: (id: number): Promise<ApiResponse<Schedule | null>> => {
    return request.get(API_ENDPOINTS.SCHEDULES.DETAIL(id))
  },

  // 根据开课获取排课列表
  getByOffering: (offeringId: number): Promise<ApiResponse<Schedule[]>> => {
    return request.get(API_ENDPOINTS.SCHEDULES.BY_OFFERING(offeringId))
  },

  // 根据教室获取排课列表
  getByClassroom: (classroomId: number): Promise<ApiResponse<Schedule[]>> => {
    return request.get(API_ENDPOINTS.SCHEDULES.BY_CLASSROOM(classroomId))
  },

  // 根据学期获取排课列表
  getBySemester: (semester: string): Promise<ApiResponse<Schedule[]>> => {
    return request.get(API_ENDPOINTS.SCHEDULES.BY_SEMESTER(semester))
  },

  // 获取我的课程表（教师/学生）
  getMySchedule: (): Promise<ApiResponse<ScheduleInfo[]>> => {
    return request.get(API_ENDPOINTS.SCHEDULES.MY_SCHEDULE)
  },

  // 检查排课冲突
  checkConflicts: (data: {
    classroom_id?: number
    teacher_id?: number
    day_of_week: number
    start_time: string
    end_time: string
    weeks: string
    exclude_schedule_id?: number
  }): Promise<ApiResponse<{ conflicts: boolean; details?: string[] }>> => {
    return request.post(API_ENDPOINTS.SCHEDULES.CONFLICTS, data)
  },

  // 创建排课
  create: (data: CreateScheduleData): Promise<ApiResponse<Schedule>> => {
    return request.post(API_ENDPOINTS.SCHEDULES.CREATE, data)
  },

  // 更新排课
  update: (id: number, data: UpdateScheduleData): Promise<ApiResponse<Schedule | null>> => {
    return request.put(API_ENDPOINTS.SCHEDULES.UPDATE(id), data)
  },

  // 删除排课
  delete: (id: number): Promise<ApiResponse<null>> => {
    return request.delete(API_ENDPOINTS.SCHEDULES.DELETE(id))
  }
}

export default scheduleApi
