import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { API_BASE_URL, HTTP_STATUS, BUSINESS_CODE } from '@/constants/api'
import type { ApiResponse } from '@/types/common'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()

    // 添加token
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 如果是文件下载等特殊响应，直接返回
    if (response.config.responseType === 'blob') {
      return response
    }

    const { data } = response

    // 检查业务状态码
    if (data.code === BUSINESS_CODE.SUCCESS) {
      return response
    }

    // 处理业务错误
    ElMessage.error(data.message || '请求失败')
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  async (error) => {
    const { response } = error

    if (!response) {
      ElMessage.error('网络错误，请检查网络连接')
      return Promise.reject(error)
    }

    const { status } = response
    const authStore = useAuthStore()

    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        ElMessage.error('登录已过期，请重新登录')
        authStore.logout()
        // 跳转到登录页
        window.location.href = '/login'
        break

      case HTTP_STATUS.FORBIDDEN:
        ElMessage.error('没有权限访问该资源')
        break

      case HTTP_STATUS.NOT_FOUND:
        ElMessage.error('请求的资源不存在')
        break

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        ElMessage.error('服务器内部错误')
        break

      default:
        ElMessage.error(response.data?.message || '请求失败')
    }

    return Promise.reject(error)
  }
)

// 请求方法封装
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.get(url, config).then(res => res.data)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.post(url, data, config).then(res => res.data)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.put(url, data, config).then(res => res.data)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.delete(url, config).then(res => res.data)
  },

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.patch(url, data, config).then(res => res.data)
  }
}

export default service
