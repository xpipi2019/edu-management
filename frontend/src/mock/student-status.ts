import type { MockMethod } from 'vite-plugin-mock'

// 学籍状态变更类型枚举
enum StudentStatusChangeType {
  ENROLLMENT = 'ENROLLMENT',      // 入学
  SUSPENSION = 'SUSPENSION',      // 休学
  RESUMPTION = 'RESUMPTION',      // 复学
  WITHDRAWAL = 'WITHDRAWAL',      // 退学
  GRADUATION = 'GRADUATION',      // 毕业
  TRANSFER_IN = 'TRANSFER_IN',    // 转入
  TRANSFER_OUT = 'TRANSFER_OUT',  // 转出
  MAJOR_CHANGE = 'MAJOR_CHANGE'   // 转专业
}

// 学籍状态变更记录接口
interface StudentStatusChange {
  id: number
  studentId: number
  changeType: StudentStatusChangeType
  fromStatus?: string
  toStatus: string
  reason: string
  effectiveDate: string
  approvedBy?: number
  approvedAt?: string
  remarks?: string
  student: {
    id: number
    studentId: string
    user: {
      id: number
      realName: string
      email: string
      phone: string
    }
  }
  approver?: {
    id: number
    realName: string
  }
  createdAt: string
  updatedAt: string
}

// Mock学籍状态变更数据
const mockStudentStatusChanges: StudentStatusChange[] = [
  {
    id: 1,
    studentId: 4,
    changeType: StudentStatusChangeType.ENROLLMENT,
    toStatus: '在读',
    reason: '正常入学',
    effectiveDate: '2024-09-01',
    approvedBy: 1,
    approvedAt: '2024-08-25T10:00:00Z',
    createdAt: '2024-08-20T00:00:00Z',
    updatedAt: '2024-08-25T10:00:00Z',
    student: {
      id: 4,
      studentId: 'S2024001',
      user: {
        id: 4,
        realName: '李同学',
        email: 'student@example.com',
        phone: '13800138004'
      }
    },
    approver: {
      id: 1,
      realName: '管理员'
    }
  },
  {
    id: 2,
    studentId: 5,
    changeType: StudentStatusChangeType.SUSPENSION,
    fromStatus: '在读',
    toStatus: '休学',
    reason: '家庭原因需要休学一学期',
    effectiveDate: '2024-10-01',
    remarks: '预计2025年春季学期复学',
    createdAt: '2024-09-15T00:00:00Z',
    updatedAt: '2024-09-15T00:00:00Z',
    student: {
      id: 5,
      studentId: 'S2024002',
      user: {
        id: 5,
        realName: '王同学',
        email: 'student2@example.com',
        phone: '13800138005'
      }
    }
  }
]

export default [
  // 获取学籍状态变更列表
  {
    url: '/api/student-status',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 20, studentId, changeType, startDate, endDate } = query

      let filteredChanges = [...mockStudentStatusChanges]

      // 按学生筛选
      if (studentId) {
        filteredChanges = filteredChanges.filter(change =>
          change.studentId === parseInt(studentId) ||
          change.student.studentId.includes(studentId)
        )
      }

      // 按变更类型筛选
      if (changeType) {
        filteredChanges = filteredChanges.filter(change => change.changeType === changeType)
      }

      // 按日期范围筛选
      if (startDate) {
        filteredChanges = filteredChanges.filter(change => change.effectiveDate >= startDate)
      }
      if (endDate) {
        filteredChanges = filteredChanges.filter(change => change.effectiveDate <= endDate)
      }

      // 分页
      const start = (page - 1) * pageSize
      const end = start + parseInt(pageSize)
      const pageData = filteredChanges.slice(start, end)

      return {
        code: 0,
        message: '获取成功',
        data: {
          list: pageData,
          total: filteredChanges.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },
  // 获取学籍状态变更详情
  {
    url: '/api/student-status/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/').pop())
      const change = mockStudentStatusChanges.find(c => c.id === id)
      if (!change) {
        return {
          code: 404,
          message: '记录不存在'
        }
      }
      return {
        code: 0,
        message: '获取成功',
        data: change
      }
    }
  },
  // 创建学籍状态变更申请
  {
    url: '/api/student-status',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newChange: StudentStatusChange = {
        id: mockStudentStatusChanges.length + 1,
        studentId: body.studentId,
        changeType: body.changeType,
        fromStatus: body.fromStatus,
        toStatus: body.toStatus,
        reason: body.reason,
        effectiveDate: body.effectiveDate,
        remarks: body.remarks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        student: {
          id: body.studentId,
          studentId: 'S2024' + String(body.studentId).padStart(3, '0'),
          user: {
            id: body.studentId,
            realName: '学生姓名',
            email: 'student@example.com',
            phone: '13800138000'
          }
        }
      }
      mockStudentStatusChanges.push(newChange)
      return {
        code: 0,
        message: '创建成功',
        data: newChange
      }
    }
  },
  // 更新学籍状态变更
  {
    url: '/api/student-status/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = Number(url.split('/').pop())
      const changeIndex = mockStudentStatusChanges.findIndex(c => c.id === id)
      if (changeIndex === -1) {
        return {
          code: 404,
          message: '记录不存在'
        }
      }
      mockStudentStatusChanges[changeIndex] = {
        ...mockStudentStatusChanges[changeIndex],
        ...body,
        updatedAt: new Date().toISOString()
      }
      return {
        code: 0,
        message: '更新成功',
        data: mockStudentStatusChanges[changeIndex]
      }
    }
  },
  // 删除学籍状态变更
  {
    url: '/api/student-status/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/').pop())
      const changeIndex = mockStudentStatusChanges.findIndex(c => c.id === id)
      if (changeIndex === -1) {
        return {
          code: 404,
          message: '记录不存在'
        }
      }
      mockStudentStatusChanges.splice(changeIndex, 1)
      return {
        code: 0,
        message: '删除成功'
      }
    }
  },
  // 获取学生的状态变更历史
  {
    url: '/api/students/:studentId/status-history',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const studentId = Number(url.split('/')[3])
      const studentHistory = mockStudentStatusChanges.filter(c => c.studentId === studentId)
      return {
        code: 0,
        message: '获取成功',
        data: studentHistory
      }
    }
  }
] as MockMethod[]
