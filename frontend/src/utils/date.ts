/**
 * 日期工具函数
 */

/**
 * 格式化日期时间
 * @param dateStr 日期字符串
 * @param format 格式化模板
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (dateStr?: string, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!dateStr) return '-'

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化日期
 * @param dateStr 日期字符串
 * @returns 格式化后的日期字符串 (YYYY-MM-DD)
 */
export const formatDate = (dateStr?: string): string => {
  return formatDateTime(dateStr, 'YYYY-MM-DD')
}

/**
 * 格式化时间
 * @param dateStr 日期字符串
 * @returns 格式化后的时间字符串 (HH:mm:ss)
 */
export const formatTime = (dateStr?: string): string => {
  return formatDateTime(dateStr, 'HH:mm:ss')
}

/**
 * 获取相对时间描述
 * @param dateStr 日期字符串
 * @returns 相对时间描述
 */
export const getRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  const year = 365 * day

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < month) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

/**
 * 判断是否为今天
 * @param dateStr 日期字符串
 * @returns 是否为今天
 */
export const isToday = (dateStr: string): boolean => {
  const date = new Date(dateStr)
  const today = new Date()

  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate()
}

/**
 * 获取当前学期
 * @returns 当前学期信息
 */
export const getCurrentSemester = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 0-11 转为 1-12

  // 春季学期: 2-7月
  // 秋季学期: 8-1月（次年）
  if (month >= 2 && month <= 7) {
    return {
      academicYear: `${year}-${year + 1}`,
      semester: '春季学期'
    }
  } else {
    const academicYear = month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`
    return {
      academicYear,
      semester: '秋季学期'
    }
  }
}
