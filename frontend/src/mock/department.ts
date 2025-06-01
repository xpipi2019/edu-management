import type { MockMethod } from 'vite-plugin-mock'

// Mock部门数据
const mockDepartments = [
  {
    id: 1,
    name: '计算机学院',
    code: 'CS',
    parentId: undefined,
    description: '计算机科学与技术学院',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    children: [
      {
        id: 2,
        name: '软件工程系',
        code: 'SE',
        parentId: 1,
        description: '软件工程系',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        children: []
      },
      {
        id: 3,
        name: '计算机科学系',
        code: 'CS_DEPT',
        parentId: 1,
        description: '计算机科学系',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        children: []
      }
    ]
  },
  {
    id: 4,
    name: '数学学院',
    code: 'MATH',
    parentId: undefined,
    description: '数学学院',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    children: [
      {
        id: 5,
        name: '应用数学系',
        code: 'APPLIED_MATH',
        parentId: 4,
        description: '应用数学系',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        children: []
      }
    ]
  },
  {
    id: 6,
    name: '外国语学院',
    code: 'FOREIGN_LANG',
    parentId: undefined,
    description: '外国语学院',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    children: []
  }
]

// 扁平化部门数据（用于搜索和编辑）
const flatDepartments = [
  { id: 1, name: '计算机学院', code: 'CS', parentId: undefined, description: '计算机科学与技术学院', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 2, name: '软件工程系', code: 'SE', parentId: 1, description: '软件工程系', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 3, name: '计算机科学系', code: 'CS_DEPT', parentId: 1, description: '计算机科学系', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 4, name: '数学学院', code: 'MATH', parentId: undefined, description: '数学学院', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 5, name: '应用数学系', code: 'APPLIED_MATH', parentId: 4, description: '应用数学系', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 6, name: '外国语学院', code: 'FOREIGN_LANG', parentId: undefined, description: '外国语学院', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }
]

export default [
  // 获取部门树
  {
    url: '/api/departments/tree',
    method: 'get',
    response: () => {
      return {
        code: 0,
        message: '获取成功',
        data: mockDepartments
      }
    }
  },

  // 获取部门列表（分页）
  {
    url: '/api/departments',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10, name = '', parentId } = query

      let filteredDepartments = flatDepartments

      // 名称搜索
      if (name) {
        filteredDepartments = flatDepartments.filter(dept =>
          dept.name.includes(name)
        )
      }

      // 父级部门过滤
      if (parentId !== undefined) {
        filteredDepartments = filteredDepartments.filter(dept =>
          dept.parentId === parseInt(parentId)
        )
      }

      // 分页
      const start = (page - 1) * pageSize
      const end = start + parseInt(pageSize)
      const pageData = filteredDepartments.slice(start, end)

      return {
        code: 0,
        message: '获取成功',
        data: {
          list: pageData,
          total: filteredDepartments.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },

  // 创建部门
  {
    url: '/api/departments',
    method: 'post',
    response: ({ body }: any) => {
      const newDepartment = {
        id: Date.now(),
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      flatDepartments.push(newDepartment)

      // 重新构建树形结构
      rebuildDepartmentTree()

      return {
        code: 0,
        message: '创建成功',
        data: newDepartment
      }
    }
  },

  // 更新部门
  {
    url: '/api/departments/:id',
    method: 'put',
    response: ({ url, body }: any) => {
      const id = parseInt(url.split('/').pop())
      const index = flatDepartments.findIndex(dept => dept.id === id)

      if (index > -1) {
        flatDepartments[index] = {
          ...flatDepartments[index],
          ...body,
          updatedAt: new Date().toISOString()
        }

        // 重新构建树形结构
        rebuildDepartmentTree()

        return {
          code: 0,
          message: '更新成功',
          data: flatDepartments[index]
        }
      }

      return {
        code: 404,
        message: '部门不存在'
      }
    }
  },

  // 删除部门
  {
    url: '/api/departments/:id',
    method: 'delete',
    response: ({ url }: any) => {
      const id = parseInt(url.split('/').pop())

      // 检查是否有子部门
      const hasChildren = flatDepartments.some(dept => dept.parentId === id)
      if (hasChildren) {
        return {
          code: 400,
          message: '该部门下还有子部门，无法删除'
        }
      }

      const index = flatDepartments.findIndex(dept => dept.id === id)

      if (index > -1) {
        flatDepartments.splice(index, 1)

        // 重新构建树形结构
        rebuildDepartmentTree()

        return {
          code: 0,
          message: '删除成功'
        }
      }

      return {
        code: 404,
        message: '部门不存在'
      }
    }
  }
] as MockMethod[]

// 重新构建部门树形结构
function rebuildDepartmentTree() {
  // 这里应该重新构建mockDepartments树形结构
  // 为了简化，暂时不实现
}
