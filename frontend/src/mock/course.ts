import type { MockMethod } from 'vite-plugin-mock'

// 课程类型枚举
enum CourseType {
  REQUIRED = 'REQUIRED',
  ELECTIVE = 'ELECTIVE',
  PUBLIC = 'PUBLIC',
  PROFESSIONAL = 'PROFESSIONAL'
}

// 课程状态枚举
enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

// 开课状态枚举
enum OfferingStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ENROLLMENT = 'ENROLLMENT',
  TEACHING = 'TEACHING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// 课程接口
interface Course {
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

// 开课接口
interface CourseOffering {
  id: number
  courseId: number
  course: Course
  teacherId: number
  teacher: any
  semester: string
  academicYear: string
  maxStudents: number
  currentStudents: number
  classroom?: string
  schedules: any[]
  status: OfferingStatus
  createdAt: string
  updatedAt: string
}

// Mock课程数据
const mockCourses: Course[] = [
  {
    id: 1,
    name: '高等数学',
    code: 'MATH001',
    credits: 4,
    hours: 64,
    type: CourseType.REQUIRED,
    description: '微积分基础课程',
    prerequisiteIds: [],
    prerequisites: [],
    status: CourseStatus.PUBLISHED,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: '线性代数',
    code: 'MATH002',
    credits: 3,
    hours: 48,
    type: CourseType.REQUIRED,
    description: '线性代数基础',
    prerequisiteIds: [1],
    prerequisites: [],
    status: CourseStatus.PUBLISHED,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: '数据结构',
    code: 'CS001',
    credits: 4,
    hours: 64,
    type: CourseType.PROFESSIONAL,
    description: '计算机数据结构基础',
    prerequisiteIds: [],
    prerequisites: [],
    status: CourseStatus.PUBLISHED,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: '算法设计与分析',
    code: 'CS002',
    credits: 3,
    hours: 48,
    type: CourseType.PROFESSIONAL,
    description: '算法设计与复杂度分析',
    prerequisiteIds: [3],
    prerequisites: [],
    status: CourseStatus.PUBLISHED,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    name: '大学英语',
    code: 'ENG001',
    credits: 2,
    hours: 32,
    type: CourseType.PUBLIC,
    description: '大学英语基础课程',
    prerequisiteIds: [],
    prerequisites: [],
    status: CourseStatus.PUBLISHED,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 6,
    name: '人工智能导论',
    code: 'CS003',
    credits: 3,
    hours: 48,
    type: CourseType.ELECTIVE,
    description: '人工智能基础概念',
    prerequisiteIds: [3],
    prerequisites: [],
    status: CourseStatus.PUBLISHED,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 7,
    name: '操作系统',
    code: 'CS004',
    credits: 3,
    hours: 48,
    type: CourseType.PROFESSIONAL,
    description: '操作系统原理与实践',
    prerequisiteIds: [3],
    prerequisites: [],
    status: CourseStatus.DRAFT,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
]

// Mock开课数据
const mockCourseOfferings: CourseOffering[] = [
  {
    id: 1,
    courseId: 1,
    course: mockCourses[0],
    teacherId: 3,
    teacher: { id: 3, realName: '张老师', employeeId: 'T001' },
    semester: '春季学期',
    academicYear: '2024-2025',
    maxStudents: 60,
    currentStudents: 45,
    classroom: 'A101',
    schedules: [
      {
        id: 1,
        dayOfWeek: 1,
        startTime: 1,
        endTime: 2,
        classroom: 'A101',
        weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      },
      {
        id: 2,
        dayOfWeek: 3,
        startTime: 3,
        endTime: 4,
        classroom: 'A101',
        weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      }
    ],
    status: OfferingStatus.TEACHING,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 2,
    courseId: 3,
    course: mockCourses[2],
    teacherId: 5,
    teacher: { id: 5, realName: '王老师', employeeId: 'T002' },
    semester: '春季学期',
    academicYear: '2024-2025',
    maxStudents: 40,
    currentStudents: 38,
    classroom: 'B201',
    schedules: [
      {
        id: 3,
        dayOfWeek: 2,
        startTime: 1,
        endTime: 2,
        classroom: 'B201',
        weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      },
      {
        id: 4,
        dayOfWeek: 4,
        startTime: 5,
        endTime: 6,
        classroom: 'B201',
        weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      }
    ],
    status: OfferingStatus.ENROLLMENT,
    createdAt: '2024-01-16T00:00:00Z',
    updatedAt: '2024-01-16T00:00:00Z'
  },
  {
    id: 3,
    courseId: 5,
    course: mockCourses[4],
    teacherId: 3,
    teacher: { id: 3, realName: '张老师', employeeId: 'T001' },
    semester: '春季学期',
    academicYear: '2024-2025',
    maxStudents: 80,
    currentStudents: 72,
    classroom: 'C301',
    schedules: [
      {
        id: 5,
        dayOfWeek: 1,
        startTime: 3,
        endTime: 4,
        classroom: 'C301',
        weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      }
    ],
    status: OfferingStatus.COMPLETED,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  }
]

// 初始化课程先修关系
const initializeCoursePrerequisites = () => {
  mockCourses.forEach(course => {
    if (course.prerequisiteIds && course.prerequisiteIds.length > 0) {
      course.prerequisites = mockCourses.filter(c =>
        course.prerequisiteIds!.includes(c.id)
      )
    }
  })
}

initializeCoursePrerequisites()

// 课程相关Mock方法
const courseMethods = [
  // 获取课程列表
  {
    url: '/api/courses',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10, keyword = '', name = '', code = '', type, status, credits } = query

      let filteredCourses = [...mockCourses]

      // 关键词搜索
      if (keyword) {
        filteredCourses = filteredCourses.filter(course =>
          course.name.includes(keyword) ||
          course.code.includes(keyword) ||
          course.description?.includes(keyword)
        )
      }

      // 按课程名称搜索
      if (name) {
        filteredCourses = filteredCourses.filter(course =>
          course.name.includes(name)
        )
      }

      // 按课程代码搜索
      if (code) {
        filteredCourses = filteredCourses.filter(course =>
          course.code.includes(code)
        )
      }

      // 按课程类型筛选
      if (type) {
        filteredCourses = filteredCourses.filter(course => course.type === type)
      }

      // 按状态筛选
      if (status) {
        filteredCourses = filteredCourses.filter(course => course.status === status)
      }

      // 按学分筛选
      if (credits) {
        filteredCourses = filteredCourses.filter(course => course.credits === parseInt(credits))
      }

      // 分页
      const start = (page - 1) * pageSize
      const end = start + parseInt(pageSize)
      const pageData = filteredCourses.slice(start, end)

      return {
        code: 0,
        message: 'success',
        data: {
          list: pageData,
          total: filteredCourses.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },

  // 获取所有课程（用于下拉选择）
  {
    url: '/api/courses/all',
    method: 'get',
    response: () => {
      return {
        code: 0,
        message: 'success',
        data: mockCourses.filter(course => course.status === CourseStatus.PUBLISHED)
      }
    }
  },

  // 获取课程详情
  {
    url: '/api/courses/:id',
    method: 'get',
    response: ({ url }: any) => {
      const id = parseInt(url.split('/').pop())
      const course = mockCourses.find(c => c.id === id)

      if (!course) {
        return {
          code: 404,
          message: '课程不存在',
          data: null
        }
      }

      return {
        code: 0,
        message: 'success',
        data: course
      }
    }
  },

  // 创建课程
  {
    url: '/api/courses',
    method: 'post',
    response: ({ body }: any) => {
      const newCourse: Course = {
        id: mockCourses.length + 1,
        ...body,
        status: CourseStatus.DRAFT,
        prerequisites: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      mockCourses.push(newCourse)

      return {
        code: 0,
        message: '创建课程成功',
        data: newCourse
      }
    }
  },

  // 更新课程
  {
    url: '/api/courses/:id',
    method: 'put',
    response: ({ url, body }: any) => {
      const id = parseInt(url.split('/').pop())
      const courseIndex = mockCourses.findIndex(c => c.id === id)

      if (courseIndex === -1) {
        return {
          code: 404,
          message: '课程不存在',
          data: null
        }
      }

      mockCourses[courseIndex] = {
        ...mockCourses[courseIndex],
        ...body,
        updatedAt: new Date().toISOString()
      }

      // 重新初始化先修关系
      initializeCoursePrerequisites()

      return {
        code: 0,
        message: '更新课程成功',
        data: mockCourses[courseIndex]
      }
    }
  },

  // 删除课程
  {
    url: '/api/courses/:id',
    method: 'delete',
    response: ({ url }: any) => {
      const id = parseInt(url.split('/').pop())
      const courseIndex = mockCourses.findIndex(c => c.id === id)

      if (courseIndex === -1) {
        return {
          code: 404,
          message: '课程不存在',
          data: null
        }
      }

      // 检查是否被其他课程依赖
      const dependentCourses = mockCourses.filter(course =>
        course.prerequisiteIds?.includes(id)
      )

      if (dependentCourses.length > 0) {
        return {
          code: 400,
          message: `无法删除，该课程被以下课程设为先修课程：${dependentCourses.map(c => c.name).join(', ')}`,
          data: null
        }
      }

      mockCourses.splice(courseIndex, 1)

      return {
        code: 0,
        message: '删除课程成功',
        data: null
      }
    }
  },

  // 获取开课列表
  {
    url: '/api/course-offerings',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10, keyword = '', courseId, teacherId, semester, academicYear, status } = query

      let filteredOfferings = [...mockCourseOfferings]

      // 关键词搜索
      if (keyword) {
        filteredOfferings = filteredOfferings.filter(offering =>
          offering.course.name.includes(keyword) ||
          offering.course.code.includes(keyword) ||
          offering.teacher.realName.includes(keyword)
        )
      }

      // 按课程筛选
      if (courseId) {
        filteredOfferings = filteredOfferings.filter(offering =>
          offering.courseId === parseInt(courseId)
        )
      }

      // 按教师筛选
      if (teacherId) {
        filteredOfferings = filteredOfferings.filter(offering =>
          offering.teacherId === parseInt(teacherId)
        )
      }

      // 按学期筛选
      if (semester) {
        filteredOfferings = filteredOfferings.filter(offering =>
          offering.semester.includes(semester)
        )
      }

      // 按学年筛选
      if (academicYear) {
        filteredOfferings = filteredOfferings.filter(offering =>
          offering.academicYear.includes(academicYear)
        )
      }

      // 按状态筛选
      if (status) {
        filteredOfferings = filteredOfferings.filter(offering => offering.status === status)
      }

      // 分页
      const start = (page - 1) * pageSize
      const end = start + parseInt(pageSize)
      const pageData = filteredOfferings.slice(start, end)

      return {
        code: 0,
        message: 'success',
        data: {
          list: pageData,
          total: filteredOfferings.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },

  // 获取我的课程（教师）
  {
    url: '/api/course-offerings/my-courses',
    method: 'get',
    response: () => {
      // 这里应该根据当前登录教师的ID筛选，暂时返回所有
      return {
        code: 0,
        message: 'success',
        data: mockCourseOfferings
      }
    }
  },

  // 获取教师统计数据
  {
    url: '/api/course-offerings/teacher-stats',
    method: 'get',
    response: () => {
      return {
        code: 0,
        message: 'success',
        data: {
          totalCourses: mockCourseOfferings.length,
          activeCourses: mockCourseOfferings.filter(o =>
            [OfferingStatus.ENROLLMENT, OfferingStatus.TEACHING].includes(o.status)
          ).length,
          completedCourses: mockCourseOfferings.filter(o =>
            o.status === OfferingStatus.COMPLETED
          ).length,
          totalStudents: mockCourseOfferings.reduce((sum, o) => sum + o.currentStudents, 0)
        }
      }
    }
  },

  // 更新开课状态
  {
    url: '/api/course-offerings/:id',
    method: 'put',
    response: ({ url, body }: any) => {
      const id = parseInt(url.split('/').pop())
      const offeringIndex = mockCourseOfferings.findIndex(o => o.id === id)

      if (offeringIndex === -1) {
        return {
          code: 404,
          message: '开课不存在',
          data: null
        }
      }

      mockCourseOfferings[offeringIndex] = {
        ...mockCourseOfferings[offeringIndex],
        ...body,
        updatedAt: new Date().toISOString()
      }

      return {
        code: 0,
        message: '更新开课成功',
        data: mockCourseOfferings[offeringIndex]
      }
    }
  },

  // 获取开课详情
  {
    url: '/api/course-offerings/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/').pop())
      const courseOffering = mockCourseOfferings.find(co => co.id === id)
      if (!courseOffering) {
        return {
          code: 404,
          message: '开课不存在'
        }
      }
      return {
        code: 0,
        message: 'success',
        data: courseOffering
      }
    }
  },

  // 创建开课
  {
    url: '/api/course-offerings',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const course = mockCourses.find(c => c.id === body.courseId)
      if (!course) {
        return {
          code: 404,
          message: '课程不存在'
        }
      }

      const newCourseOffering: CourseOffering = {
        id: mockCourseOfferings.length + 1,
        courseId: body.courseId,
        course,
        teacherId: body.teacherId,
        teacher: { id: body.teacherId, realName: '教师姓名', employeeId: 'T' + String(body.teacherId).padStart(3, '0') },
        semester: body.semester,
        academicYear: body.academicYear,
        maxStudents: body.maxStudents,
        currentStudents: 0,
        classroom: body.classroom,
        schedules: [],
        status: OfferingStatus.DRAFT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockCourseOfferings.push(newCourseOffering)
      return {
        code: 0,
        message: 'success',
        data: newCourseOffering
      }
    }
  },

  // 删除开课
  {
    url: '/api/course-offerings/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/').pop())
      const courseOfferingIndex = mockCourseOfferings.findIndex(co => co.id === id)
      if (courseOfferingIndex === -1) {
        return {
          code: 404,
          message: '开课不存在'
        }
      }
      mockCourseOfferings.splice(courseOfferingIndex, 1)
      return {
        code: 0,
        message: 'success'
      }
    }
  }
]

// 导出所有Mock方法
export default courseMethods as MockMethod[]
