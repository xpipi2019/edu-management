import { request } from '../../utils/request'
import type { ApiResponse, PageQuery, PageResponse } from '../../types/common'
import type {
  StudentStatus,
  StudentStatusQuery,
  CreateStudentStatusData,
  UpdateStudentStatusData
} from '../../types/database'
import { API_ENDPOINTS } from '../../constants/api'

// ========================================
// 学籍管理API
// ========================================
export const studentStatusApi = {
  // 获取学籍列表
  getList: (params?: StudentStatusQuery): Promise<ApiResponse<PageResponse<StudentStatus>>> => {
    return request.get(API_ENDPOINTS.STUDENT_STATUS.LIST, { params })
  },

  // 获取学籍详情
  getDetail: (id: number): Promise<ApiResponse<StudentStatus | null>> => {
    return request.get(API_ENDPOINTS.STUDENT_STATUS.DETAIL(id))
  },

  // 根据学生获取学籍列表
  getByStudent: (studentId: number): Promise<ApiResponse<StudentStatus[]>> => {
    return request.get(API_ENDPOINTS.STUDENT_STATUS.BY_STUDENT(studentId))
  },

  // 根据类型获取学籍列表
  getByType: (type: string): Promise<ApiResponse<StudentStatus[]>> => {
    return request.get(API_ENDPOINTS.STUDENT_STATUS.BY_TYPE(type))
  },

  // 获取学生学籍历史
  getHistory: (studentId: number): Promise<ApiResponse<StudentStatus[]>> => {
    return request.get(API_ENDPOINTS.STUDENT_STATUS.HISTORY(studentId))
  },

  // 获取学生当前学籍状态
  getCurrent: (studentId: number): Promise<ApiResponse<StudentStatus | null>> => {
    return request.get(API_ENDPOINTS.STUDENT_STATUS.CURRENT(studentId))
  },

  // 创建学籍记录
  create: (data: CreateStudentStatusData): Promise<ApiResponse<StudentStatus>> => {
    return request.post(API_ENDPOINTS.STUDENT_STATUS.CREATE, data)
  },

  // 更新学籍记录
  update: (id: number, data: UpdateStudentStatusData): Promise<ApiResponse<StudentStatus | null>> => {
    return request.put(API_ENDPOINTS.STUDENT_STATUS.UPDATE(id), data)
  },

  // 删除学籍记录
  delete: (id: number): Promise<ApiResponse<null>> => {
    return request.delete(API_ENDPOINTS.STUDENT_STATUS.DELETE(id))
  }
}

export default studentStatusApi
