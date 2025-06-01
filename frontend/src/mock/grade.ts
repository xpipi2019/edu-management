import type { MockMethod } from 'vite-plugin-mock'

// 成绩接口
interface Grade {
  id: number
  studentId: number
  courseOfferingId: number
  score?: number
  letterGrade?: string
  gpa?: number
  submittedAt?: string
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

// Mock成绩数据
const mockGrades: Grade[] = [
  {
    id: 1,
    studentId: 4,
    courseOfferingId: 1,
    score: 85,
    letterGrade: 'B',
    gpa: 3.0,
    submittedAt: '2024-02-01T00:00:00Z',
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
  // 获取成绩列表
  {
    url: '/api/grades',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10, keyword = '', studentId, courseOfferingId, semester, academicYear } = query

      let filteredGrades = [...mockGrades]

      // 关键词搜索
      if (keyword) {
        filteredGrades = filteredGrades.filter(grade =>
          grade.student.realName.includes(keyword) ||
          grade.student.studentId.includes(keyword) ||
          grade.courseOffering.course.name.includes(keyword) ||
          grade.courseOffering.course.code.includes(keyword) ||
          grade.courseOffering.teacher.realName.includes(keyword)
        )
      }

      // 按学生筛选
      if (studentId) {
        filteredGrades = filteredGrades.filter(grade =>
          grade.studentId === parseInt(studentId)
        )
      }

      // 按课程开课筛选
      if (courseOfferingId) {
        filteredGrades = filteredGrades.filter(grade =>
          grade.courseOfferingId === parseInt(courseOfferingId)
        )
      }

      // 按学期筛选
      if (semester) {
        filteredGrades = filteredGrades.filter(grade =>
          grade.courseOffering.semester.includes(semester)
        )
      }

      // 按学年筛选
      if (academicYear) {
        filteredGrades = filteredGrades.filter(grade =>
          grade.courseOffering.academicYear.includes(academicYear)
        )
      }

      // 分页
      const start = (page - 1) * pageSize
      const end = start + parseInt(pageSize)
      const pageData = filteredGrades.slice(start, end)

      return {
        code: 0,
        message: '获取成功',
        data: {
          list: pageData,
          total: filteredGrades.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },
  // 更新成绩
  {
    url: '/api/grades/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = Number(url.split('/').pop())
      const gradeIndex = mockGrades.findIndex(g => g.id === id)
      if (gradeIndex === -1) {
        return {
          code: 404,
          message: '成绩记录不存在'
        }
      }

      // 计算字母等级和GPA
      let letterGrade = ''
      let gpa = 0
      if (body.score !== undefined) {
        if (body.score >= 90) {
          letterGrade = 'A'
          gpa = 4.0
        } else if (body.score >= 80) {
          letterGrade = 'B'
          gpa = 3.0
        } else if (body.score >= 70) {
          letterGrade = 'C'
          gpa = 2.0
        } else if (body.score >= 60) {
          letterGrade = 'D'
          gpa = 1.0
        } else {
          letterGrade = 'F'
          gpa = 0.0
        }
      }

      mockGrades[gradeIndex] = {
        ...mockGrades[gradeIndex],
        score: body.score,
        letterGrade,
        gpa,
        submittedAt: new Date().toISOString()
      }

      return {
        code: 0,
        message: '成绩更新成功',
        data: mockGrades[gradeIndex]
      }
    }
  },
  // 批量更新成绩
  {
    url: '/api/grades/batch-update',
    method: 'post',
    response: ({ body }: { body: { grades: Array<{ id: number; score: number }> } }) => {
      const { grades } = body
      const updatedGrades = []

      for (const gradeUpdate of grades) {
        const gradeIndex = mockGrades.findIndex(g => g.id === gradeUpdate.id)
        if (gradeIndex !== -1) {
          // 计算字母等级和GPA
          let letterGrade = ''
          let gpa = 0
          if (gradeUpdate.score >= 90) {
            letterGrade = 'A'
            gpa = 4.0
          } else if (gradeUpdate.score >= 80) {
            letterGrade = 'B'
            gpa = 3.0
          } else if (gradeUpdate.score >= 70) {
            letterGrade = 'C'
            gpa = 2.0
          } else if (gradeUpdate.score >= 60) {
            letterGrade = 'D'
            gpa = 1.0
          } else {
            letterGrade = 'F'
            gpa = 0.0
          }

          mockGrades[gradeIndex] = {
            ...mockGrades[gradeIndex],
            score: gradeUpdate.score,
            letterGrade,
            gpa,
            submittedAt: new Date().toISOString()
          }
          updatedGrades.push(mockGrades[gradeIndex])
        }
      }

      return {
        code: 0,
        message: `成功更新${updatedGrades.length}条成绩`,
        data: updatedGrades
      }
    }
  },
  // 获取我的成绩
  {
    url: '/api/grades/my-grades',
    method: 'get',
    response: () => {
      const myGrades = mockGrades.filter(g => g.studentId === 4)
      return {
        code: 0,
        message: '获取成功',
        data: myGrades
      }
    }
  },
  // 获取课程成绩
  {
    url: '/api/grades/course-offerings/:courseOfferingId',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const courseOfferingId = Number(url.split('/')[4])
      const courseGrades = mockGrades.filter(g => g.courseOfferingId === courseOfferingId)
      return {
        code: 0,
        message: '获取成功',
        data: courseGrades
      }
    }
  }
] as MockMethod[]
