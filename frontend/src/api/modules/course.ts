import { request } from '@/utils/request'
import { API_ENDPOINTS } from '@/constants/api'
import type {
  Course,
  CourseQuery,
  CreateCourseData,
  UpdateCourseData,
  CourseOffering,
  CourseOfferingQuery,
  CreateCourseOfferingData,
  UpdateCourseOfferingData,
  Enrollment,
  EnrollmentQuery,
  CreateEnrollmentData,
  BatchGradeUpdateData,
  CourseStats,
  TeacherCourseStats,
  StudentEnrollmentStats
} from '@/types/course'
import type { PageResponse } from '@/types/common'

// 课程相关API
export const courseApi = {
  // 获取课程列表
  getCourses: (params: CourseQuery): Promise<PageResponse<Course>> => {
    return request.get(API_ENDPOINTS.COURSES.LIST, { params })
  },

  // 获取课程详情
  getCourseById: (id: number): Promise<Course> => {
    return request.get(API_ENDPOINTS.COURSES.DETAIL(id))
  },

  // 创建课程
  createCourse: (data: CreateCourseData): Promise<Course> => {
    return request.post(API_ENDPOINTS.COURSES.CREATE, data)
  },

  // 更新课程
  updateCourse: (id: number, data: UpdateCourseData): Promise<Course> => {
    return request.put(API_ENDPOINTS.COURSES.UPDATE(id), data)
  },

  // 删除课程
  deleteCourse: (id: number): Promise<void> => {
    return request.delete(API_ENDPOINTS.COURSES.DELETE(id))
  },

  // 获取所有可选课程（用于下拉选择）
  getAllCourses: (): Promise<Course[]> => {
    return request.get(`${API_ENDPOINTS.COURSES.LIST}/all`)
  },

  // 获取课程统计信息
  getCourseStats: (): Promise<CourseStats> => {
    return request.get(`${API_ENDPOINTS.COURSES.LIST}/stats`)
  }
}

// 开课相关API
export const courseOfferingApi = {
  // 获取开课列表
  getCourseOfferings: (params: CourseOfferingQuery): Promise<PageResponse<CourseOffering>> => {
    return request.get(API_ENDPOINTS.COURSE_OFFERINGS.LIST, { params })
  },

  // 获取开课详情
  getCourseOfferingById: (id: number): Promise<CourseOffering> => {
    return request.get(API_ENDPOINTS.COURSE_OFFERINGS.DETAIL(id))
  },

  // 创建开课
  createCourseOffering: (data: CreateCourseOfferingData): Promise<CourseOffering> => {
    return request.post(API_ENDPOINTS.COURSE_OFFERINGS.CREATE, data)
  },

  // 更新开课
  updateCourseOffering: (id: number, data: UpdateCourseOfferingData): Promise<CourseOffering> => {
    return request.put(API_ENDPOINTS.COURSE_OFFERINGS.UPDATE(id), data)
  },

  // 删除开课
  deleteCourseOffering: (id: number): Promise<void> => {
    return request.delete(API_ENDPOINTS.COURSE_OFFERINGS.DELETE(id))
  },

  // 获取我的课程（教师）
  getMyCourses: (): Promise<CourseOffering[]> => {
    return request.get(API_ENDPOINTS.COURSE_OFFERINGS.MY_COURSES)
  },

  // 获取教师课程统计
  getTeacherStats: (): Promise<TeacherCourseStats> => {
    return request.get(`${API_ENDPOINTS.COURSE_OFFERINGS.LIST}/teacher-stats`)
  }
}

// 选课相关API
export const enrollmentApi = {
  // 获取选课列表
  getEnrollments: (params: EnrollmentQuery): Promise<PageResponse<Enrollment>> => {
    return request.get(API_ENDPOINTS.ENROLLMENTS.LIST, { params })
  },

  // 学生选课
  createEnrollment: (data: CreateEnrollmentData): Promise<Enrollment> => {
    return request.post(API_ENDPOINTS.ENROLLMENTS.CREATE, data)
  },

  // 退课
  deleteEnrollment: (id: number): Promise<void> => {
    return request.delete(API_ENDPOINTS.ENROLLMENTS.DELETE(id))
  },

  // 审核选课（教师/教务）
  approveEnrollment: (id: number): Promise<Enrollment> => {
    return request.post(API_ENDPOINTS.ENROLLMENTS.APPROVE(id))
  },

  // 拒绝选课
  rejectEnrollment: (id: number, reason?: string): Promise<Enrollment> => {
    return request.post(API_ENDPOINTS.ENROLLMENTS.REJECT(id), { reason })
  },

  // 获取我的选课（学生）
  getMyEnrollments: (): Promise<Enrollment[]> => {
    return request.get(API_ENDPOINTS.ENROLLMENTS.MY_ENROLLMENTS)
  },

  // 获取学生选课统计
  getStudentStats: (): Promise<StudentEnrollmentStats> => {
    return request.get(`${API_ENDPOINTS.ENROLLMENTS.LIST}/student-stats`)
  }
}

// 成绩相关API
export const gradeApi = {
  // 获取课程成绩列表
  getCourseGrades: (courseOfferingId: number): Promise<Enrollment[]> => {
    return request.get(API_ENDPOINTS.GRADES.COURSE_GRADES(courseOfferingId))
  },

  // 创建成绩
  createGrade: (data: {
    enrollmentId: number
    regularScore?: number
    midtermScore?: number
    finalScore?: number
    totalScore?: number
    gradeLevel?: string
    gpa?: number
  }): Promise<any> => {
    return request.post('/api/grades', data)
  },

  // 更新单个成绩
  updateGrade: (gradeId: number, data: {
    regularScore?: number
    midtermScore?: number
    finalScore?: number
    totalScore?: number
    gradeLevel?: string
    gpa?: number
  }): Promise<any> => {
    return request.put(`/api/grades/${gradeId}`, data)
  },

  // 批量更新成绩
  batchUpdateGrades: (data: BatchGradeUpdateData): Promise<void> => {
    return request.post(API_ENDPOINTS.GRADES.BATCH_UPDATE, data)
  },

  // 获取我的成绩（学生）
  getMyGrades: (): Promise<Enrollment[]> => {
    return request.get(API_ENDPOINTS.GRADES.MY_GRADES)
  }
}
