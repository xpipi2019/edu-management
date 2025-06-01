import type { MockMethod } from 'vite-plugin-mock'

// 教室接口
interface Classroom {
  id: number
  name: string
  building: string
  floor: number
  capacity: number
  type: string
  equipment: string[]
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
  createdAt: string
  updatedAt: string
}

// Mock教室数据
const mockClassrooms: Classroom[] = [
  {
    id: 1,
    name: 'A101',
    building: 'A栋',
    floor: 1,
    capacity: 60,
    type: '普通教室',
    equipment: ['投影仪', '音响', '黑板'],
    status: 'AVAILABLE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'A102',
    building: 'A栋',
    floor: 1,
    capacity: 60,
    type: '普通教室',
    equipment: ['投影仪', '音响', '黑板'],
    status: 'AVAILABLE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'B201',
    building: 'B栋',
    floor: 2,
    capacity: 80,
    type: '阶梯教室',
    equipment: ['投影仪', '音响', '电子白板', '话筒'],
    status: 'AVAILABLE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: 'C301',
    building: 'C栋',
    floor: 3,
    capacity: 40,
    type: '实验室',
    equipment: ['投影仪', '实验设备', '安全设施'],
    status: 'AVAILABLE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    name: 'D101',
    building: 'D栋',
    floor: 1,
    capacity: 30,
    type: '机房',
    equipment: ['电脑', '投影仪', '空调'],
    status: 'MAINTENANCE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

export default [
  // 获取教室列表
  {
    url: '/api/classrooms',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10, keyword = '', name = '', building = '', type = '', status = '' } = query

      let filteredClassrooms = [...mockClassrooms]

      // 关键词搜索
      if (keyword) {
        filteredClassrooms = filteredClassrooms.filter(classroom =>
          classroom.name.includes(keyword) ||
          classroom.building.includes(keyword) ||
          classroom.type.includes(keyword)
        )
      }

      // 按教室名搜索
      if (name) {
        filteredClassrooms = filteredClassrooms.filter(classroom =>
          classroom.name.includes(name)
        )
      }

      // 按建筑筛选
      if (building) {
        filteredClassrooms = filteredClassrooms.filter(classroom =>
          classroom.building.includes(building)
        )
      }

      // 按类型筛选
      if (type) {
        filteredClassrooms = filteredClassrooms.filter(classroom =>
          classroom.type === type
        )
      }

      // 按状态筛选
      if (status) {
        filteredClassrooms = filteredClassrooms.filter(classroom =>
          classroom.status === status
        )
      }

      // 分页
      const start = (page - 1) * pageSize
      const end = start + parseInt(pageSize)
      const pageData = filteredClassrooms.slice(start, end)

      return {
        code: 0,
        message: '获取成功',
        data: {
          list: pageData,
          total: filteredClassrooms.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },
  // 获取所有教室
  {
    url: '/api/classrooms/all',
    method: 'get',
    response: () => {
      return {
        code: 0,
        message: '获取成功',
        data: mockClassrooms
      }
    }
  },
  // 创建教室
  {
    url: '/api/classrooms',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newClassroom: Classroom = {
        id: mockClassrooms.length + 1,
        name: body.name,
        building: body.building,
        floor: body.floor,
        capacity: body.capacity,
        type: body.type,
        equipment: body.equipment || [],
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockClassrooms.push(newClassroom)
      return {
        code: 0,
        message: '创建成功',
        data: newClassroom
      }
    }
  },
  // 更新教室
  {
    url: '/api/classrooms/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: any }) => {
      const id = Number(url.split('/').pop())
      const classroomIndex = mockClassrooms.findIndex(c => c.id === id)
      if (classroomIndex === -1) {
        return {
          code: 404,
          message: '教室不存在'
        }
      }
      mockClassrooms[classroomIndex] = {
        ...mockClassrooms[classroomIndex],
        ...body,
        updatedAt: new Date().toISOString()
      }
      return {
        code: 0,
        message: '更新成功',
        data: mockClassrooms[classroomIndex]
      }
    }
  },
  // 删除教室
  {
    url: '/api/classrooms/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = Number(url.split('/').pop())
      const classroomIndex = mockClassrooms.findIndex(c => c.id === id)
      if (classroomIndex === -1) {
        return {
          code: 404,
          message: '教室不存在'
        }
      }
      mockClassrooms.splice(classroomIndex, 1)
      return {
        code: 0,
        message: '删除成功'
      }
    }
  },
  // 获取可用教室
  {
    url: '/api/classrooms/available',
    method: 'get',
    response: ({ query }: { query: any }) => {
      // 根据查询参数过滤可用教室
      let availableClassrooms = mockClassrooms.filter(c => c.status === 'AVAILABLE')

      if (query.capacity) {
        availableClassrooms = availableClassrooms.filter(c => c.capacity >= Number(query.capacity))
      }

      if (query.type) {
        availableClassrooms = availableClassrooms.filter(c => c.type === query.type)
      }

      if (query.building) {
        availableClassrooms = availableClassrooms.filter(c => c.building === query.building)
      }

      return {
        code: 0,
        message: '获取成功',
        data: availableClassrooms
      }
    }
  }
] as MockMethod[]
