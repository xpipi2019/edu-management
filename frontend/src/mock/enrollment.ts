import type { MockMethod } from 'vite-plugin-mock'

// 选课状态枚举
enum EnrollmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

// 选课接口
interface Enrollment {
  id: number
  studentId: number
  courseOfferingId: number
  status: EnrollmentStatus
  enrolledAt: string
  approvedAt?: string
  rejectedAt?: string
  reason?: string
  student: {
    id: number
    realName: string
    studentId: string
  }
  courseOffering: {
    id: number
    course: {
      id: number
      name: string
      code: string
      credits: number
    }
    teacher: {
      id: number
      realName: string
    }
    semester: string
    academicYear: string
  }
}

// Mock选课数据
const mockEnrollments: Enrollment[] = [
  {
    id: 1,
    studentId: 4,
    courseOfferingId: 1,
    status: EnrollmentStatus.APPROVED,
    enrolledAt: '2024-01-15T00:00:00Z',
    approvedAt: '2024-01-16T00:00:00Z',
    student: {
      id: 4,
      realName: '李同学',
      studentId: 'S001'
    },
    courseOffering: {
      id: 1,
      course: {
        id: 1,
        name: '高等数学',
        code: 'MATH001',
        credits: 4
      },
      teacher: {
        id: 3,
        realName: '张老师'
      },
      semester: '春季学期',
      academicYear: '2024-2025'
    }
  },
  {
    id: 2,
    studentId: 4,
    courseOfferingId: 2,
    status: EnrollmentStatus.PENDING,
    enrolledAt: '2024-01-20T00:00:00Z',
    student: {
      id: 4,
      realName: '李同学',
      studentId: 'S001'
    },
    courseOffering: {
      id: 2,
      course: {
        id: 2,
        name: '线性代数',
        code: 'MATH002',
        credits: 3
      },
      teacher: {
        id: 3,
        realName: '张老师'
      },
      semester: '春季学期',
      academicYear: '2024-2025'
    }
  }
]

export default [
  // 获取选课列表
  {
    url: '/api/enrollments',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10, keyword = '', studentId, courseOfferingId, status, semester, academicYear } = query

      let filteredEnrollments = [...mockEnrollments]

      // 关键词搜索
      if (keyword) {
        filteredEnrollments = filteredEnrollments.filter(enrollment =>
          enrollment.student.realName.includes(keyword) ||
          enrollment.student.studentId.includes(keyword) ||
          enrollment.courseOffering.course.name.includes(keyword) ||
          enrollment.courseOffering.course.code.includes(keyword) ||
          enrollment.courseOffering.teacher.realName.includes(keyword)
        )
      }

      // 按学生筛选
      if (studentId) {
        filteredEnrollments = filteredEnrollments.filter(enrollment =>
          enrollment.studentId === parseInt(studentId)
        )
      }

      // 按课程开课筛选
      if (courseOfferingId) {
        filteredEnrollments = filteredEnrollments.filter(enrollment =>
          enrollment.courseOfferingId === parseInt(courseOfferingId)
        )
      }

      // 按状态筛选
      if (status) {
        filteredEnrollments = filteredEnrollments.filter(enrollment => enrollment.status === status)
      }

      // 按学期筛选
      if (semester) {
        filteredEnrollments = filteredEnrollments.filter(enrollment =>
          enrollment.courseOffering.semester.includes(semester)
        )
      }

      // 按学年筛选
      if (academicYear) {
        filteredEnrollments = filteredEnrollments.filter(enrollment =>
          enrollment.courseOffering.academicYear.includes(academicYear)
        )
      }

      // 分页
      const start = (page - 1) * pageSize
      const end = start + parseInt(pageSize)
      const pageData = filteredEnrollments.slice(start, end)

      return {
        code: 0,
        message: '获取成功',
        data: {
          list: pageData,
          total: filteredEnrollments.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },
  // 创建选课
  {
    url: '/api/enrollments',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newEnrollment: Enrollment = {
        id: mockEnrollments.length + 1,
        studentId: body.studentId,
        courseOfferingId: body.courseOfferingId,
        status: EnrollmentStatus.PENDING,
        enrolledAt: new Date().toISOString(),
        student: {
          id: body.studentId,
          realName: '学生姓名',
          studentId: 'S' + String(body.studentId).padStart(3, '0')
        },
        courseOffering: {
          id: body.courseOfferingId,
          course: {
            id: 1,
            name: '课程名称',
            code: 'COURSE001',
            credits: 3
          },
          teacher: {
            id: 3,
            realName: '教师姓名'
          },
          semester: '春季学期',
          academicYear: '2024-2025'
        }
      }
      mockEnrollments.push(newEnrollment)
      return {
        code: 0,
        message: '选课成功',
        data: newEnrollment
      }
    }
  },
  // 删除选课
  {
    url: '/api/enrollments/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/').pop())
      const enrollmentIndex = mockEnrollments.findIndex(e => e.id === id)
      if (enrollmentIndex === -1) {
        return {
          code: 404,
          message: '选课记录不存在'
        }
      }
      mockEnrollments.splice(enrollmentIndex, 1)
      return {
        code: 0,
        message: '退课成功'
      }
    }
  },
  // 审批选课
  {
    url: '/api/enrollments/:id/approve',
    method: 'post',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/')[3])
      const enrollment = mockEnrollments.find(e => e.id === id)
      if (!enrollment) {
        return {
          code: 404,
          message: '选课记录不存在'
        }
      }
      enrollment.status = EnrollmentStatus.APPROVED
      enrollment.approvedAt = new Date().toISOString()
      return {
        code: 0,
        message: '审批通过',
        data: enrollment
      }
    }
  },
  // 拒绝选课
  {
    url: '/api/enrollments/:id/reject',
    method: 'post',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = Number(url.split('/')[3])
      const enrollment = mockEnrollments.find(e => e.id === id)
      if (!enrollment) {
        return {
          code: 404,
          message: '选课记录不存在'
        }
      }
      enrollment.status = EnrollmentStatus.REJECTED
      enrollment.rejectedAt = new Date().toISOString()
      enrollment.reason = body.reason || '审核不通过'
      return {
        code: 0,
        message: '已拒绝',
        data: enrollment
      }
    }
  },
  // 获取我的选课
  {
    url: '/api/enrollments/my-enrollments',
    method: 'get',
    response: () => {
      return {
        code: 0,
        message: '获取成功',
        data: mockEnrollments.filter(e => e.studentId === 4)
      }
    }
  }
] as MockMethod[]
