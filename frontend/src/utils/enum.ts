import { UserStatus, CourseType, CourseStatus, OfferingStatus, EnrollmentStatus } from '@/types/database'

/**
 * 枚举映射基础接口
 */
interface EnumMapConfig<T> {
  text: string
  color?: string
  type?: string
}

/**
 * 创建枚举映射工具
 */
export function createEnumMapper<T extends string | number>(
  enumMap: Record<T, EnumMapConfig<T>>
) {
  return {
    getText: (value: T): string => enumMap[value]?.text || '未知',
    getColor: (value: T): string => enumMap[value]?.color || 'default',
    getType: (value: T): string => enumMap[value]?.type || 'info',
    getConfig: (value: T): EnumMapConfig<T> | undefined => enumMap[value]
  }
}

/**
 * 用户状态映射
 */
export const userStatusMapper = createEnumMapper({
  [UserStatus.ACTIVE]: { text: '启用', color: '#67c23a', type: 'success' },
  [UserStatus.INACTIVE]: { text: '禁用', color: '#e6a23c', type: 'warning' },
  [UserStatus.LOCKED]: { text: '锁定', color: '#f56c6c', type: 'danger' }
})

/**
 * 课程类型映射
 */
export const courseTypeMapper = createEnumMapper({
  [CourseType.REQUIRED]: { text: '必修课', color: '#f56c6c', type: 'danger' },
  [CourseType.ELECTIVE]: { text: '选修课', color: '#409eff', type: 'primary' },
  [CourseType.PUBLIC_ELECTIVE]: { text: '公选课', color: '#67c23a', type: 'success' }
})

/**
 * 课程状态映射
 */
export const courseStatusMapper = createEnumMapper({
  [CourseStatus.INACTIVE]: { text: '禁用', color: '#909399', type: 'info' },
  [CourseStatus.ACTIVE]: { text: '启用', color: '#67c23a', type: 'success' }
})

/**
 * 开课状态映射
 */
export const offeringStatusMapper = createEnumMapper({
  [OfferingStatus.INACTIVE]: { text: '禁用', color: '#909399', type: 'info' },
  [OfferingStatus.ACTIVE]: { text: '启用', color: '#67c23a', type: 'success' }
})

/**
 * 选课状态映射
 */
export const enrollmentStatusMapper = createEnumMapper({
  [EnrollmentStatus.WITHDRAWN]: { text: '已退课', color: '#909399', type: 'info' },
  [EnrollmentStatus.ENROLLED]: { text: '已选课', color: '#67c23a', type: 'success' },
  [EnrollmentStatus.PENDING]: { text: '待审核', color: '#e6a23c', type: 'warning' }
})

/**
 * 获取进度条颜色
 */
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 100) return '#f56c6c'
  if (percentage >= 80) return '#e6a23c'
  return '#67c23a'
}
