import { ref, reactive, type Ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'

interface TableQuery {
  page?: number
  pageSize?: number
  keyword?: string
  [key: string]: any
}

interface TableResponse<T> {
  list: T[]
  total: number
  page?: number
  pageSize?: number
}

interface UseTableManagementOptions<T, Q extends TableQuery = TableQuery> {
  // API函数
  fetchApi: (query: Q) => Promise<TableResponse<T>>
  deleteApi?: (id: number | string) => Promise<void>
  batchDeleteApi?: (ids: (number | string)[]) => Promise<void>

  // 初始查询参数
  initialQuery?: Partial<Q>

  // 自动获取数据
  immediate?: boolean
}

interface UseTableManagementReturn<T, Q> {
  // 数据状态
  loading: Ref<boolean>
  dataList: Ref<T[]>
  total: Ref<number>

  // 查询参数
  queryParams: Q

  // 搜索表单相关
  searchFormRef: Ref<FormInstance | undefined>

  // 核心方法
  fetchData: () => Promise<void>
  handleSearch: () => void
  handleReset: () => void
  handlePageChange: (page: number) => void
  handleSizeChange: (size: number) => void
  handleTableSearch: (keyword: string) => void

  // 操作方法
  handleDelete: (item: T & { id: number | string; name?: string }) => Promise<void>
  handleBatchDelete: (items: (T & { id: number | string })[]) => Promise<void>

  // 刷新数据
  refresh: () => Promise<void>
}

export function useTableManagement<T, Q extends TableQuery = TableQuery>(
  options: UseTableManagementOptions<T, Q>
): UseTableManagementReturn<T, Q> {
  const {
    fetchApi,
    deleteApi,
    batchDeleteApi,
    initialQuery = {},
    immediate = true
  } = options

  // 数据状态
  const loading = ref(false)
  const dataList = ref<T[]>([]) as Ref<T[]>
  const total = ref(0)

  // 表单引用
  const searchFormRef = ref<FormInstance>()

  // 查询参数
  const queryParams = reactive({
    page: 1,
    pageSize: 10,
    ...initialQuery
  }) as Q

  // 获取数据
  const fetchData = async () => {
    try {
      loading.value = true
      const response = await fetchApi(queryParams)
      dataList.value = response.list
      total.value = response.total
    } catch (error: any) {
      ElMessage.error(error.message || '获取数据失败')
      console.error('Failed to fetch data:', error)
    } finally {
      loading.value = false
    }
  }

  // 处理搜索
  const handleSearch = () => {
    queryParams.page = 1
    fetchData()
  }

  // 处理重置
  const handleReset = () => {
    searchFormRef.value?.resetFields()
    Object.assign(queryParams, {
      page: 1,
      pageSize: 10,
      ...initialQuery
    })
    fetchData()
  }

  // 处理页码变化
  const handlePageChange = (page: number) => {
    queryParams.page = page
    fetchData()
  }

  // 处理页大小变化
  const handleSizeChange = (size: number) => {
    queryParams.pageSize = size
    queryParams.page = 1
    fetchData()
  }

  // 处理表格搜索
  const handleTableSearch = (keyword: string) => {
    queryParams.keyword = keyword
    queryParams.page = 1
    fetchData()
  }

  // 处理删除
  const handleDelete = async (item: T & { id: number | string; name?: string }) => {
    if (!deleteApi) {
      ElMessage.warning('删除功能未配置')
      return
    }

    try {
      const itemName = (item as any).name || (item as any).realName || (item as any).title || '该项'
      await ElMessageBox.confirm(
        `确定要删除"${itemName}"？此操作不可恢复。`,
        '删除确认',
        {
          type: 'warning',
          confirmButtonText: '确定删除',
          cancelButtonText: '取消'
        }
      )

      await deleteApi(item.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '删除失败')
        console.error('Failed to delete item:', error)
      }
    }
  }

  // 处理批量删除
  const handleBatchDelete = async (items: (T & { id: number | string })[]) => {
    if (!batchDeleteApi) {
      ElMessage.warning('批量删除功能未配置')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${items.length} 项？此操作不可恢复。`,
        '批量删除确认',
        {
          type: 'warning',
          confirmButtonText: '确定删除',
          cancelButtonText: '取消'
        }
      )

      const ids = items.map(item => item.id)
      await batchDeleteApi(ids)
      ElMessage.success('批量删除成功')
      fetchData()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '批量删除失败')
        console.error('Failed to batch delete items:', error)
      }
    }
  }

  // 刷新数据
  const refresh = fetchData

  // 初始化
  if (immediate) {
    fetchData()
  }

  return {
    // 数据状态
    loading,
    dataList,
    total,

    // 查询参数
    queryParams,

    // 搜索表单相关
    searchFormRef,

    // 核心方法
    fetchData,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    handleTableSearch,

    // 操作方法
    handleDelete,
    handleBatchDelete,

    // 刷新数据
    refresh
  }
}
