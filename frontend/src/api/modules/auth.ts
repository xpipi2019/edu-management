import service from '../../utils/request'
import type { ApiResponse } from '../../types/common'
import type { LoginForm, LoginResponse, User } from '../../types/database'
import { API_ENDPOINTS } from '../../constants/api'

// 认证相关API
export const authApi = {
  // 用户登录
  login: (data: LoginForm): Promise<ApiResponse<LoginResponse | null>> => {
    return service.post(API_ENDPOINTS.AUTH.LOGIN + '/json', data).then(res => res.data)
  },

  // 用户退出
  logout: (): Promise<ApiResponse<null>> => {
    return service.post(API_ENDPOINTS.AUTH.LOGOUT).then(res => res.data)
  },

  // 获取用户信息
  getProfile: (): Promise<ApiResponse<User>> => {
    return service.get(API_ENDPOINTS.AUTH.PROFILE).then(res => res.data)
  },

  // 修改密码
  changePassword: (data: {
    oldPassword: string
    newPassword: string
  }): Promise<ApiResponse<null>> => {
    return service.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data).then(res => res.data)
  },

  // 刷新token
  refreshToken: (refreshToken: string): Promise<ApiResponse<LoginResponse | null>> => {
    return service.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }).then(res => res.data)
  }
}

export default authApi
