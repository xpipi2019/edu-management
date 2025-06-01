import { request } from '@/utils/request'
import type { ApiResponse, PageResponse } from '@/types/common'
import type {
  StudentStatusChange,
  StudentStatusChangeQuery,
  CreateStudentStatusChangeData,
  UpdateStudentStatusChangeData,
  ApproveStudentStatusChangeData,
  RewardPunishment,
  RewardPunishmentQuery,
  CreateRewardPunishmentData,
  UpdateRewardPunishmentData,
  RewardPunishmentStatistics
} from '@/types/student'

// 学籍状态管理API
export const studentStatusApi = {
  // 获取学籍状态变更列表
  getStatusChanges: (params: StudentStatusChangeQuery): Promise<PageResponse<StudentStatusChange>> => {
    return request.get('/api/student-status-changes', { params })
  },

  // 获取学籍状态变更详情
  getStatusChange: (id: number): Promise<ApiResponse<StudentStatusChange>> => {
    return request.get(`/api/student-status-changes/${id}`)
  },

  // 创建学籍状态变更申请
  createStatusChange: (data: CreateStudentStatusChangeData): Promise<ApiResponse<StudentStatusChange>> => {
    return request.post('/api/student-status-changes', data)
  },

  // 更新学籍状态变更
  updateStatusChange: (id: number, data: UpdateStudentStatusChangeData): Promise<ApiResponse<StudentStatusChange>> => {
    return request.put(`/api/student-status-changes/${id}`, data)
  },

  // 审批学籍状态变更
  approveStatusChange: (id: number, data: ApproveStudentStatusChangeData): Promise<ApiResponse<StudentStatusChange>> => {
    return request.post(`/api/student-status-changes/${id}/approve`, data)
  },

  // 删除学籍状态变更
  deleteStatusChange: (id: number): Promise<ApiResponse<void>> => {
    return request.delete(`/api/student-status-changes/${id}`)
  },

  // 获取学生的状态变更历史
  getStudentStatusHistory: (studentId: number): Promise<ApiResponse<StudentStatusChange[]>> => {
    return request.get(`/api/students/${studentId}/status-history`)
  }
}

// 奖惩管理API
export const rewardPunishmentApi = {
  // 获取奖惩记录列表
  getRewardPunishments: (params: RewardPunishmentQuery): Promise<PageResponse<RewardPunishment>> => {
    return request.get('/api/reward-punishments', { params })
  },

  // 获取奖惩记录详情
  getRewardPunishment: (id: number): Promise<ApiResponse<RewardPunishment>> => {
    return request.get(`/api/reward-punishments/${id}`)
  },

  // 创建奖惩记录
  createRewardPunishment: (data: CreateRewardPunishmentData): Promise<ApiResponse<RewardPunishment>> => {
    return request.post('/api/reward-punishments', data)
  },

  // 更新奖惩记录
  updateRewardPunishment: (id: number, data: UpdateRewardPunishmentData): Promise<ApiResponse<RewardPunishment>> => {
    return request.put(`/api/reward-punishments/${id}`, data)
  },

  // 删除奖惩记录
  deleteRewardPunishment: (id: number): Promise<ApiResponse<void>> => {
    return request.delete(`/api/reward-punishments/${id}`)
  },

  // 获取学生的奖惩历史
  getStudentRewardPunishments: (studentId: number): Promise<ApiResponse<RewardPunishment[]>> => {
    return request.get(`/api/students/${studentId}/reward-punishments`)
  },

  // 获取奖惩统计信息
  getStatistics: (params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<RewardPunishmentStatistics>> => {
    return request.get('/api/reward-punishments/statistics', { params })
  }
}
