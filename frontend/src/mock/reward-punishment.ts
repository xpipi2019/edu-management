import type { MockMethod } from 'vite-plugin-mock'

// 奖惩类型枚举
enum RewardPunishmentType {
  REWARD = 'REWARD',
  PUNISHMENT = 'PUNISHMENT'
}

// 奖惩等级枚举
enum RewardPunishmentLevel {
  // 奖励等级
  PRAISE = 'PRAISE',               // 表扬
  MERIT = 'MERIT',                 // 嘉奖
  THIRD_CLASS_MERIT = 'THIRD_CLASS_MERIT',     // 三等功
  SECOND_CLASS_MERIT = 'SECOND_CLASS_MERIT',   // 二等功
  FIRST_CLASS_MERIT = 'FIRST_CLASS_MERIT',     // 一等功

  // 处分等级
  WARNING = 'WARNING',             // 警告
  SERIOUS_WARNING = 'SERIOUS_WARNING',         // 严重警告
  DEMERIT = 'DEMERIT',            // 记过
  SERIOUS_DEMERIT = 'SERIOUS_DEMERIT',         // 记大过
  PROBATION = 'PROBATION',         // 留校察看
  EXPULSION = 'EXPULSION'          // 开除学籍
}

// 奖惩记录接口
interface RewardPunishment {
  id: number
  studentId: number
  type: RewardPunishmentType
  level: RewardPunishmentLevel
  title: string
  reason: string
  date: string
  processedBy: number
  remarks?: string
  isActive: boolean
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
  processor: {
    id: number
    realName: string
  }
  createdAt: string
  updatedAt: string
}

// Mock奖惩数据
const mockRewardPunishments: RewardPunishment[] = [
  {
    id: 1,
    studentId: 4,
    type: RewardPunishmentType.REWARD,
    level: RewardPunishmentLevel.MERIT,
    title: '优秀学生干部',
    reason: '在学生会工作中表现突出，积极组织各类活动',
    date: '2024-06-01',
    processedBy: 1,
    remarks: '连续两学期表现优秀',
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
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
    processor: {
      id: 1,
      realName: '管理员'
    }
  },
  {
    id: 2,
    studentId: 5,
    type: RewardPunishmentType.PUNISHMENT,
    level: RewardPunishmentLevel.WARNING,
    title: '违反宿舍管理规定',
    reason: '宿舍内私拉电线，存在安全隐患',
    date: '2024-05-15',
    processedBy: 2,
    remarks: '已整改，需要加强安全意识',
    isActive: true,
    createdAt: '2024-05-15T00:00:00Z',
    updatedAt: '2024-05-15T00:00:00Z',
    student: {
      id: 5,
      studentId: 'S2024002',
      user: {
        id: 5,
        realName: '王同学',
        email: 'student2@example.com',
        phone: '13800138005'
      }
    },
    processor: {
      id: 2,
      realName: '宿管老师'
    }
  },
  {
    id: 3,
    studentId: 4,
    type: RewardPunishmentType.REWARD,
    level: RewardPunishmentLevel.PRAISE,
    title: '学习进步奖',
    reason: '本学期学习成绩显著提升',
    date: '2024-07-10',
    processedBy: 1,
    isActive: true,
    createdAt: '2024-07-10T00:00:00Z',
    updatedAt: '2024-07-10T00:00:00Z',
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
    processor: {
      id: 1,
      realName: '管理员'
    }
  }
]

export default [
  // 获取奖惩列表
  {
    url: '/api/reward-punishments',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 20, studentId, type, level, startDate, endDate, processedBy, isActive } = query

      let filteredRecords = [...mockRewardPunishments]

      // 按学生筛选
      if (studentId) {
        filteredRecords = filteredRecords.filter(record =>
          record.studentId === parseInt(studentId) ||
          record.student.studentId.includes(studentId)
        )
      }

      // 按类型筛选
      if (type) {
        filteredRecords = filteredRecords.filter(record => record.type === type)
      }

      // 按级别筛选
      if (level) {
        filteredRecords = filteredRecords.filter(record => record.level === level)
      }

      // 按日期范围筛选
      if (startDate) {
        filteredRecords = filteredRecords.filter(record => record.date >= startDate)
      }
      if (endDate) {
        filteredRecords = filteredRecords.filter(record => record.date <= endDate)
      }

      // 按处理人筛选
      if (processedBy) {
        filteredRecords = filteredRecords.filter(record => record.processedBy === parseInt(processedBy))
      }

      // 按状态筛选
      if (isActive !== undefined) {
        filteredRecords = filteredRecords.filter(record => record.isActive === (isActive === 'true'))
      }

      // 分页
      const start = (page - 1) * pageSize
      const end = start + parseInt(pageSize)
      const pageData = filteredRecords.slice(start, end)

      return {
        code: 0,
        message: '获取成功',
        data: {
          list: pageData,
          total: filteredRecords.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },
  // 获取奖惩记录详情
  {
    url: '/api/reward-punishments/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/').pop())
      const record = mockRewardPunishments.find(r => r.id === id)
      if (!record) {
        return {
          code: 404,
          message: '记录不存在'
        }
      }
      return {
        code: 0,
        message: '获取成功',
        data: record
      }
    }
  },
  // 创建奖惩记录
  {
    url: '/api/reward-punishments',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newRecord: RewardPunishment = {
        id: mockRewardPunishments.length + 1,
        studentId: body.studentId,
        type: body.type,
        level: body.level,
        title: body.title,
        reason: body.reason,
        date: body.date,
        processedBy: 1, // 当前用户ID
        remarks: body.remarks,
        isActive: true,
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
        },
        processor: {
          id: 1,
          realName: '处理人'
        }
      }
      mockRewardPunishments.push(newRecord)
      return {
        code: 0,
        message: '创建成功',
        data: newRecord
      }
    }
  },
  // 更新奖惩记录
  {
    url: '/api/reward-punishments/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = Number(url.split('/').pop())
      const recordIndex = mockRewardPunishments.findIndex(r => r.id === id)
      if (recordIndex === -1) {
        return {
          code: 404,
          message: '奖惩记录不存在'
        }
      }
      mockRewardPunishments[recordIndex] = {
        ...mockRewardPunishments[recordIndex],
        ...body,
        updatedAt: new Date().toISOString()
      }
      return {
        code: 0,
        message: '更新成功',
        data: mockRewardPunishments[recordIndex]
      }
    }
  },
  // 删除奖惩记录
  {
    url: '/api/reward-punishments/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/').pop())
      const recordIndex = mockRewardPunishments.findIndex(r => r.id === id)
      if (recordIndex === -1) {
        return {
          code: 404,
          message: '奖惩记录不存在'
        }
      }
      mockRewardPunishments.splice(recordIndex, 1)
      return {
        code: 0,
        message: '删除成功'
      }
    }
  },
  // 获取学生的奖惩历史
  {
    url: '/api/students/:studentId/reward-punishments',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const studentId = Number(url.split('/')[3])
      const studentRecords = mockRewardPunishments.filter(r => r.studentId === studentId)
      return {
        code: 0,
        message: '获取成功',
        data: studentRecords
      }
    }
  },
  // 获取奖惩统计信息
  {
    url: '/api/reward-punishments/statistics',
    method: 'get',
    response: ({ query }: any) => {
      const { startDate, endDate } = query

      let records = [...mockRewardPunishments]

      // 按日期范围筛选
      if (startDate) {
        records = records.filter(record => record.date >= startDate)
      }
      if (endDate) {
        records = records.filter(record => record.date <= endDate)
      }

      const rewards = records.filter(r => r.type === RewardPunishmentType.REWARD)
      const punishments = records.filter(r => r.type === RewardPunishmentType.PUNISHMENT)

      // 按等级统计奖励
      const rewardsByLevel: Record<string, number> = {}
      rewards.forEach(r => {
        rewardsByLevel[r.level] = (rewardsByLevel[r.level] || 0) + 1
      })

      // 按等级统计处分
      const punishmentsByLevel: Record<string, number> = {}
      punishments.forEach(r => {
        punishmentsByLevel[r.level] = (punishmentsByLevel[r.level] || 0) + 1
      })

      // 月度趋势（简化版）
      const monthlyTrend = [
        { month: '2024-01', rewards: 5, punishments: 2 },
        { month: '2024-02', rewards: 3, punishments: 1 },
        { month: '2024-03', rewards: 8, punishments: 3 },
        { month: '2024-04', rewards: 6, punishments: 2 },
        { month: '2024-05', rewards: 4, punishments: 4 },
        { month: '2024-06', rewards: 7, punishments: 1 }
      ]

      return {
        code: 0,
        message: '获取成功',
        data: {
          totalRewards: rewards.length,
          totalPunishments: punishments.length,
          rewardsByLevel,
          punishmentsByLevel,
          monthlyTrend
        }
      }
    }
  }
] as MockMethod[]
