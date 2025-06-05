import service from '../../utils/request'
import type { ApiResponse } from '../../types/common'
import { API_ENDPOINTS } from '../../constants/api'

export interface SystemOverview {
  activeUsers: number
  totalStudents: number
  activeTeachers: number
  activeCourses: number
  currentOfferings: number
  totalEnrollments: number
}

// 统计相关API
export const statisticsApi = {
  /**
   * 获取系统概览统计
   */
  getSystemOverview: (): Promise<ApiResponse<SystemOverview>> => {
    return service.get(API_ENDPOINTS.STATISTICS.OVERVIEW).then(res => res.data)
  },

  /**
   * 获取仪表盘统计数据
   */
  getDashboardStats: (): Promise<ApiResponse<any>> => {
    return service.get(API_ENDPOINTS.STATISTICS.DASHBOARD).then(res => res.data)
  }
}

export default statisticsApi
