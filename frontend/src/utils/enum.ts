import { UserStatus } from '@/types/user'
import { CourseType, CourseStatus } from '@/types/course'

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
  [CourseType.PUBLIC]: { text: '公共课', color: '#67c23a', type: 'success' },
  [CourseType.PROFESSIONAL]: { text: '专业课', color: '#e6a23c', type: 'warning' }
})

/**
 * 课程状态映射
 */
export const courseStatusMapper = createEnumMapper({
  [CourseStatus.DRAFT]: { text: '草稿', color: '#909399', type: 'info' },
  [CourseStatus.PUBLISHED]: { text: '已发布', color: '#67c23a', type: 'success' },
  [CourseStatus.ARCHIVED]: { text: '已归档', color: '#e6a23c', type: 'warning' }
})

/**
 * 课程开课状态映射（如果有的话）
 */
export const offeringStatusMapper = createEnumMapper({
  DRAFT: { text: '草稿', color: '#909399', type: 'info' },
  PUBLISHED: { text: '已发布', color: '#67c23a', type: 'success' },
  ENROLLMENT: { text: '选课中', color: '#409eff', type: 'primary' },
  TEACHING: { text: '教学中', color: '#e6a23c', type: 'warning' },
  COMPLETED: { text: '已完成', color: '#67c23a', type: '' },
  CANCELLED: { text: '已取消', color: '#f56c6c', type: 'danger' }
})

/**
 * 获取进度条颜色
 */
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 100) return '#f56c6c'
  if (percentage >= 80) return '#e6a23c'
  return '#67c23a'
}
