import type { MockMethod } from 'vite-plugin-mock'
import {
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
  scheduleApi,
  classroomApi,
  rewardPunishmentApi,
  studentStatusApi
} from './api'

export default [
  // 认证相关API
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }: any) => authApi.login(body)
  },
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => authApi.logout()
  },
  {
    url: '/api/auth/profile',
    method: 'get',
    response: () => authApi.getProfile()
  },
  {
    url: '/api/auth/change-password',
    method: 'post',
    response: ({ body }: any) => authApi.changePassword(body)
  },

  // 用户管理API
  {
    url: '/api/users',
    method: 'get',
    response: ({ query }: any) => userApi.getList(query)
  },
  {
    url: '/api/users',
    method: 'post',
    response: ({ body }: any) => userApi.create(body)
  },
  {
    url: '/api/users/:id',
    method: 'put',
    response: ({ body, query }: any) => {
      const id = parseInt(query.id)
      return userApi.update(id, body)
    }
  },
  {
    url: '/api/users/:id',
    method: 'delete',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return userApi.delete(id)
    }
  },
  {
    url: '/api/users/:id',
    method: 'get',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return userApi.getDetail(id)
    }
  },
  {
    url: '/api/users/batch-delete',
    method: 'post',
    response: ({ body }: any) => userApi.batchDelete(body)
  },
  {
    url: '/api/users/:id/reset-password',
    method: 'post',
    response: ({ body, query }: any) => {
      const id = parseInt(query.id)
      return userApi.resetPassword(id, body)
    }
  },
  {
    url: '/api/users/:id/toggle-status',
    method: 'post',
    response: ({ body, query }: any) => {
      const id = parseInt(query.id)
      return userApi.toggleStatus(id, body)
    }
  },

  // 角色管理API
  {
    url: '/api/roles',
    method: 'get',
    response: ({ query }: any) => roleApi.getList(query)
  },
  {
    url: '/api/roles/all',
    method: 'get',
    response: () => roleApi.getAll()
  },
  {
    url: '/api/roles',
    method: 'post',
    response: ({ body }: any) => roleApi.create(body)
  },
  {
    url: '/api/roles/:id',
    method: 'put',
    response: ({ body, query }: any) => {
      const id = parseInt(query.id)
      return roleApi.update(id, body)
    }
  },
  {
    url: '/api/roles/:id',
    method: 'delete',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return roleApi.delete(id)
    }
  },
  {
    url: '/api/roles/:id',
    method: 'get',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return roleApi.getDetail(id)
    }
  },

  // 权限管理API
  {
    url: '/api/permissions',
    method: 'get',
    response: () => permissionApi.getList()
  },
  {
    url: '/api/permissions/all',
    method: 'get',
    response: () => permissionApi.getAll()
  },
  {
    url: '/api/permissions/by-module',
    method: 'get',
    response: () => permissionApi.getByModule()
  },

  // 部门管理API
  {
    url: '/api/departments',
    method: 'get',
    response: ({ query }: any) => departmentApi.getList(query)
  },
  {
    url: '/api/departments/all',
    method: 'get',
    response: () => departmentApi.getAll()
  },
  {
    url: '/api/departments/tree',
    method: 'get',
    response: () => departmentApi.getTree()
  },
  {
    url: '/api/departments',
    method: 'post',
    response: ({ body }: any) => departmentApi.create(body)
  },
  {
    url: '/api/departments/:id',
    method: 'put',
    response: ({ body, query }: any) => {
      const id = parseInt(query.id)
      return departmentApi.update(id, body)
    }
  },
  {
    url: '/api/departments/:id',
    method: 'delete',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return departmentApi.delete(id)
    }
  },

  // 教师管理API
  {
    url: '/api/teachers',
    method: 'get',
    response: ({ query }: any) => teacherApi.getList(query)
  },
  {
    url: '/api/teachers/info-list',
    method: 'get',
    response: ({ query }: any) => teacherApi.getInfoList(query)
  },
  {
    url: '/api/teachers/by-user/:userId',
    method: 'get',
    response: ({ query }: any) => {
      const userId = parseInt(query.userId)
      return teacherApi.getByUser(userId)
    }
  },
  {
    url: '/api/teachers/by-department/:deptId',
    method: 'get',
    response: ({ query }: any) => {
      const deptId = parseInt(query.deptId)
      return teacherApi.getByDepartment(deptId)
    }
  },
  {
    url: '/api/teachers',
    method: 'post',
    response: ({ body }: any) => teacherApi.create(body)
  },
  {
    url: '/api/teachers/:id',
    method: 'put',
    response: ({ body, query }: any) => {
      const id = parseInt(query.id)
      return teacherApi.update(id, body)
    }
  },
  {
    url: '/api/teachers/:id',
    method: 'delete',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return teacherApi.delete(id)
    }
  },
  {
    url: '/api/teachers/:id',
    method: 'get',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return teacherApi.getDetail(id)
    }
  },

  // 学生管理API
  {
    url: '/api/students',
    method: 'get',
    response: ({ query }: any) => studentApi.getList(query)
  },
  {
    url: '/api/students/info-list',
    method: 'get',
    response: ({ query }: any) => studentApi.getInfoList(query)
  },
  {
    url: '/api/students/by-user/:userId',
    method: 'get',
    response: ({ query }: any) => {
      const userId = parseInt(query.userId)
      return studentApi.getByUser(userId)
    }
  },
  {
    url: '/api/students/by-department/:deptId',
    method: 'get',
    response: ({ query }: any) => {
      const deptId = parseInt(query.deptId)
      return studentApi.getByDepartment(deptId)
    }
  },
  {
    url: '/api/students/by-class/:className',
    method: 'get',
    response: ({ query }: any) => {
      const className = query.className
      return studentApi.getByClass(className)
    }
  },
  {
    url: '/api/students',
    method: 'post',
    response: ({ body }: any) => studentApi.create(body)
  },
  {
    url: '/api/students/:id',
    method: 'put',
    response: ({ body, query }: any) => {
      const id = parseInt(query.id)
      return studentApi.update(id, body)
    }
  },
  {
    url: '/api/students/:id',
    method: 'delete',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return studentApi.delete(id)
    }
  },
  {
    url: '/api/students/:id',
    method: 'get',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return studentApi.getDetail(id)
    }
  },
  {
    url: '/api/students/:id/transcript',
    method: 'get',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return studentApi.getTranscript(id)
    }
  },
  {
    url: '/api/students/:id/gpa',
    method: 'get',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return studentApi.getGPA(id)
    }
  },

  // 课程管理API
  {
    url: '/api/courses',
    method: 'get',
    response: ({ query }: any) => courseApi.getList(query)
  },
  {
    url: '/api/courses/by-department/:deptId',
    method: 'get',
    response: ({ query }: any) => {
      const deptId = parseInt(query.deptId)
      return courseApi.getByDepartment(deptId)
    }
  },
  {
    url: '/api/courses/by-type/:type',
    method: 'get',
    response: ({ query }: any) => {
      const type = query.type
      return courseApi.getByType(type)
    }
  },
  {
    url: '/api/courses',
    method: 'post',
    response: ({ body }: any) => courseApi.create(body)
  },
  {
    url: '/api/courses/:id',
    method: 'put',
    response: ({ body, query }: any) => {
      const id = parseInt(query.id)
      return courseApi.update(id, body)
    }
  },
  {
    url: '/api/courses/:id',
    method: 'delete',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return courseApi.delete(id)
    }
  },
  {
    url: '/api/courses/:id',
    method: 'get',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return courseApi.getDetail(id)
    }
  },

  // 开课管理API
  {
    url: '/api/course-offerings',
    method: 'get',
    response: ({ query }: any) => courseOfferingApi.getList(query)
  },
  {
    url: '/api/course-offerings/info-list',
    method: 'get',
    response: ({ query }: any) => courseOfferingApi.getInfoList(query)
  },
  {
    url: '/api/course-offerings/by-semester/:semester',
    method: 'get',
    response: ({ query }: any) => {
      const semester = query.semester
      return courseOfferingApi.getBySemester(semester)
    }
  },
  {
    url: '/api/course-offerings/by-teacher/:teacherId',
    method: 'get',
    response: ({ query }: any) => {
      const teacherId = parseInt(query.teacherId)
      return courseOfferingApi.getByTeacher(teacherId)
    }
  },
  {
    url: '/api/course-offerings/by-course/:courseId',
    method: 'get',
    response: ({ query }: any) => {
      const courseId = parseInt(query.courseId)
      return courseOfferingApi.getByCourse(courseId)
    }
  },
  {
    url: '/api/course-offerings/my-courses',
    method: 'get',
    response: () => courseOfferingApi.getMyCourses()
  },
  {
    url: '/api/course-offerings',
    method: 'post',
    response: ({ body }: any) => courseOfferingApi.create(body)
  },
  {
    url: '/api/course-offerings/:id',
    method: 'put',
    response: ({ body, query }: any) => {
      const id = parseInt(query.id)
      return courseOfferingApi.update(id, body)
    }
  },
  {
    url: '/api/course-offerings/:id',
    method: 'delete',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return courseOfferingApi.delete(id)
    }
  },
  {
    url: '/api/course-offerings/:id',
    method: 'get',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return courseOfferingApi.getDetail(id)
    }
  },

  // 选课管理API
  {
    url: '/api/enrollments',
    method: 'get',
    response: ({ query }: any) => enrollmentApi.getList(query)
  },
  {
    url: '/api/enrollments/by-student/:studentId',
    method: 'get',
    response: ({ query }: any) => {
      const studentId = parseInt(query.studentId)
      return enrollmentApi.getByStudent(studentId)
    }
  },
  {
    url: '/api/enrollments/by-offering/:offeringId',
    method: 'get',
    response: ({ query }: any) => {
      const offeringId = parseInt(query.offeringId)
      return enrollmentApi.getByOffering(offeringId)
    }
  },
  {
    url: '/api/enrollments/my-enrollments',
    method: 'get',
    response: () => enrollmentApi.getMyEnrollments()
  },
  {
    url: '/api/enrollments',
    method: 'post',
    response: ({ body }: any) => enrollmentApi.create(body)
  },
  {
    url: '/api/enrollments/:id',
    method: 'put',
    response: ({ body, query }: any) => {
      const id = parseInt(query.id)
      return { code: 1, message: '选课更新功能未实现', data: null }
    }
  },
  {
    url: '/api/enrollments/:id',
    method: 'delete',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return enrollmentApi.delete(id)
    }
  },
  {
    url: '/api/enrollments/:id',
    method: 'get',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return enrollmentApi.getDetail(id)
    }
  },
  {
    url: '/api/enrollments/:id/approve',
    method: 'post',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return enrollmentApi.approve(id)
    }
  },
  {
    url: '/api/enrollments/:id/reject',
    method: 'post',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return enrollmentApi.reject(id)
    }
  },
  {
    url: '/api/enrollments/:id/withdraw',
    method: 'post',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return enrollmentApi.withdraw(id)
    }
  },

  // 成绩管理API
  {
    url: '/api/grades',
    method: 'get',
    response: ({ query }: any) => gradeApi.getList(query)
  },
  {
    url: '/api/grades/by-enrollment/:enrollmentId',
    method: 'get',
    response: ({ query }: any) => {
      const enrollmentId = parseInt(query.enrollmentId)
      return gradeApi.getByEnrollment(enrollmentId)
    }
  },
  {
    url: '/api/grades/by-student/:studentId',
    method: 'get',
    response: ({ query }: any) => {
      const studentId = parseInt(query.studentId)
      return gradeApi.getByStudent(studentId)
    }
  },
  {
    url: '/api/grades/by-offering/:offeringId',
    method: 'get',
    response: ({ query }: any) => {
      const offeringId = parseInt(query.offeringId)
      return gradeApi.getByOffering(offeringId)
    }
  },
  {
    url: '/api/grades/my-grades',
    method: 'get',
    response: () => gradeApi.getMyGrades()
  },
  {
    url: '/api/grades/course-offerings/:offeringId',
    method: 'get',
    response: ({ query }: any) => {
      const offeringId = parseInt(query.offeringId)
      return gradeApi.getCourseGrades(offeringId)
    }
  },
  {
    url: '/api/grades/student-grades',
    method: 'get',
    response: ({ query }: any) => gradeApi.getStudentGrades(query)
  },
  {
    url: '/api/grades/:id',
    method: 'put',
    response: ({ body, query }: any) => {
      const id = parseInt(query.id)
      return gradeApi.update(id, body)
    }
  },
  {
    url: '/api/grades/batch-update',
    method: 'post',
    response: ({ body }: any) => gradeApi.batchUpdate(body)
  },

  // 排课管理API
  {
    url: '/api/schedules',
    method: 'get',
    response: ({ query }: any) => scheduleApi.getList(query)
  },
  {
    url: '/api/schedules/info-list',
    method: 'get',
    response: ({ query }: any) => scheduleApi.getInfoList(query)
  },
  {
    url: '/api/schedules/by-offering/:offeringId',
    method: 'get',
    response: ({ query }: any) => {
      const offeringId = parseInt(query.offeringId)
      return scheduleApi.getByOffering(offeringId)
    }
  },
  {
    url: '/api/schedules/by-classroom/:classroomId',
    method: 'get',
    response: ({ query }: any) => {
      const classroomId = parseInt(query.classroomId)
      return scheduleApi.getByClassroom(classroomId)
    }
  },
  {
    url: '/api/schedules/by-semester/:semester',
    method: 'get',
    response: ({ query }: any) => {
      const semester = query.semester
      return scheduleApi.getBySemester(semester)
    }
  },
  {
    url: '/api/schedules/my-schedule',
    method: 'get',
    response: () => scheduleApi.getMySchedule()
  },
  {
    url: '/api/schedules/conflicts',
    method: 'post',
    response: ({ body }: any) => scheduleApi.checkConflicts(body)
  },
  {
    url: '/api/schedules',
    method: 'post',
    response: ({ body }: any) => scheduleApi.create(body)
  },
  {
    url: '/api/schedules/:id',
    method: 'put',
    response: ({ body, query }: any) => {
      const id = parseInt(query.id)
      return scheduleApi.update(id, body)
    }
  },
  {
    url: '/api/schedules/:id',
    method: 'delete',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return scheduleApi.delete(id)
    }
  },
  {
    url: '/api/schedules/:id',
    method: 'get',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return scheduleApi.getDetail(id)
    }
  },

  // 教室管理API
  {
    url: '/api/classrooms',
    method: 'get',
    response: ({ query }: any) => classroomApi.getList(query)
  },
  {
    url: '/api/classrooms/all',
    method: 'get',
    response: () => classroomApi.getAll()
  },
  {
    url: '/api/classrooms/by-building/:building',
    method: 'get',
    response: ({ query }: any) => {
      const building = query.building
      return classroomApi.getByBuilding(building)
    }
  },
  {
    url: '/api/classrooms/by-type/:type',
    method: 'get',
    response: ({ query }: any) => {
      const type = query.type
      return classroomApi.getByType(type)
    }
  },
  {
    url: '/api/classrooms/available',
    method: 'get',
    response: ({ query }: any) => classroomApi.getAvailable(query)
  },
  {
    url: '/api/classrooms',
    method: 'post',
    response: ({ body }: any) => classroomApi.create(body)
  },
  {
    url: '/api/classrooms/:id',
    method: 'put',
    response: ({ body, query }: any) => {
      const id = parseInt(query.id)
      return classroomApi.update(id, body)
    }
  },
  {
    url: '/api/classrooms/:id',
    method: 'delete',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return classroomApi.delete(id)
    }
  },
  {
    url: '/api/classrooms/:id',
    method: 'get',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return classroomApi.getDetail(id)
    }
  },

  // 奖惩管理API
  {
    url: '/api/reward-punishments',
    method: 'get',
    response: ({ query }: any) => rewardPunishmentApi.getList(query)
  },
  {
    url: '/api/reward-punishments/by-student/:studentId',
    method: 'get',
    response: ({ query }: any) => {
      const studentId = parseInt(query.studentId)
      return rewardPunishmentApi.getByStudent(studentId)
    }
  },
  {
    url: '/api/reward-punishments/by-type/:type',
    method: 'get',
    response: ({ query }: any) => {
      const type = query.type
      return rewardPunishmentApi.getByType(type)
    }
  },
  {
    url: '/api/reward-punishments/statistics',
    method: 'get',
    response: () => rewardPunishmentApi.getStatistics()
  },
  {
    url: '/api/reward-punishments',
    method: 'post',
    response: ({ body }: any) => rewardPunishmentApi.create(body)
  },
  {
    url: '/api/reward-punishments/:id',
    method: 'put',
    response: ({ body, query }: any) => {
      const id = parseInt(query.id)
      return rewardPunishmentApi.update(id, body)
    }
  },
  {
    url: '/api/reward-punishments/:id',
    method: 'delete',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return rewardPunishmentApi.delete(id)
    }
  },
  {
    url: '/api/reward-punishments/:id',
    method: 'get',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return rewardPunishmentApi.getDetail(id)
    }
  },

  // 学籍管理API
  {
    url: '/api/student-status',
    method: 'get',
    response: ({ query }: any) => studentStatusApi.getList(query)
  },
  {
    url: '/api/student-status/by-student/:studentId',
    method: 'get',
    response: ({ query }: any) => {
      const studentId = parseInt(query.studentId)
      return studentStatusApi.getByStudent(studentId)
    }
  },
  {
    url: '/api/student-status/by-type/:type',
    method: 'get',
    response: ({ query }: any) => {
      const type = query.type
      return studentStatusApi.getByType(type)
    }
  },
  {
    url: '/api/students/:studentId/status-history',
    method: 'get',
    response: ({ query }: any) => {
      const studentId = parseInt(query.studentId)
      return studentStatusApi.getHistory(studentId)
    }
  },
  {
    url: '/api/students/:studentId/current-status',
    method: 'get',
    response: ({ query }: any) => {
      const studentId = parseInt(query.studentId)
      return studentStatusApi.getCurrent(studentId)
    }
  },
  {
    url: '/api/student-status',
    method: 'post',
    response: ({ body }: any) => studentStatusApi.create(body)
  },
  {
    url: '/api/student-status/:id',
    method: 'put',
    response: ({ body, query }: any) => {
      const id = parseInt(query.id)
      return studentStatusApi.update(id, body)
    }
  },
  {
    url: '/api/student-status/:id',
    method: 'delete',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return studentStatusApi.delete(id)
    }
  },
  {
    url: '/api/student-status/:id',
    method: 'get',
    response: ({ query }: any) => {
      const id = parseInt(query.id)
      return studentStatusApi.getDetail(id)
    }
  }
] as MockMethod[]
