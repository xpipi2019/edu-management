// 通用响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页响应类型
export interface PageResponse<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 分页查询参数
export interface PageQuery {
  page?: number
  pageSize?: number
  keyword?: string
}

// 表格列配置
export interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  formatter?: (row: any, column: any, cellValue: any) => string
}

// 表单规则
export interface FormRule {
  required?: boolean
  message?: string
  trigger?: string | string[]
  validator?: (rule: any, value: any, callback: any) => void
}

// 选项类型
export interface Option {
  label: string
  value: string | number
  disabled?: boolean
}

// 菜单项类型
export interface MenuItem {
  id: string
  title: string
  icon?: string
  path?: string
  children?: MenuItem[]
  permission?: string
}
