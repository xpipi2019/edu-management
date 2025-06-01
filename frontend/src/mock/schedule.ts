import type { MockMethod } from 'vite-plugin-mock'

// 排课接口
interface Schedule {
  id: number
  courseOfferingId: number
  classroomId: number
  dayOfWeek: number  // 1-7 表示周一到周日
  startTime: number  // 第几节课开始
  endTime: number    // 第几节课结束
  weeks: number[]    // 上课周次
  courseOffering: {
    id: number
    course: {
      id: number
      name: string
      code: string
    }
    teacher: {
      id: number
      realName: string
    }
    semester: string
    academicYear: string
  }
  classroom: {
    id: number
    name: string
    building: string
    capacity: number
  }
}

// Mock排课数据
const mockSchedules: Schedule[] = [
  {
    id: 1,
    courseOfferingId: 1,
    classroomId: 1,
    dayOfWeek: 1,
    startTime: 1,
    endTime: 2,
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    courseOffering: {
      id: 1,
      course: {
        id: 1,
        name: '高等数学',
        code: 'MATH001'
      },
      teacher: {
        id: 3,
        realName: '张老师'
      },
      semester: '春季学期',
      academicYear: '2024-2025'
    },
    classroom: {
      id: 1,
      name: 'A101',
      building: 'A栋',
      capacity: 60
    }
  },
  {
    id: 2,
    courseOfferingId: 1,
    classroomId: 1,
    dayOfWeek: 3,
    startTime: 3,
    endTime: 4,
    weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    courseOffering: {
      id: 1,
      course: {
        id: 1,
        name: '高等数学',
        code: 'MATH001'
      },
      teacher: {
        id: 3,
        realName: '张老师'
      },
      semester: '春季学期',
      academicYear: '2024-2025'
    },
    classroom: {
      id: 1,
      name: 'A101',
      building: 'A栋',
      capacity: 60
    }
  }
]

export default [
  // 获取排课列表
  {
    url: '/api/schedules',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10, keyword = '', courseOfferingId, classroomId, dayOfWeek, teacherId } = query

      let filteredSchedules = [...mockSchedules]

      // 关键词搜索
      if (keyword) {
        filteredSchedules = filteredSchedules.filter(schedule =>
          schedule.courseOffering.course.name.includes(keyword) ||
          schedule.courseOffering.course.code.includes(keyword) ||
          schedule.courseOffering.teacher.realName.includes(keyword) ||
          schedule.classroom.name.includes(keyword) ||
          schedule.classroom.building.includes(keyword)
        )
      }

      // 按开课筛选
      if (courseOfferingId) {
        filteredSchedules = filteredSchedules.filter(schedule =>
          schedule.courseOfferingId === parseInt(courseOfferingId)
        )
      }

      // 按教室筛选
      if (classroomId) {
        filteredSchedules = filteredSchedules.filter(schedule =>
          schedule.classroomId === parseInt(classroomId)
        )
      }

      // 按星期筛选
      if (dayOfWeek) {
        filteredSchedules = filteredSchedules.filter(schedule =>
          schedule.dayOfWeek === parseInt(dayOfWeek)
        )
      }

      // 按教师筛选
      if (teacherId) {
        filteredSchedules = filteredSchedules.filter(schedule =>
          schedule.courseOffering.teacher.id === parseInt(teacherId)
        )
      }

      // 分页
      const start = (page - 1) * pageSize
      const end = start + parseInt(pageSize)
      const pageData = filteredSchedules.slice(start, end)

      return {
        code: 0,
        message: '获取成功',
        data: {
          list: pageData,
          total: filteredSchedules.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },
  // 创建排课
  {
    url: '/api/schedules',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newSchedule: Schedule = {
        id: mockSchedules.length + 1,
        courseOfferingId: body.courseOfferingId,
        classroomId: body.classroomId,
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
        weeks: body.weeks || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        courseOffering: {
          id: body.courseOfferingId,
          course: {
            id: 1,
            name: '课程名称',
            code: 'COURSE001'
          },
          teacher: {
            id: 3,
            realName: '教师姓名'
          },
          semester: '春季学期',
          academicYear: '2024-2025'
        },
        classroom: {
          id: body.classroomId,
          name: 'A101',
          building: 'A栋',
          capacity: 60
        }
      }
      mockSchedules.push(newSchedule)
      return {
        code: 0,
        message: '排课成功',
        data: newSchedule
      }
    }
  },
  // 更新排课
  {
    url: '/api/schedules/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = Number(url.split('/').pop())
      const scheduleIndex = mockSchedules.findIndex(s => s.id === id)
      if (scheduleIndex === -1) {
        return {
          code: 404,
          message: '排课记录不存在'
        }
      }
      mockSchedules[scheduleIndex] = {
        ...mockSchedules[scheduleIndex],
        ...body
      }
      return {
        code: 0,
        message: '更新成功',
        data: mockSchedules[scheduleIndex]
      }
    }
  },
  // 删除排课
  {
    url: '/api/schedules/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/').pop())
      const scheduleIndex = mockSchedules.findIndex(s => s.id === id)
      if (scheduleIndex === -1) {
        return {
          code: 404,
          message: '排课记录不存在'
        }
      }
      mockSchedules.splice(scheduleIndex, 1)
      return {
        code: 0,
        message: '删除成功'
      }
    }
  },
  // 获取我的课表
  {
    url: '/api/schedules/my-schedule',
    method: 'get',
    response: () => {
      // 根据当前用户角色返回相应课表
      return {
        code: 0,
        message: '获取成功',
        data: mockSchedules
      }
    }
  },
  // 检查排课冲突
  {
    url: '/api/schedules/conflicts',
    method: 'post',
    response: ({ body }: { body: any }) => {
      // 简单的冲突检查逻辑
      const conflicts = mockSchedules.filter(schedule =>
        schedule.dayOfWeek === body.dayOfWeek &&
        schedule.startTime < body.endTime &&
        schedule.endTime > body.startTime &&
        (schedule.classroomId === body.classroomId ||
         schedule.courseOffering.teacher.id === body.teacherId)
      )

      return {
        code: 0,
        message: '检查完成',
        data: {
          hasConflict: conflicts.length > 0,
          conflicts
        }
      }
    }
  }
] as MockMethod[]
