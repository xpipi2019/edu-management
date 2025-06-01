import type { PageQuery } from './common'
import type { User, Teacher, Student } from './user'

// 重新导出用户相关类型
export type { Teacher, Student } from './user'

// 教室信息
export interface Classroom {
  id: number
  name: string
  building: string
  capacity: number
  type?: string
  location?: string
  status: ClassroomStatus
  createdAt: string
  updatedAt: string
}

// 教室状态枚举
export enum ClassroomStatus {
  AVAILABLE = 'AVAILABLE',      // 可用
  OCCUPIED = 'OCCUPIED',        // 占用中
  MAINTENANCE = 'MAINTENANCE',  // 维护中
  DISABLED = 'DISABLED'         // 停用
}

// 课程基本信息
export interface Course {
  id: number
  name: string
  code: string
  credits: number
  hours: number
  type: CourseType
  description?: string
  prerequisiteIds?: number[]
  prerequisites?: Course[]
  status: CourseStatus
  createdAt: string
  updatedAt: string
}

// 课程类型枚举
export enum CourseType {
  REQUIRED = 'REQUIRED',        // 必修课
  ELECTIVE = 'ELECTIVE',        // 选修课
  PUBLIC = 'PUBLIC',            // 公共课
  PROFESSIONAL = 'PROFESSIONAL' // 专业课
}

// 课程状态枚举
export enum CourseStatus {
  DRAFT = 'DRAFT',              // 草稿
  PUBLISHED = 'PUBLISHED',      // 已发布
  ARCHIVED = 'ARCHIVED'         // 已归档
}

// 开课信息
export interface CourseOffering {
  id: number
  courseId: number
  course: Course
  teacherId: number
  teacher: Teacher
  semester: string
  academicYear: string
  maxStudents: number
  currentStudents: number
  classroom?: string
  schedules: Schedule[]
  status: OfferingStatus
  createdAt: string
  updatedAt: string
}

// 开课状态枚举
export enum OfferingStatus {
  DRAFT = 'DRAFT',              // 草稿
  PENDING = 'PENDING',          // 待审核（教师申请）
  APPROVED = 'APPROVED',        // 已批准
  PUBLISHED = 'PUBLISHED',      // 已发布
  ENROLLMENT = 'ENROLLMENT',    // 选课中
  TEACHING = 'TEACHING',        // 教学中
  COMPLETED = 'COMPLETED',      // 已完成
  CANCELLED = 'CANCELLED',      // 已取消
  REJECTED = 'REJECTED'         // 已拒绝
}

// 课程表/排课信息
export interface Schedule {
  id: number
  courseOfferingId: number
  courseOffering?: CourseOffering
  dayOfWeek: number             // 1-7 (周一到周日)
  startTime: number             // 第几节课开始
  endTime: number               // 第几节课结束
  classroom: string
  weeks: number[]               // 上课周次
  createdAt: string
  updatedAt: string
}

// 选课记录
export interface Enrollment {
  id: number
  studentId: number
  student: Student
  courseOfferingId: number
  courseOffering: CourseOffering
  enrollmentDate: string
  status: EnrollmentStatus
  grade?: Grade
  createdAt: string
  updatedAt: string
}

// 选课状态枚举
export enum EnrollmentStatus {
  PENDING = 'PENDING',          // 待审核
  APPROVED = 'APPROVED',        // 已批准
  REJECTED = 'REJECTED',        // 已拒绝
  DROPPED = 'DROPPED'           // 已退课
}

// 成绩信息
export interface Grade {
  id: number
  enrollmentId: number
  enrollment?: Enrollment
  regularScore?: number         // 平时成绩
  midtermScore?: number         // 期中成绩
  finalScore?: number           // 期末成绩
  totalScore?: number           // 总成绩
  gradeLevel?: string           // 等级 (A/B/C/D/F)
  gpa?: number                  // 绩点
  createdAt: string
  updatedAt: string
}

// 课程查询参数
export interface CourseQuery extends PageQuery {
  name?: string
  code?: string
  type?: CourseType
  status?: CourseStatus
  credits?: number
}

// 开课查询参数
export interface CourseOfferingQuery extends PageQuery {
  courseId?: number
  teacherId?: number
  semester?: string
  academicYear?: string
  status?: OfferingStatus
}

// 选课查询参数
export interface EnrollmentQuery extends PageQuery {
  studentId?: number
  courseOfferingId?: number
  status?: EnrollmentStatus
  semester?: string
  academicYear?: string
}

// 创建课程数据
export interface CreateCourseData {
  name: string
  code: string
  credits: number
  hours: number
  type: CourseType
  description?: string
  prerequisiteIds?: number[]
}

// 更新课程数据
export interface UpdateCourseData {
  name?: string
  code?: string
  credits?: number
  hours?: number
  type?: CourseType
  description?: string
  prerequisiteIds?: number[]
  status?: CourseStatus
}

// 创建开课数据
export interface CreateCourseOfferingData {
  courseId: number
  teacherId: number
  semester: string
  academicYear: string
  maxStudents: number
  classroom?: string
  schedules: CreateScheduleData[]
}

// 更新开课数据
export interface UpdateCourseOfferingData {
  teacherId?: number
  semester?: string
  academicYear?: string
  maxStudents?: number
  classroom?: string
  schedules?: CreateScheduleData[]
  status?: OfferingStatus
}

// 创建排课数据
export interface CreateScheduleData {
  dayOfWeek: number
  startTime: number
  endTime: number
  classroom: string
  weeks: number[]
}

// 创建选课数据
export interface CreateEnrollmentData {
  studentId: number
  courseOfferingId: number
}

// 批量成绩更新数据
export interface BatchGradeUpdateData {
  grades: Array<{
    enrollmentId: number
    regularScore?: number
    midtermScore?: number
    finalScore?: number
  }>
}

// 课程统计信息
export interface CourseStats {
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  archivedCourses: number
  totalOfferings: number
  activeOfferings: number
}

// 教师课程统计
export interface TeacherCourseStats {
  totalCourses: number
  activeCourses: number
  completedCourses: number
  totalStudents: number
}

// 学生选课统计
export interface StudentEnrollmentStats {
  totalEnrollments: number
  approvedEnrollments: number
  pendingEnrollments: number
  totalCredits: number
  gpa: number
}
