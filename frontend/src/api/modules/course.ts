import { request } from '../../utils/request'
import type { ApiResponse, PageQuery, PageResponse } from '../../types/common'
import type {
  Course,
  CourseQuery,
  CourseOffering,
  CourseOfferingQuery,
  CourseOfferingInfo,
  Enrollment,
  EnrollmentQuery,
  Grade,
  GradeQuery,
  StudentGrade,
  CreateCourseData,
  UpdateCourseData,
  CreateCourseOfferingData,
  UpdateCourseOfferingData,
  CreateEnrollmentData,
  UpdateGradeData
} from '../../types/database'
import { API_ENDPOINTS } from '../../constants/api'

// ========================================
// 课程管理API
// ========================================
export const courseApi = {
  // 获取课程列表
  getList: (params?: CourseQuery): Promise<ApiResponse<PageResponse<Course>>> => {
    return request.get(API_ENDPOINTS.COURSES.LIST, { params })
  },

  // 获取所有课程（不分页）
  getAll: (): Promise<ApiResponse<Course[]>> => {
    return request.get<PageResponse<Course>>(API_ENDPOINTS.COURSES.LIST, {
      params: { pageSize: 10000 }  // 使用大页面获取所有数据
    }).then(response => ({
      ...response,
      data: response.data.list
    }))
  },

  // 获取课程详情
  getDetail: (id: number): Promise<ApiResponse<Course | null>> => {
    return request.get(API_ENDPOINTS.COURSES.DETAIL(id))
  },

  // 根据部门获取课程列表
  getByDepartment: (deptId: number): Promise<ApiResponse<Course[]>> => {
    return request.get(API_ENDPOINTS.COURSES.BY_DEPARTMENT(deptId))
  },

  // 根据类型获取课程列表
  getByType: (type: string): Promise<ApiResponse<Course[]>> => {
    return request.get(API_ENDPOINTS.COURSES.BY_TYPE(type))
  },

  // 创建课程
  create: (data: CreateCourseData): Promise<ApiResponse<Course>> => {
    return request.post(API_ENDPOINTS.COURSES.CREATE, data)
  },

  // 更新课程
  update: (id: number, data: UpdateCourseData): Promise<ApiResponse<Course | null>> => {
    return request.put(API_ENDPOINTS.COURSES.UPDATE(id), data)
  },

  // 删除课程
  delete: (id: number): Promise<ApiResponse<null>> => {
    return request.delete(API_ENDPOINTS.COURSES.DELETE(id))
  }
}

// ========================================
// 开课管理API
// ========================================
export const courseOfferingApi = {
  // 获取开课列表
  getList: (params?: CourseOfferingQuery): Promise<ApiResponse<PageResponse<CourseOffering>>> => {
    return request.get(API_ENDPOINTS.COURSE_OFFERINGS.LIST, { params })
  },

  // 获取开课信息列表（使用视图）
  getInfoList: (params?: PageQuery): Promise<ApiResponse<PageResponse<CourseOfferingInfo>>> => {
    return request.get(API_ENDPOINTS.COURSE_OFFERINGS.INFO_LIST, { params })
  },

  // 获取开课详情
  getDetail: (id: number): Promise<ApiResponse<CourseOffering | null>> => {
    return request.get(API_ENDPOINTS.COURSE_OFFERINGS.DETAIL(id))
  },

  // 根据学期获取开课列表
  getBySemester: (semester: string): Promise<ApiResponse<CourseOffering[]>> => {
    return request.get(API_ENDPOINTS.COURSE_OFFERINGS.BY_SEMESTER(semester))
  },

  // 根据教师获取开课列表
  getByTeacher: (teacherId: number): Promise<ApiResponse<CourseOffering[]>> => {
    return request.get(API_ENDPOINTS.COURSE_OFFERINGS.BY_TEACHER(teacherId))
  },

  // 根据课程获取开课列表
  getByCourse: (courseId: number): Promise<ApiResponse<CourseOffering[]>> => {
    return request.get(API_ENDPOINTS.COURSE_OFFERINGS.BY_COURSE(courseId))
  },

  // 获取我的开课（教师）
  getMyCourses: (): Promise<ApiResponse<CourseOfferingInfo[]>> => {
    return request.get(API_ENDPOINTS.COURSE_OFFERINGS.MY_COURSES)
  },

  // 创建开课
  create: (data: CreateCourseOfferingData): Promise<ApiResponse<CourseOffering>> => {
    return request.post(API_ENDPOINTS.COURSE_OFFERINGS.CREATE, data)
  },

  // 更新开课
  update: (id: number, data: UpdateCourseOfferingData): Promise<ApiResponse<CourseOffering | null>> => {
    return request.put(API_ENDPOINTS.COURSE_OFFERINGS.UPDATE(id), data)
  },

  // 删除开课
  delete: (id: number): Promise<ApiResponse<null>> => {
    return request.delete(API_ENDPOINTS.COURSE_OFFERINGS.DELETE(id))
  }
}

// ========================================
// 选课管理API
// ========================================
export const enrollmentApi = {
  // 获取选课列表
  getList: (params?: EnrollmentQuery): Promise<ApiResponse<PageResponse<Enrollment>>> => {
    return request.get(API_ENDPOINTS.ENROLLMENTS.LIST, { params })
  },

  // 获取选课详情
  getDetail: (id: number): Promise<ApiResponse<Enrollment | null>> => {
    return request.get(API_ENDPOINTS.ENROLLMENTS.DETAIL(id))
  },

  // 根据学生获取选课列表
  getByStudent: (studentId: number): Promise<ApiResponse<Enrollment[]>> => {
    return request.get(API_ENDPOINTS.ENROLLMENTS.BY_STUDENT(studentId))
  },

  // 根据开课获取选课列表
  getByOffering: (offeringId: number): Promise<ApiResponse<Enrollment[]>> => {
    return request.get(API_ENDPOINTS.ENROLLMENTS.BY_OFFERING(offeringId))
  },

  // 获取我的选课（学生）
  getMyEnrollments: (): Promise<ApiResponse<Enrollment[]>> => {
    return request.get(API_ENDPOINTS.ENROLLMENTS.MY_ENROLLMENTS)
  },

  // 创建选课
  create: (data: CreateEnrollmentData): Promise<ApiResponse<Enrollment>> => {
    return request.post(API_ENDPOINTS.ENROLLMENTS.CREATE, data)
  },

  // 更新选课
  update: (id: number, data: { status?: number }): Promise<ApiResponse<Enrollment | null>> => {
    return request.put(API_ENDPOINTS.ENROLLMENTS.UPDATE(id), data)
  },

  // 删除选课
  delete: (id: number): Promise<ApiResponse<null>> => {
    return request.delete(API_ENDPOINTS.ENROLLMENTS.DELETE(id))
  },

  // 审批选课
  approve: (id: number): Promise<ApiResponse<null>> => {
    return request.post(API_ENDPOINTS.ENROLLMENTS.APPROVE(id))
  },

  // 拒绝选课
  reject: (id: number): Promise<ApiResponse<null>> => {
    return request.post(API_ENDPOINTS.ENROLLMENTS.REJECT(id))
  },

  // 退课
  withdraw: (id: number): Promise<ApiResponse<null>> => {
    return request.post(API_ENDPOINTS.ENROLLMENTS.WITHDRAW(id))
  }
}

// ========================================
// 成绩管理API
// ========================================
export const gradeApi = {
  // 获取成绩列表
  getList: (params?: GradeQuery): Promise<ApiResponse<PageResponse<Grade>>> => {
    return request.get(API_ENDPOINTS.GRADES.LIST, { params })
  },

  // 获取成绩详情
  getDetail: (id: number): Promise<ApiResponse<Grade | null>> => {
    return request.get(API_ENDPOINTS.GRADES.DETAIL(id))
  },

  // 根据选课获取成绩
  getByEnrollment: (enrollmentId: number): Promise<ApiResponse<Grade | null>> => {
    return request.get(API_ENDPOINTS.GRADES.BY_ENROLLMENT(enrollmentId))
  },

  // 根据学生获取成绩列表
  getByStudent: (studentId: number): Promise<ApiResponse<Grade[]>> => {
    return request.get(API_ENDPOINTS.GRADES.BY_STUDENT(studentId))
  },

  // 根据开课获取成绩列表
  getByOffering: (offeringId: number): Promise<ApiResponse<Grade[]>> => {
    return request.get(API_ENDPOINTS.GRADES.BY_OFFERING(offeringId))
  },

  // 获取我的成绩（学生）
  getMyGrades: (): Promise<ApiResponse<StudentGrade[]>> => {
    return request.get(API_ENDPOINTS.GRADES.MY_GRADES)
  },

  // 获取课程成绩（教师录入）
  getCourseGrades: (offeringId: number): Promise<ApiResponse<Grade[]>> => {
    return request.get(API_ENDPOINTS.GRADES.COURSE_GRADES(offeringId))
  },

  // 获取学生成绩详情（使用视图）
  getStudentGrades: (params?: PageQuery): Promise<ApiResponse<PageResponse<StudentGrade>>> => {
    return request.get(API_ENDPOINTS.GRADES.STUDENT_GRADES, { params })
  },

  // 更新成绩
  update: (id: number, data: UpdateGradeData): Promise<ApiResponse<Grade | null>> => {
    return request.put(API_ENDPOINTS.GRADES.UPDATE(id), data)
  },

  // 批量更新成绩
  batchUpdate: (grades: Array<{ enrollment_id: number } & UpdateGradeData>): Promise<ApiResponse<null>> => {
    return request.post(API_ENDPOINTS.GRADES.BATCH_UPDATE, { grades })
  }
}

export default {
  courseApi,
  courseOfferingApi,
  enrollmentApi,
  gradeApi
}
