// 认证相关API
import authApi from './auth'
export { authApi }

// 用户管理API
import userApi from './user'
export { userApi }

// 角色管理API
import roleApi from './role'
export { roleApi }

// 权限管理API
import permissionApi from './permission'
export { permissionApi }

// 部门管理API
import departmentApi from './department'
export { departmentApi }

// 教师管理API
import teacherApi from './teacher'
export { teacherApi }

// 学生管理API
import studentApi from './student'
export { studentApi }

// 课程相关API
import { courseApi, courseOfferingApi, enrollmentApi, gradeApi } from './course'
export { courseApi, courseOfferingApi, enrollmentApi, gradeApi }

// 教室管理API
import classroomApi from './classroom'
export { classroomApi }

// 排课管理API
import scheduleApi from './schedule'
export { scheduleApi }

// 学籍管理API
import studentStatusApi from './student-status'
export { studentStatusApi }

// 奖惩管理API
import rewardPunishmentApi from './reward-punishment'
export { rewardPunishmentApi }

// 统一导出所有API
export default {
  authApi,
  userApi,
  roleApi,
  permissionApi,
  departmentApi,
  teacherApi,
  studentApi,
  courseApi,
  courseOfferingApi,
  enrollmentApi,
  gradeApi,
  classroomApi,
  scheduleApi,
  studentStatusApi,
  rewardPunishmentApi
}
