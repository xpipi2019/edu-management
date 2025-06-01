import { request } from '@/utils/request'
import { API_ENDPOINTS } from '@/constants/api'
import type { LoginForm, LoginResponse, User } from '@/types/user'

export const authApi = {
  // 用户登录
  login: (data: LoginForm): Promise<LoginResponse> => {
    return request.post(API_ENDPOINTS.AUTH.LOGIN, data)
  },

  // 用户登出
  logout: (): Promise<void> => {
    return request.post(API_ENDPOINTS.AUTH.LOGOUT)
  },

  // 刷新token
  refreshToken: (refreshToken: string): Promise<LoginResponse> => {
    return request.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken })
  },

  // 获取用户信息
  getProfile: (): Promise<User> => {
    return request.get(API_ENDPOINTS.AUTH.PROFILE)
  }
}
