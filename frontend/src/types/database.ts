import type { PageQuery } from './common'

// ========================================
// 基础用户类型
// ========================================
export interface User {
  user_id: number
  username: string
  password?: string // 仅在创建/更新时使用
  email?: string
  phone?: string
  real_name: string
  status: UserStatus
  created_at: string
  updated_at: string
  roles?: Role[]
  permissions?: string[]
}

export enum UserStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  LOCKED = 2
}

// ========================================
// 角色和权限
// ========================================
export interface Role {
  role_id: number
  role_name: string
  role_code: string
  description?: string
  status: RoleStatus
  created_at: string
  permissions?: Permission[]
}

export enum RoleStatus {
  INACTIVE = 0,
  ACTIVE = 1
}

export interface Permission {
  permission_id: number
  permission_name: string
  permission_code: string
  module: string
  description?: string
  status: PermissionStatus
}

export enum PermissionStatus {
  INACTIVE = 0,
  ACTIVE = 1
}

// ========================================
// 部门
// ========================================
export interface Department {
  dept_id: number
  dept_name: string
  dept_code: string
  parent_id?: number
  description?: string
  status: DepartmentStatus
  children?: Department[]
}

export enum DepartmentStatus {
  INACTIVE = 0,
  ACTIVE = 1
}

// ========================================
// 教师
// ========================================
export interface Teacher {
  teacher_id: number
  user_id: number
  teacher_no: string
  dept_id?: number
  title?: string
  hire_date?: string
  status: TeacherStatus
  user?: User
  department?: Department
}

export enum TeacherStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  SUSPENDED = 2
}

// ========================================
// 学生
// ========================================
export interface Student {
  student_id: number
  user_id: number
  student_no: string
  dept_id?: number
  class_name?: string
  grade?: number
  enrollment_year?: number
  graduation_year?: number
  user?: User
  department?: Department
}

// ========================================
// 课程
// ========================================
export interface Course {
  course_id: number
  course_code: string
  course_name: string
  dept_id?: number
  credits: number
  hours: number
  course_type: CourseType
  description?: string
  status: CourseStatus
  department?: Department
}

export enum CourseType {
  REQUIRED = '必修',
  ELECTIVE = '选修',
  PUBLIC_ELECTIVE = '公选'
}

export enum CourseStatus {
  INACTIVE = 0,
  ACTIVE = 1
}

// ========================================
// 开课
// ========================================
export interface CourseOffering {
  offering_id: number
  course_id: number
  teacher_id: number
  semester: string
  max_students: number
  current_students: number
  status: OfferingStatus
  course?: Course
  teacher?: Teacher
}

export enum OfferingStatus {
  INACTIVE = 0,
  ACTIVE = 1
}

// ========================================
// 选课
// ========================================
export interface Enrollment {
  enrollment_id: number
  student_id: number
  offering_id: number
  enrollment_date: string
  status: EnrollmentStatus
  student?: Student
  course_offering?: CourseOffering
}

export enum EnrollmentStatus {
  WITHDRAWN = 0,
  ENROLLED = 1,
  PENDING = 2
}

// ========================================
// 成绩
// ========================================
export interface Grade {
  grade_id: number
  enrollment_id: number
  usual_score?: number
  exam_score?: number
  final_score?: number
  grade_point?: number
  recorded_by?: number
  recorded_at?: string
  enrollment?: Enrollment
  recorder?: Teacher
}

// ========================================
// 奖惩
// ========================================
export interface RewardPunishment {
  record_id: number
  student_id: number
  type: RewardPunishmentType
  category: string
  description?: string
  occur_date: string
  handler_id?: number
  created_at: string
  student?: Student
  handler?: User
}

export enum RewardPunishmentType {
  REWARD = '奖励',
  PUNISHMENT = '惩罚'
}

// ========================================
// 学籍状态
// ========================================
export interface StudentStatus {
  status_id: number
  student_id: number
  status_type: StudentStatusType
  effective_date: string
  end_date?: string
  reason?: string
  handler_id?: number
  created_at: string
  student?: Student
  handler?: User
}

export enum StudentStatusType {
  ENROLLED = '在读',
  SUSPENDED = '休学',
  GRADUATED = '毕业'
}

// ========================================
// 教室
// ========================================
export interface Classroom {
  classroom_id: number
  room_no: string
  building: string
  floor?: number
  capacity: number
  room_type: ClassroomType
  equipment?: string
  status: ClassroomStatus
}

export enum ClassroomType {
  NORMAL = '普通教室',
  LAB = '实验室',
  MULTIMEDIA = '多媒体教室',
  COMPUTER = '机房'
}

export enum ClassroomStatus {
  INACTIVE = 0,
  ACTIVE = 1,
  MAINTENANCE = 2
}

// ========================================
// 排课
// ========================================
export interface Schedule {
  schedule_id: number
  offering_id: number
  classroom_id: number
  day_of_week: number // 1-7 表示周一到周日
  start_time: string
  end_time: string
  weeks: string // 例如: "1-16" 或 "1-8,10-16"
  course_offering?: CourseOffering
  classroom?: Classroom
}

// ========================================
// 查询参数类型
// ========================================
export interface UserQuery extends PageQuery {
  username?: string
  real_name?: string
  email?: string
  status?: UserStatus
  role_code?: string
}

export interface RoleQuery extends PageQuery {
  role_name?: string
  role_code?: string
  status?: RoleStatus
}

export interface TeacherQuery extends PageQuery {
  teacher_no?: string
  real_name?: string
  dept_id?: number
  title?: string
  status?: TeacherStatus
}

export interface StudentQuery extends PageQuery {
  student_no?: string
  real_name?: string
  dept_id?: number
  class_name?: string
  grade?: number
  enrollment_year?: number
}

export interface CourseQuery extends PageQuery {
  course_code?: string
  course_name?: string
  dept_id?: number
  course_type?: CourseType
  status?: CourseStatus
}

export interface CourseOfferingQuery extends PageQuery {
  semester?: string
  course_id?: number
  teacher_id?: number
  dept_id?: number
  status?: OfferingStatus
}

export interface EnrollmentQuery extends PageQuery {
  student_id?: number
  offering_id?: number
  semester?: string
  status?: EnrollmentStatus
}

export interface GradeQuery extends PageQuery {
  student_id?: number
  offering_id?: number
  semester?: string
  course_id?: number
}

export interface ScheduleQuery extends PageQuery {
  semester?: string
  academic_year?: string
  course_id?: number
  teacher_id?: number
  classroom_id?: number
  day_of_week?: number
}

export interface ClassroomQuery extends PageQuery {
  room_no?: string
  building?: string
  room_type?: ClassroomType
  status?: ClassroomStatus
  min_capacity?: number
}

export interface RewardPunishmentQuery extends PageQuery {
  student_id?: number
  type?: RewardPunishmentType
  category?: string
  start_date?: string
  end_date?: string
}

export interface StudentStatusQuery extends PageQuery {
  student_id?: number
  status_type?: StudentStatusType
  start_date?: string
  end_date?: string
}

// ========================================
// 创建/更新数据类型
// ========================================
export interface CreateUserData {
  username: string
  password: string
  email?: string
  phone?: string
  real_name: string
  status?: UserStatus
  role_ids?: number[]
}

export interface UpdateUserData {
  username?: string
  email?: string
  phone?: string
  real_name?: string
  status?: UserStatus
  role_ids?: number[]
}

export interface CreateTeacherData {
  user_data: CreateUserData
  teacher_no: string
  dept_id?: number
  title?: string
  hire_date?: string
  status?: TeacherStatus
}

export interface UpdateTeacherData {
  user_data?: UpdateUserData
  teacher_no?: string
  dept_id?: number
  title?: string
  hire_date?: string
  status?: TeacherStatus
}

export interface CreateStudentData {
  user_data: CreateUserData
  student_no: string
  dept_id?: number
  class_name?: string
  grade?: number
  enrollment_year?: number
  graduation_year?: number
}

export interface UpdateStudentData {
  user_data?: UpdateUserData
  student_no?: string
  dept_id?: number
  class_name?: string
  grade?: number
  enrollment_year?: number
  graduation_year?: number
}

export interface CreateCourseData {
  course_code: string
  course_name: string
  dept_id?: number
  credits: number
  hours: number
  course_type: CourseType
  description?: string
  status?: CourseStatus
}

export interface UpdateCourseData extends Partial<CreateCourseData> {}

export interface CreateCourseOfferingData {
  course_id: number
  teacher_id: number
  semester: string
  max_students?: number
  status?: OfferingStatus
}

export interface UpdateCourseOfferingData extends Partial<CreateCourseOfferingData> {}

export interface CreateEnrollmentData {
  student_id: number
  offering_id: number
}

export interface UpdateGradeData {
  usual_score?: number
  exam_score?: number
}

export interface CreateScheduleData {
  offering_id: number
  classroom_id: number
  day_of_week: number
  start_time: string
  end_time: string
  weeks: string
}

export interface UpdateScheduleData extends Partial<CreateScheduleData> {}

export interface CreateClassroomData {
  room_no: string
  building: string
  floor?: number
  capacity: number
  room_type: ClassroomType
  equipment?: string
  status?: ClassroomStatus
}

export interface UpdateClassroomData extends Partial<CreateClassroomData> {}

export interface CreateRewardPunishmentData {
  student_id: number
  type: RewardPunishmentType
  category: string
  description?: string
  occur_date: string
}

export interface UpdateRewardPunishmentData extends Partial<CreateRewardPunishmentData> {}

export interface CreateStudentStatusData {
  student_id: number
  status_type: StudentStatusType
  effective_date: string
  end_date?: string
  reason?: string
}

export interface UpdateStudentStatusData extends Partial<CreateStudentStatusData> {}

export interface CreateRoleData {
  role_name: string
  role_code: string
  description?: string
  status?: RoleStatus
  permission_ids?: number[]
}

export interface UpdateRoleData extends Partial<CreateRoleData> {}

export interface CreateDepartmentData {
  dept_name: string
  dept_code: string
  parent_id?: number
  description?: string
  status?: DepartmentStatus
}

export interface UpdateDepartmentData extends Partial<CreateDepartmentData> {}

// ========================================
// 统计和视图类型
// ========================================
export interface StudentInfo {
  student_id: number
  student_no: string
  real_name: string
  email?: string
  phone?: string
  dept_name?: string
  class_name?: string
  grade?: number
  enrollment_year?: number
  graduation_year?: number
}

export interface TeacherInfo {
  teacher_id: number
  teacher_no: string
  real_name: string
  email?: string
  phone?: string
  dept_name?: string
  title?: string
  hire_date?: string
}

export interface CourseOfferingInfo {
  offering_id: number
  course_code: string
  course_name: string
  credits: number
  hours: number
  course_type: CourseType
  teacher_name: string
  dept_name?: string
  semester: string
  max_students: number
  current_students: number
  enrollment_rate: number
}

export interface StudentGrade {
  student_no: string
  student_name: string
  course_code: string
  course_name: string
  credits: number
  usual_score?: number
  exam_score?: number
  final_score?: number
  grade_point?: number
  semester: string
  grade_level?: string
}

export interface ScheduleInfo {
  schedule_id: number
  course_name: string
  teacher_name: string
  room_no: string
  building: string
  day_name: string
  start_time: string
  end_time: string
  weeks: string
  semester: string
}

// ========================================
// 登录相关
// ========================================
export interface LoginForm {
  username: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  token: string
  refresh_token: string
  user: User
}

// ========================================
// 工具类型
// ========================================
export interface BatchOperationData {
  ids: number[]
}

export interface ResetPasswordData {
  user_id: number
  new_password?: string // 如果不提供，系统生成默认密码
}

export interface ToggleStatusData {
  user_id: number
  status: UserStatus
}

export interface StudentTranscript {
  student_info: StudentInfo
  grades: StudentGrade[]
  gpa?: number
  total_credits?: number
}

export interface StudentGPA {
  student_no: string
  student_name: string
  gpa: number
  total_credits: number
  course_count: number
}
