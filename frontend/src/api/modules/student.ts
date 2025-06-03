import { request } from '../../utils/request'
import type { ApiResponse, PageQuery, PageResponse } from '../../types/common'
import type {
  Student,
  StudentQuery,
  StudentInfo,
  StudentGrade,
  StudentTranscript,
  StudentGPA,
  CreateStudentData,
  UpdateStudentData
} from '../../types/database'
import { API_ENDPOINTS } from '../../constants/api'

// ========================================
// 学生管理API
// ========================================
export const studentApi = {
  // 获取学生列表
  getList: (params?: StudentQuery): Promise<ApiResponse<PageResponse<Student>>> => {
    return request.get(API_ENDPOINTS.STUDENTS.LIST, { params })
  },

  // 获取学生信息列表（使用视图）
  getInfoList: (params?: PageQuery): Promise<ApiResponse<PageResponse<StudentInfo>>> => {
    return request.get(API_ENDPOINTS.STUDENTS.INFO_LIST, { params })
  },

  // 获取学生详情
  getDetail: (id: number): Promise<ApiResponse<Student | null>> => {
    return request.get(API_ENDPOINTS.STUDENTS.DETAIL(id))
  },

  // 根据用户ID获取学生信息
  getByUser: (userId: number): Promise<ApiResponse<Student | null>> => {
    return request.get(API_ENDPOINTS.STUDENTS.BY_USER(userId))
  },

  // 根据部门获取学生列表
  getByDepartment: (deptId: number): Promise<ApiResponse<Student[]>> => {
    return request.get(API_ENDPOINTS.STUDENTS.BY_DEPARTMENT(deptId))
  },

  // 根据班级获取学生列表
  getByClass: (className: string): Promise<ApiResponse<Student[]>> => {
    return request.get(API_ENDPOINTS.STUDENTS.BY_CLASS(className))
  },

  // 获取学生成绩单
  getTranscript: (id: number): Promise<ApiResponse<StudentTranscript | null>> => {
    return request.get(API_ENDPOINTS.STUDENTS.TRANSCRIPT(id))
  },

  // 获取学生GPA
  getGPA: (id: number): Promise<ApiResponse<StudentGPA | null>> => {
    return request.get(API_ENDPOINTS.STUDENTS.GPA(id))
  },

  // 创建学生
  create: (data: CreateStudentData): Promise<ApiResponse<Student>> => {
    return request.post(API_ENDPOINTS.STUDENTS.CREATE, data)
  },

  // 更新学生
  update: (id: number, data: UpdateStudentData): Promise<ApiResponse<Student | null>> => {
    return request.put(API_ENDPOINTS.STUDENTS.UPDATE(id), data)
  },

  // 删除学生
  delete: (id: number): Promise<ApiResponse<null>> => {
    return request.delete(API_ENDPOINTS.STUDENTS.DELETE(id))
  }
}

export default studentApi
