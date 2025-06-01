/**
 * 格式化日期时间
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * 格式化日期
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * 格式化时间
 */
export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-'
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * 获取星期几的中文表示
 */
export const getDayText = (dayOfWeek: number): string => {
  const dayMap = ['', '一', '二', '三', '四', '五', '六', '日']
  return dayMap[dayOfWeek] || ''
}

/**
 * 计算百分比
 */
export const calculatePercentage = (current: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 手机号脱敏
 */
export const maskPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 邮箱脱敏
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email
  const [username, domain] = email.split('@')
  const maskedUsername = username.length > 3
    ? username.substring(0, 3) + '***'
    : username
  return `${maskedUsername}@${domain}`
}
