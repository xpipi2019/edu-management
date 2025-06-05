import type {
  User, Role, Permission, Department, Teacher, Student, Course, CourseOffering,
  Enrollment, Grade, RewardPunishment, StudentStatus, Classroom, Schedule,
  StudentInfo, TeacherInfo, CourseOfferingInfo,
  StudentGrade, ScheduleInfo
} from '../types/database'

import {
  UserStatus, RoleStatus, TeacherStatus, CourseType, CourseStatus,
  OfferingStatus, EnrollmentStatus, RewardPunishmentType, StudentStatusType,
  ClassroomType, ClassroomStatus
} from '../types/database'

import { Permission as PermissionEnum } from '../constants/permission'

// ========================================
// 权限数据
// ========================================
export const mockPermissions: Permission[] = [
  // 用户管理权限
  { permission_id: 1, permission_name: '用户管理', permission_code: 'USER_MANAGE', module: '用户管理', status: 1 },
  { permission_id: 2, permission_name: '创建用户', permission_code: 'USER_CREATE', module: '用户管理', status: 1 },
  { permission_id: 3, permission_name: '更新用户', permission_code: 'USER_UPDATE', module: '用户管理', status: 1 },
  { permission_id: 4, permission_name: '删除用户', permission_code: 'USER_DELETE', module: '用户管理', status: 1 },
  { permission_id: 5, permission_name: '查看用户', permission_code: 'USER_VIEW', module: '用户管理', status: 1 },
  { permission_id: 6, permission_name: '编辑用户', permission_code: 'USER_EDIT', module: '用户管理', status: 1 },

  // 角色管理权限
  { permission_id: 7, permission_name: '角色管理', permission_code: 'ROLE_MANAGE', module: '角色管理', status: 1 },
  { permission_id: 8, permission_name: '创建角色', permission_code: 'ROLE_CREATE', module: '角色管理', status: 1 },
  { permission_id: 9, permission_name: '更新角色', permission_code: 'ROLE_UPDATE', module: '角色管理', status: 1 },
  { permission_id: 10, permission_name: '删除角色', permission_code: 'ROLE_DELETE', module: '角色管理', status: 1 },
  { permission_id: 11, permission_name: '查看角色', permission_code: 'ROLE_VIEW', module: '角色管理', status: 1 },
  { permission_id: 12, permission_name: '编辑角色', permission_code: 'ROLE_EDIT', module: '角色管理', status: 1 },

  // 课程管理权限
  { permission_id: 13, permission_name: '课程管理', permission_code: 'COURSE_MANAGE', module: '课程管理', status: 1 },
  { permission_id: 14, permission_name: '创建课程', permission_code: 'COURSE_CREATE', module: '课程管理', status: 1 },
  { permission_id: 15, permission_name: '更新课程', permission_code: 'COURSE_UPDATE', module: '课程管理', status: 1 },
  { permission_id: 16, permission_name: '删除课程', permission_code: 'COURSE_DELETE', module: '课程管理', status: 1 },
  { permission_id: 17, permission_name: '查看课程', permission_code: 'COURSE_VIEW', module: '课程管理', status: 1 },
  { permission_id: 18, permission_name: '编辑课程', permission_code: 'COURSE_EDIT', module: '课程管理', status: 1 },

  // 开课管理权限
  { permission_id: 19, permission_name: '开课管理', permission_code: 'COURSE_OFFERING_MANAGE', module: '开课管理', status: 1 },
  { permission_id: 20, permission_name: '创建开课', permission_code: 'COURSE_OFFERING_CREATE', module: '开课管理', status: 1 },
  { permission_id: 21, permission_name: '更新开课', permission_code: 'COURSE_OFFERING_UPDATE', module: '开课管理', status: 1 },
  { permission_id: 22, permission_name: '删除开课', permission_code: 'COURSE_OFFERING_DELETE', module: '开课管理', status: 1 },
  { permission_id: 23, permission_name: '查看开课', permission_code: 'COURSE_OFFERING_VIEW', module: '开课管理', status: 1 },
  { permission_id: 24, permission_name: '编辑开课', permission_code: 'COURSE_OFFERING_EDIT', module: '开课管理', status: 1 },

  // 选课管理权限
  { permission_id: 25, permission_name: '选课管理', permission_code: 'ENROLLMENT_MANAGE', module: '选课管理', status: 1 },
  { permission_id: 26, permission_name: '审批选课', permission_code: 'ENROLLMENT_APPROVE', module: '选课管理', status: 1 },
  { permission_id: 27, permission_name: '查看选课', permission_code: 'ENROLLMENT_VIEW', module: '选课管理', status: 1 },
  { permission_id: 28, permission_name: '创建选课', permission_code: 'ENROLLMENT_CREATE', module: '选课管理', status: 1 },
  { permission_id: 29, permission_name: '编辑选课', permission_code: 'ENROLLMENT_EDIT', module: '选课管理', status: 1 },
  { permission_id: 30, permission_name: '删除选课', permission_code: 'ENROLLMENT_DELETE', module: '选课管理', status: 1 },

  // 成绩管理权限
  { permission_id: 31, permission_name: '成绩管理', permission_code: 'GRADE_MANAGE', module: '成绩管理', status: 1 },
  { permission_id: 32, permission_name: '录入成绩', permission_code: 'GRADE_INPUT', module: '成绩管理', status: 1 },
  { permission_id: 33, permission_name: '更新成绩', permission_code: 'GRADE_UPDATE', module: '成绩管理', status: 1 },
  { permission_id: 34, permission_name: '查看成绩', permission_code: 'GRADE_VIEW', module: '成绩管理', status: 1 },
  { permission_id: 35, permission_name: '编辑成绩', permission_code: 'GRADE_EDIT', module: '成绩管理', status: 1 },

  // 排课管理权限
  { permission_id: 36, permission_name: '排课管理', permission_code: 'SCHEDULE_MANAGE', module: '排课管理', status: 1 },
  { permission_id: 37, permission_name: '创建排课', permission_code: 'SCHEDULE_CREATE', module: '排课管理', status: 1 },
  { permission_id: 38, permission_name: '更新排课', permission_code: 'SCHEDULE_UPDATE', module: '排课管理', status: 1 },
  { permission_id: 39, permission_name: '删除排课', permission_code: 'SCHEDULE_DELETE', module: '排课管理', status: 1 },
  { permission_id: 40, permission_name: '查看排课', permission_code: 'SCHEDULE_VIEW', module: '排课管理', status: 1 },
  { permission_id: 41, permission_name: '编辑排课', permission_code: 'SCHEDULE_EDIT', module: '排课管理', status: 1 },

  // 学籍管理权限
  { permission_id: 42, permission_name: '学籍管理', permission_code: 'STUDENT_STATUS_MANAGE', module: '学籍管理', status: 1 },
  { permission_id: 43, permission_name: '更新学籍', permission_code: 'STUDENT_STATUS_UPDATE', module: '学籍管理', status: 1 },
  { permission_id: 44, permission_name: '查看学籍', permission_code: 'STUDENT_STATUS_VIEW', module: '学籍管理', status: 1 },

  // 奖惩管理权限
  { permission_id: 45, permission_name: '奖惩管理', permission_code: 'REWARD_PUNISHMENT_MANAGE', module: '奖惩管理', status: 1 },
  { permission_id: 46, permission_name: '创建奖惩', permission_code: 'REWARD_PUNISHMENT_CREATE', module: '奖惩管理', status: 1 },
  { permission_id: 47, permission_name: '更新奖惩', permission_code: 'REWARD_PUNISHMENT_UPDATE', module: '奖惩管理', status: 1 },
  { permission_id: 48, permission_name: '删除奖惩', permission_code: 'REWARD_PUNISHMENT_DELETE', module: '奖惩管理', status: 1 },
  { permission_id: 49, permission_name: '查看奖惩', permission_code: 'REWARD_PUNISHMENT_VIEW', module: '奖惩管理', status: 1 },

  // 系统管理权限
  { permission_id: 50, permission_name: '系统管理', permission_code: 'SYSTEM_MANAGE', module: '系统管理', status: 1 },
  { permission_id: 51, permission_name: '部门管理', permission_code: 'DEPARTMENT_MANAGE', module: '系统管理', status: 1 },
  { permission_id: 52, permission_name: '教室管理', permission_code: 'CLASSROOM_MANAGE', module: '系统管理', status: 1 },
  { permission_id: 53, permission_name: '查看部门', permission_code: 'DEPARTMENT_VIEW', module: '系统管理', status: 1 },
  { permission_id: 54, permission_name: '创建部门', permission_code: 'DEPARTMENT_CREATE', module: '系统管理', status: 1 },
  { permission_id: 55, permission_name: '编辑部门', permission_code: 'DEPARTMENT_EDIT', module: '系统管理', status: 1 },
  { permission_id: 56, permission_name: '删除部门', permission_code: 'DEPARTMENT_DELETE', module: '系统管理', status: 1 },

  // 教师管理权限
  { permission_id: 57, permission_name: '教师管理', permission_code: 'TEACHER_MANAGE', module: '教师管理', status: 1 },
  { permission_id: 58, permission_name: '查看教师', permission_code: 'TEACHER_VIEW', module: '教师管理', status: 1 },
  { permission_id: 59, permission_name: '创建教师', permission_code: 'TEACHER_CREATE', module: '教师管理', status: 1 },
  { permission_id: 60, permission_name: '编辑教师', permission_code: 'TEACHER_EDIT', module: '教师管理', status: 1 },
  { permission_id: 61, permission_name: '删除教师', permission_code: 'TEACHER_DELETE', module: '教师管理', status: 1 },

  // 学生管理权限
  { permission_id: 62, permission_name: '学生管理', permission_code: 'STUDENT_MANAGE', module: '学生管理', status: 1 },
  { permission_id: 63, permission_name: '查看学生', permission_code: 'STUDENT_VIEW', module: '学生管理', status: 1 },
  { permission_id: 64, permission_name: '创建学生', permission_code: 'STUDENT_CREATE', module: '学生管理', status: 1 },
  { permission_id: 65, permission_name: '编辑学生', permission_code: 'STUDENT_EDIT', module: '学生管理', status: 1 },
  { permission_id: 66, permission_name: '删除学生', permission_code: 'STUDENT_DELETE', module: '学生管理', status: 1 },

  // 教师业务权限
  { permission_id: 67, permission_name: '查看我的课程', permission_code: 'MY_COURSES_VIEW', module: '教师业务', status: 1 },
  { permission_id: 68, permission_name: '查看学生名单', permission_code: 'STUDENT_LIST_VIEW', module: '教师业务', status: 1 },
  { permission_id: 69, permission_name: '录入成绩', permission_code: 'GRADE_INPUT', module: '教师业务', status: 1 },
  { permission_id: 70, permission_name: '查看课程安排', permission_code: 'SCHEDULE_VIEW', module: '教师业务', status: 1 },

  // 学生业务权限
  { permission_id: 71, permission_name: '查看课程信息', permission_code: 'COURSE_INFO_VIEW', module: '学生业务', status: 1 },
  { permission_id: 72, permission_name: '选课操作', permission_code: 'ENROLLMENT_CREATE', module: '学生业务', status: 1 },
  { permission_id: 73, permission_name: '退课操作', permission_code: 'ENROLLMENT_DROP', module: '学生业务', status: 1 },
  { permission_id: 74, permission_name: '查看我的选课', permission_code: 'MY_ENROLLMENT_VIEW', module: '学生业务', status: 1 },
  { permission_id: 75, permission_name: '查看我的成绩', permission_code: 'MY_GRADE_VIEW', module: '学生业务', status: 1 }
]

// ========================================
// 角色数据
// ========================================
export const mockRoles: Role[] = [
  {
    role_id: 1,
    role_name: '超级管理员',
    role_code: 'SUPER_ADMIN',
    description: '系统超级管理员，拥有所有管理权限',
    status: RoleStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    permissions: mockPermissions.filter(p =>
      !['学生业务', '教师业务'].includes(p.module)
    )
  },
  {
    role_id: 2,
    role_name: '教务管理员',
    role_code: 'ACADEMIC_ADMIN',
    description: '教务管理员，负责课程、选课、成绩等管理',
    status: RoleStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    permissions: mockPermissions.filter(p =>
      ['课程管理', '开课管理', '选课管理', '成绩管理', '排课管理', '系统管理', '教师管理', '用户管理', '角色管理', '部门管理'].includes(p.module)
    )
  },
  {
    role_id: 3,
    role_name: '学生管理员',
    role_code: 'STUDENT_ADMIN',
    description: '学生管理员，负责学生、学籍、奖惩等管理',
    status: RoleStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    permissions: mockPermissions.filter(p =>
      ['学生管理', '学籍管理', '奖惩管理', '系统管理'].includes(p.module)
    )
  },
  {
    role_id: 4,
    role_name: '教师',
    role_code: 'TEACHER',
    description: '教师角色，可以管理自己的课程和录入成绩',
    status: RoleStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    permissions: mockPermissions.filter(p =>
      ['教师业务', '成绩管理'].includes(p.module) ||
      ['GRADE_INPUT', 'GRADE_UPDATE', 'GRADE_VIEW'].includes(p.permission_code)
    )
  },
  {
    role_id: 5,
    role_name: '学生',
    role_code: 'STUDENT',
    description: '学生角色，可以选课和查看成绩',
    status: RoleStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    permissions: mockPermissions.filter(p =>
      ['学生业务'].includes(p.module)
    )
  }
]

// ========================================
// 部门数据
// ========================================
export const mockDepartments: Department[] = [
  {
    dept_id: 1,
    dept_name: '教务处',
    dept_code: 'EDU',
    description: '负责教学管理和教务工作',
    status: 1
  },
  {
    dept_id: 2,
    dept_name: '计算机科学与技术学院',
    dept_code: 'CS',
    description: '计算机相关专业',
    status: 1
  },
  {
    dept_id: 3,
    dept_name: '数学与统计学院',
    dept_code: 'MATH',
    description: '数学相关专业',
    status: 1
  },
  {
    dept_id: 4,
    dept_name: '外国语学院',
    dept_code: 'FL',
    description: '外语相关专业',
    status: 1
  },
  {
    dept_id: 5,
    dept_name: '经济管理学院',
    dept_code: 'EM',
    description: '经管相关专业',
    status: 1
  }
]

// ========================================
// 用户数据
// ========================================
export const mockUsers: User[] = [
  {
    user_id: 1,
    username: 'admin',
    real_name: '系统管理员',
    email: 'admin@school.edu.cn',
    phone: '13800138001',
    status: UserStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    roles: [mockRoles[0]]
  },
  {
    user_id: 2,
    username: 'academic_admin',
    real_name: '教务管理员',
    email: 'academic@school.edu.cn',
    phone: '13800138002',
    status: UserStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    roles: [mockRoles[1]]
  },
  {
    user_id: 3,
    username: 'student_admin',
    real_name: '学生管理员',
    email: 'student_admin@school.edu.cn',
    phone: '13800138003',
    status: UserStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    roles: [mockRoles[2]]
  },
  // 教师用户
  {
    user_id: 4,
    username: 'teacher001',
    real_name: '张教授',
    email: 'zhang@school.edu.cn',
    phone: '13800138004',
    status: UserStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    roles: [mockRoles[3]]
  },
  {
    user_id: 5,
    username: 'teacher002',
    real_name: '李副教授',
    email: 'li@school.edu.cn',
    phone: '13800138005',
    status: UserStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    roles: [mockRoles[3]]
  },
  {
    user_id: 6,
    username: 'teacher003',
    real_name: '王讲师',
    email: 'wang.teacher@school.edu.cn',
    phone: '13800138014',
    status: UserStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    roles: [mockRoles[3]]
  },
  {
    user_id: 7,
    username: 'teacher004',
    real_name: '陈副教授',
    email: 'chen@school.edu.cn',
    phone: '13800138015',
    status: UserStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    roles: [mockRoles[3]]
  },
  {
    user_id: 8,
    username: 'teacher005',
    real_name: '刘教授',
    email: 'liu.teacher@school.edu.cn',
    phone: '13800138016',
    status: UserStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    roles: [mockRoles[3]]
  },
  // 学生用户
  {
    user_id: 9,
    username: 'student001',
    real_name: '王小明',
    email: 'wang@stu.school.edu.cn',
    phone: '13800138006',
    status: UserStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    roles: [mockRoles[4]]
  },
  {
    user_id: 10,
    username: 'student002',
    real_name: '刘小红',
    email: 'liu@stu.school.edu.cn',
    phone: '13800138007',
    status: UserStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    roles: [mockRoles[4]]
  },
  {
    user_id: 11,
    username: 'student003',
    real_name: '张小华',
    email: 'zhang.stu@stu.school.edu.cn',
    phone: '13800138008',
    status: UserStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    roles: [mockRoles[4]]
  },
  {
    user_id: 12,
    username: 'student004',
    real_name: '李小强',
    email: 'li.stu@stu.school.edu.cn',
    phone: '13800138009',
    status: UserStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    roles: [mockRoles[4]]
  },
  {
    user_id: 13,
    username: 'student005',
    real_name: '赵小美',
    email: 'zhao@stu.school.edu.cn',
    phone: '13800138010',
    status: UserStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    roles: [mockRoles[4]]
  },
  {
    user_id: 14,
    username: 'student006',
    real_name: '孙小亮',
    email: 'sun@stu.school.edu.cn',
    phone: '13800138011',
    status: UserStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    roles: [mockRoles[4]]
  },
  {
    user_id: 15,
    username: 'student007',
    real_name: '周小丽',
    email: 'zhou@stu.school.edu.cn',
    phone: '13800138012',
    status: UserStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    roles: [mockRoles[4]]
  },
  {
    user_id: 16,
    username: 'student008',
    real_name: '吴小伟',
    email: 'wu@stu.school.edu.cn',
    phone: '13800138013',
    status: UserStatus.ACTIVE,
    created_at: '2024-01-01 00:00:00',
    updated_at: '2024-01-01 00:00:00',
    roles: [mockRoles[4]]
  }
]

// ========================================
// 教师数据
// ========================================
export const mockTeachers: Teacher[] = [
  {
    teacher_id: 1,
    user_id: 4,
    teacher_no: 'T202401001',
    dept_id: 2,
    title: '教授',
    hire_date: '2020-09-01',
    status: TeacherStatus.ACTIVE,
    user: mockUsers[3],
    department: mockDepartments[1]
  },
  {
    teacher_id: 2,
    user_id: 5,
    teacher_no: 'T202401002',
    dept_id: 3,
    title: '副教授',
    hire_date: '2021-09-01',
    status: TeacherStatus.ACTIVE,
    user: mockUsers[4],
    department: mockDepartments[2]
  },
  {
    teacher_id: 3,
    user_id: 6,
    teacher_no: 'T202401003',
    dept_id: 2,
    title: '讲师',
    hire_date: '2022-09-01',
    status: TeacherStatus.ACTIVE,
    user: mockUsers[5],
    department: mockDepartments[1]
  },
  {
    teacher_id: 4,
    user_id: 7,
    teacher_no: 'T202401004',
    dept_id: 3,
    title: '副教授',
    hire_date: '2019-09-01',
    status: TeacherStatus.ACTIVE,
    user: mockUsers[6],
    department: mockDepartments[2]
  },
  {
    teacher_id: 5,
    user_id: 8,
    teacher_no: 'T202401005',
    dept_id: 4,
    title: '教授',
    hire_date: '2018-09-01',
    status: TeacherStatus.ACTIVE,
    user: mockUsers[7],
    department: mockDepartments[3]
  }
]

// ========================================
// 学生数据
// ========================================
export const mockStudents: Student[] = [
  {
    student_id: 1,
    user_id: 9,
    student_no: '2024001001',
    dept_id: 2,
    class_name: '软工2024-1班',
    grade: 2024,
    enrollment_year: 2024,
    user: mockUsers[8],
    department: mockDepartments[1]
  },
  {
    student_id: 2,
    user_id: 10,
    student_no: '2024001002',
    dept_id: 2,
    class_name: '软工2024-1班',
    grade: 2024,
    enrollment_year: 2024,
    user: mockUsers[9],
    department: mockDepartments[1]
  },
  {
    student_id: 3,
    user_id: 11,
    student_no: '2024001003',
    dept_id: 2,
    class_name: '计科2024-1班',
    grade: 2024,
    enrollment_year: 2024,
    user: mockUsers[10],
    department: mockDepartments[1]
  },
  {
    student_id: 4,
    user_id: 12,
    student_no: '2024001004',
    dept_id: 3,
    class_name: '数学2024-1班',
    grade: 2024,
    enrollment_year: 2024,
    user: mockUsers[11],
    department: mockDepartments[2]
  },
  {
    student_id: 5,
    user_id: 13,
    student_no: '2024001005',
    dept_id: 3,
    class_name: '统计2024-1班',
    grade: 2024,
    enrollment_year: 2024,
    user: mockUsers[12],
    department: mockDepartments[2]
  },
  {
    student_id: 6,
    user_id: 14,
    student_no: '2024001006',
    dept_id: 4,
    class_name: '英语2024-1班',
    grade: 2024,
    enrollment_year: 2024,
    user: mockUsers[13],
    department: mockDepartments[3]
  },
  {
    student_id: 7,
    user_id: 15,
    student_no: '2024001007',
    dept_id: 5,
    class_name: '工商2024-1班',
    grade: 2024,
    enrollment_year: 2024,
    user: mockUsers[14],
    department: mockDepartments[4]
  },
  {
    student_id: 8,
    user_id: 16,
    student_no: '2024001008',
    dept_id: 2,
    class_name: '软工2024-2班',
    grade: 2024,
    enrollment_year: 2024,
    user: mockUsers[15],
    department: mockDepartments[1]
  }
]

// ========================================
// 课程数据
// ========================================
export const mockCourses: Course[] = [
  {
    course_id: 1,
    course_code: 'CS101',
    course_name: '程序设计基础',
    dept_id: 2,
    credits: 3.0,
    hours: 48,
    course_type: CourseType.REQUIRED,
    description: '程序设计基础课程，学习C++编程',
    status: CourseStatus.ACTIVE,
    department: mockDepartments[1]
  },
  {
    course_id: 2,
    course_code: 'CS201',
    course_name: '数据结构与算法',
    dept_id: 2,
    credits: 4.0,
    hours: 64,
    course_type: CourseType.REQUIRED,
    description: '数据结构与算法分析',
    status: CourseStatus.ACTIVE,
    department: mockDepartments[1]
  },
  {
    course_id: 3,
    course_code: 'CS301',
    course_name: '数据库系统原理',
    dept_id: 2,
    credits: 3.5,
    hours: 56,
    course_type: CourseType.REQUIRED,
    description: '数据库系统的基本原理和应用',
    status: CourseStatus.ACTIVE,
    department: mockDepartments[1]
  }
]

// ========================================
// 开课数据
// ========================================
export const mockCourseOfferings: CourseOffering[] = [
  {
    offering_id: 1,
    course_id: 1,
    teacher_id: 1,
    semester: '2024-2025-1',
    max_students: 50,
    current_students: 2,
    status: OfferingStatus.ACTIVE,
    course: mockCourses[0],
    teacher: mockTeachers[0]
  },
  {
    offering_id: 2,
    course_id: 2,
    teacher_id: 2,
    semester: '2024-2025-1',
    max_students: 45,
    current_students: 1,
    status: OfferingStatus.ACTIVE,
    course: mockCourses[1],
    teacher: mockTeachers[1]
  }
]

// ========================================
// 选课数据
// ========================================
export const mockEnrollments: Enrollment[] = [
  {
    enrollment_id: 1,
    student_id: 1,
    offering_id: 1,
    enrollment_date: '2024-09-01 10:00:00',
    status: EnrollmentStatus.ENROLLED,
    student: mockStudents[0],
    course_offering: mockCourseOfferings[0]
  },
  {
    enrollment_id: 2,
    student_id: 2,
    offering_id: 1,
    enrollment_date: '2024-09-01 10:30:00',
    status: EnrollmentStatus.ENROLLED,
    student: mockStudents[1],
    course_offering: mockCourseOfferings[0]
  },
  {
    enrollment_id: 3,
    student_id: 1,
    offering_id: 2,
    enrollment_date: '2024-09-01 11:00:00',
    status: EnrollmentStatus.ENROLLED,
    student: mockStudents[0],
    course_offering: mockCourseOfferings[1]
  }
]

// ========================================
// 成绩数据
// ========================================
export const mockGrades: Grade[] = [
  {
    grade_id: 1,
    enrollment_id: 1,
    usual_score: 85,
    exam_score: 88,
    final_score: 87.1,
    grade_point: 3.3,
    recorded_by: 1,
    recorded_at: '2024-12-20 14:00:00',
    enrollment: mockEnrollments[0]
  },
  {
    grade_id: 2,
    enrollment_id: 2,
    usual_score: 78,
    exam_score: 82,
    final_score: 80.8,
    grade_point: 3.0,
    recorded_by: 1,
    recorded_at: '2024-12-20 14:05:00',
    enrollment: mockEnrollments[1]
  }
]

// ========================================
// 教室数据
// ========================================
export const mockClassrooms: Classroom[] = [
  {
    classroom_id: 1,
    room_no: 'A101',
    building: 'A座教学楼',
    floor: 1,
    capacity: 50,
    room_type: ClassroomType.MULTIMEDIA,
    equipment: '投影仪,音响,电脑',
    status: ClassroomStatus.ACTIVE
  },
  {
    classroom_id: 2,
    room_no: 'A102',
    building: 'A座教学楼',
    floor: 1,
    capacity: 60,
    room_type: ClassroomType.NORMAL,
    equipment: '黑板,粉笔',
    status: ClassroomStatus.ACTIVE
  },
  {
    classroom_id: 3,
    room_no: 'B201',
    building: 'B座实验楼',
    floor: 2,
    capacity: 30,
    room_type: ClassroomType.COMPUTER,
    equipment: '30台计算机,投影仪',
    status: ClassroomStatus.ACTIVE
  }
]

// ========================================
// 排课数据
// ========================================
export const mockSchedules: Schedule[] = [
  {
    schedule_id: 1,
    offering_id: 1,
    classroom_id: 1,
    day_of_week: 1, // 周一
    start_time: '08:00:00',
    end_time: '09:40:00',
    weeks: '1-16',
    course_offering: mockCourseOfferings[0],
    classroom: mockClassrooms[0]
  },
  {
    schedule_id: 2,
    offering_id: 1,
    classroom_id: 1,
    day_of_week: 3, // 周三
    start_time: '10:00:00',
    end_time: '11:40:00',
    weeks: '1-16',
    course_offering: mockCourseOfferings[0],
    classroom: mockClassrooms[0]
  },
  {
    schedule_id: 3,
    offering_id: 2,
    classroom_id: 2,
    day_of_week: 2, // 周二
    start_time: '14:00:00',
    end_time: '15:40:00',
    weeks: '1-16',
    course_offering: mockCourseOfferings[1],
    classroom: mockClassrooms[1]
  }
]

// ========================================
// 奖惩数据
// ========================================
export const mockRewardPunishments: RewardPunishment[] = [
  {
    record_id: 1,
    student_id: 1,
    type: RewardPunishmentType.REWARD,
    category: '学习优秀',
    description: '期中考试成绩优异',
    occur_date: '2024-11-15',
    handler_id: 2,
    created_at: '2024-11-16 09:00:00',
    student: mockStudents[0],
    handler: mockUsers[1]
  },
  {
    record_id: 2,
    student_id: 2,
    type: RewardPunishmentType.PUNISHMENT,
    category: '违反校规',
    description: '迟到三次',
    occur_date: '2024-11-20',
    handler_id: 3,
    created_at: '2024-11-21 10:00:00',
    student: mockStudents[1],
    handler: mockUsers[2]
  }
]

// ========================================
// 学籍状态数据
// ========================================
export const mockStudentStatuses: StudentStatus[] = [
  {
    status_id: 1,
    student_id: 1,
    status_type: StudentStatusType.ENROLLED,
    effective_date: '2024-09-01',
    reason: '正常入学',
    handler_id: 3,
    created_at: '2024-09-01 08:00:00',
    student: mockStudents[0],
    handler: mockUsers[2]
  },
  {
    status_id: 2,
    student_id: 2,
    status_type: StudentStatusType.ENROLLED,
    effective_date: '2024-09-01',
    reason: '正常入学',
    handler_id: 3,
    created_at: '2024-09-01 08:00:00',
    student: mockStudents[1],
    handler: mockUsers[2]
  }
]

// ========================================
// 视图数据（用于展示）
// ========================================
export const mockStudentInfos: StudentInfo[] = mockStudents.map(student => ({
  student_id: student.student_id,
  student_no: student.student_no,
  real_name: student.user?.real_name || '',
  email: student.user?.email,
  phone: student.user?.phone,
  dept_name: student.department?.dept_name,
  class_name: student.class_name,
  grade: student.grade,
  enrollment_year: student.enrollment_year,
  graduation_year: student.graduation_year
}))

export const mockTeacherInfos: TeacherInfo[] = mockTeachers.map(teacher => ({
  teacher_id: teacher.teacher_id,
  teacher_no: teacher.teacher_no,
  real_name: teacher.user?.real_name || '',
  email: teacher.user?.email,
  phone: teacher.user?.phone,
  dept_name: teacher.department?.dept_name,
  title: teacher.title,
  hire_date: teacher.hire_date
}))

export const mockCourseOfferingInfos: CourseOfferingInfo[] = mockCourseOfferings.map(offering => ({
  offering_id: offering.offering_id,
  course_code: offering.course?.course_code || '',
  course_name: offering.course?.course_name || '',
  credits: offering.course?.credits || 0,
  hours: offering.course?.hours || 0,
  course_type: offering.course?.course_type || CourseType.REQUIRED,
  teacher_name: offering.teacher?.user?.real_name || '',
  dept_name: offering.course?.department?.dept_name,
  semester: offering.semester,
  max_students: offering.max_students,
  current_students: offering.current_students,
  enrollment_rate: Math.round((offering.current_students / offering.max_students) * 100 * 100) / 100
}))

export const mockStudentGrades: StudentGrade[] = mockGrades.map(grade => {
  const enrollment = grade.enrollment
  const student = enrollment?.student
  const offering = enrollment?.course_offering
  const course = offering?.course

  return {
    student_no: student?.student_no || '',
    student_name: student?.user?.real_name || '',
    course_code: course?.course_code || '',
    course_name: course?.course_name || '',
    credits: course?.credits || 0,
    usual_score: grade.usual_score,
    exam_score: grade.exam_score,
    final_score: grade.final_score,
    grade_point: grade.grade_point,
    semester: offering?.semester || '',
    grade_level: grade.final_score && grade.final_score >= 90 ? '优秀' :
                 grade.final_score && grade.final_score >= 80 ? '良好' :
                 grade.final_score && grade.final_score >= 70 ? '中等' :
                 grade.final_score && grade.final_score >= 60 ? '及格' : '不及格'
  }
})

export const mockScheduleInfos: ScheduleInfo[] = mockSchedules.map(schedule => {
  const offering = schedule.course_offering
  const course = offering?.course
  const teacher = offering?.teacher
  const classroom = schedule.classroom

  const dayNames = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

  return {
    schedule_id: schedule.schedule_id,
    course_name: course?.course_name || '',
    teacher_name: teacher?.user?.real_name || '',
    room_no: classroom?.room_no || '',
    building: classroom?.building || '',
    day_name: dayNames[schedule.day_of_week] || '',
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    weeks: schedule.weeks,
    semester: offering?.semester || ''
  }
})

// ========================================
// 导出所有mock数据
// ========================================
export const mockDatabase = {
  users: mockUsers,
  roles: mockRoles,
  permissions: mockPermissions,
  departments: mockDepartments,
  teachers: mockTeachers,
  students: mockStudents,
  courses: mockCourses,
  courseOfferings: mockCourseOfferings,
  enrollments: mockEnrollments,
  grades: mockGrades,
  classrooms: mockClassrooms,
  schedules: mockSchedules,
  rewardPunishments: mockRewardPunishments,
  studentStatuses: mockStudentStatuses,

  // 视图数据
  studentInfos: mockStudentInfos,
  teacherInfos: mockTeacherInfos,
  courseOfferingInfos: mockCourseOfferingInfos,
  studentGrades: mockStudentGrades,
  scheduleInfos: mockScheduleInfos
}
