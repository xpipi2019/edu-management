import { request } from '../../utils/request'
import type { ApiResponse, PageQuery, PageResponse } from '../../types/common'
import type {
  RewardPunishment,
  RewardPunishmentQuery,
  CreateRewardPunishmentData,
  UpdateRewardPunishmentData
} from '../../types/database'
import { API_ENDPOINTS } from '../../constants/api'

// ========================================
// 奖惩记录管理API
// ========================================
export const rewardPunishmentApi = {
  // 获取奖惩记录列表
  getList: (params?: RewardPunishmentQuery): Promise<ApiResponse<PageResponse<RewardPunishment>>> => {
    return request.get(API_ENDPOINTS.REWARD_PUNISHMENT.LIST, { params })
  },

  // 获取奖惩记录详情
  getDetail: (id: number): Promise<ApiResponse<RewardPunishment | null>> => {
    return request.get(API_ENDPOINTS.REWARD_PUNISHMENT.DETAIL(id))
  },

  // 根据学生获取奖惩记录列表
  getByStudent: (studentId: number): Promise<ApiResponse<RewardPunishment[]>> => {
    return request.get(API_ENDPOINTS.REWARD_PUNISHMENT.BY_STUDENT(studentId))
  },

  // 根据类型获取奖惩记录列表
  getByType: (type: string): Promise<ApiResponse<RewardPunishment[]>> => {
    return request.get(API_ENDPOINTS.REWARD_PUNISHMENT.BY_TYPE(type))
  },

  // 获取奖惩统计
  getStatistics: (): Promise<ApiResponse<{
    total_rewards: number
    total_punishments: number
    recent_records: RewardPunishment[]
  }>> => {
    return request.get(API_ENDPOINTS.REWARD_PUNISHMENT.STATISTICS)
  },

  // 创建奖惩记录
  create: (data: CreateRewardPunishmentData): Promise<ApiResponse<RewardPunishment>> => {
    return request.post(API_ENDPOINTS.REWARD_PUNISHMENT.CREATE, data)
  },

  // 更新奖惩记录
  update: (id: number, data: UpdateRewardPunishmentData): Promise<ApiResponse<RewardPunishment | null>> => {
    return request.put(API_ENDPOINTS.REWARD_PUNISHMENT.UPDATE(id), data)
  },

  // 删除奖惩记录
  delete: (id: number): Promise<ApiResponse<null>> => {
    return request.delete(API_ENDPOINTS.REWARD_PUNISHMENT.DELETE(id))
  }
}

export default rewardPunishmentApi
