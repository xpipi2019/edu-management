import dayjs from 'dayjs'

/**
 * 格式化日期时间
 * @param date 日期字符串或Date对象
 * @param format 格式化字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (
  date: string | Date | null | undefined,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string => {
  if (!date) return '-'
  return dayjs(date).format(format)
}

/**
 * 格式化日期
 * @param date 日期字符串或Date对象
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  return formatDateTime(date, 'YYYY-MM-DD')
}

/**
 * 格式化时间
 * @param date 日期字符串或Date对象
 * @returns 格式化后的时间字符串
 */
export const formatTime = (date: string | Date | null | undefined): string => {
  return formatDateTime(date, 'HH:mm:ss')
}

/**
 * 获取相对时间（简化版本）
 * @param date 日期字符串或Date对象
 * @returns 相对时间描述
 */
export const getRelativeTime = (date: string | Date): string => {
  const now = dayjs()
  const target = dayjs(date)
  const diffMinutes = now.diff(target, 'minute')

  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`

  const diffHours = now.diff(target, 'hour')
  if (diffHours < 24) return `${diffHours}小时前`

  const diffDays = now.diff(target, 'day')
  if (diffDays < 30) return `${diffDays}天前`

  const diffMonths = now.diff(target, 'month')
  if (diffMonths < 12) return `${diffMonths}个月前`

  const diffYears = now.diff(target, 'year')
  return `${diffYears}年前`
}

/**
 * 防抖函数
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * 节流函数
 * @param fn 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}

/**
 * 深拷贝
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any
  if (typeof obj === 'object') {
    const clonedObj: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
export const generateRandomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 下载文件
 * @param url 文件URL
 * @param filename 文件名
 */
export const downloadFile = (url: string, filename?: string): void => {
  const link = document.createElement('a')
  link.href = url
  if (filename) {
    link.download = filename
  }
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 是否成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 兼容不支持 navigator.clipboard 的浏览器
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

/**
 * 验证手机号
 * @param phone 手机号
 * @returns 是否有效
 */
export const isValidPhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证邮箱
 * @param email 邮箱
 * @returns 是否有效
 */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * 验证身份证号
 * @param idCard 身份证号
 * @returns 是否有效
 */
export const isValidIdCard = (idCard: string): boolean => {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)
}
