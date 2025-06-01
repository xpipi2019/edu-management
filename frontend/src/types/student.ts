import type { PageQuery } from './common'
import type { Student, User } from './user'

// 学籍状态变更类型枚举
export enum StudentStatusChangeType {
  ENROLLMENT = 'ENROLLMENT',      // 入学
  SUSPENSION = 'SUSPENSION',      // 休学
  RESUMPTION = 'RESUMPTION',      // 复学
  WITHDRAWAL = 'WITHDRAWAL',      // 退学
  GRADUATION = 'GRADUATION',      // 毕业
  TRANSFER_IN = 'TRANSFER_IN',    // 转入
  TRANSFER_OUT = 'TRANSFER_OUT',  // 转出
  MAJOR_CHANGE = 'MAJOR_CHANGE'   // 转专业
}

// 学籍状态变更记录
export interface StudentStatusChange {
  id: number
  studentId: number
  changeType: StudentStatusChangeType
  fromStatus?: string
  toStatus: string
  reason: string
  effectiveDate: string
  approvedBy?: number
  approvedAt?: string
  remarks?: string
  student: Student
  approver?: User
  createdAt: string
  updatedAt: string
}

// 学籍状态变更查询参数
export interface StudentStatusChangeQuery extends PageQuery {
  studentId?: number
  changeType?: StudentStatusChangeType
  startDate?: string
  endDate?: string
  approvedBy?: number
}

// 创建学籍状态变更数据
export interface CreateStudentStatusChangeData {
  studentId: number
  changeType: StudentStatusChangeType
  fromStatus?: string
  toStatus: string
  reason: string
  effectiveDate: string
  remarks?: string
}

// 更新学籍状态变更数据
export interface UpdateStudentStatusChangeData {
  reason?: string
  effectiveDate?: string
  remarks?: string
}

// 审批学籍状态变更数据
export interface ApproveStudentStatusChangeData {
  approved: boolean
  remarks?: string
}

// 奖惩类型枚举
export enum RewardPunishmentType {
  REWARD = 'REWARD',
  PUNISHMENT = 'PUNISHMENT'
}

// 奖惩等级枚举
export enum RewardPunishmentLevel {
  // 奖励等级
  PRAISE = 'PRAISE',               // 表扬
  MERIT = 'MERIT',                 // 嘉奖
  THIRD_CLASS_MERIT = 'THIRD_CLASS_MERIT',     // 三等功
  SECOND_CLASS_MERIT = 'SECOND_CLASS_MERIT',   // 二等功
  FIRST_CLASS_MERIT = 'FIRST_CLASS_MERIT',     // 一等功

  // 处分等级
  WARNING = 'WARNING',             // 警告
  SERIOUS_WARNING = 'SERIOUS_WARNING',         // 严重警告
  DEMERIT = 'DEMERIT',            // 记过
  SERIOUS_DEMERIT = 'SERIOUS_DEMERIT',         // 记大过
  PROBATION = 'PROBATION',         // 留校察看
  EXPULSION = 'EXPULSION'          // 开除学籍
}

// 奖惩记录
export interface RewardPunishment {
  id: number
  studentId: number
  type: RewardPunishmentType
  level: RewardPunishmentLevel
  title: string
  reason: string
  date: string
  processedBy: number
  remarks?: string
  isActive: boolean
  student: Student
  processor: User
  createdAt: string
  updatedAt: string
}

// 奖惩记录查询参数
export interface RewardPunishmentQuery extends PageQuery {
  studentId?: number
  type?: RewardPunishmentType
  level?: RewardPunishmentLevel
  startDate?: string
  endDate?: string
  processedBy?: number
  isActive?: boolean
}

// 创建奖惩记录数据
export interface CreateRewardPunishmentData {
  studentId: number
  type: RewardPunishmentType
  level: RewardPunishmentLevel
  title: string
  reason: string
  date: string
  remarks?: string
}

// 更新奖惩记录数据
export interface UpdateRewardPunishmentData {
  title?: string
  reason?: string
  date?: string
  remarks?: string
  isActive?: boolean
}

// 奖惩统计信息
export interface RewardPunishmentStatistics {
  totalRewards: number
  totalPunishments: number
  rewardsByLevel: Record<RewardPunishmentLevel, number>
  punishmentsByLevel: Record<RewardPunishmentLevel, number>
  monthlyTrend: Array<{
    month: string
    rewards: number
    punishments: number
  }>
}
