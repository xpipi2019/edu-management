<template>
  <div class="base-table">
    <!-- 表格工具栏 -->
    <div class="table-toolbar" v-if="showToolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left">
          <el-button
            v-if="showAdd"
            type="primary"
            :icon="Plus"
            @click="$emit('add')"
          >
            {{ addText }}
          </el-button>
          <el-button
            v-if="showBatchDelete && selectedRows.length > 0"
            type="danger"
            :icon="Delete"
            @click="$emit('batch-delete', selectedRows)"
          >
            批量删除 ({{ selectedRows.length }})
          </el-button>
        </slot>
      </div>

      <div class="toolbar-right">
        <slot name="toolbar-right">
          <el-input
            v-if="showSearch"
            v-model="searchKeyword"
            :placeholder="searchPlaceholder"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            style="width: 240px"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
          <el-button :icon="Refresh" @click="$emit('refresh')" circle />
        </slot>
      </div>
    </div>

    <!-- 表格主体 -->
    <el-table
      ref="tableRef"
      :data="data"
      :loading="loading"
      v-bind="$attrs"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      style="width: 100%"
    >
      <!-- 选择列 -->
      <el-table-column
        v-if="showSelection"
        type="selection"
        width="50"
        align="center"
      />

      <!-- 序号列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        label="序号"
        width="70"
        align="center"
        :index="getIndex"
      />

      <!-- 数据列 -->
      <slot />

      <!-- 操作列 -->
      <el-table-column
        v-if="showActions"
        :label="actionLabel"
        :width="actionWidth"
        align="center"
        fixed="right"
      >
        <template #default="scope">
          <slot name="actions" :row="scope.row" :index="scope.$index">
            <el-button
              type="primary"
              size="small"
              link
              @click="$emit('edit', scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="$emit('delete', scope.row)"
            >
              删除
            </el-button>
          </slot>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="table-pagination" v-if="showPagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElTable } from 'element-plus'
import { Plus, Delete, Search, Refresh } from '@element-plus/icons-vue'

interface Props {
  // 表格数据
  data: any[]
  // 加载状态
  loading?: boolean
  // 分页相关
  showPagination?: boolean
  total?: number
  page?: number
  pageSize?: number
  pageSizes?: number[]
  // 工具栏
  showToolbar?: boolean
  showAdd?: boolean
  addText?: string
  showBatchDelete?: boolean
  showSearch?: boolean
  searchPlaceholder?: string
  // 表格配置
  showSelection?: boolean
  showIndex?: boolean
  showActions?: boolean
  actionLabel?: string
  actionWidth?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showPagination: true,
  total: 0,
  page: 1,
  pageSize: 10,
  pageSizes: () => [10, 20, 50, 100],
  showToolbar: true,
  showAdd: true,
  addText: '新增',
  showBatchDelete: true,
  showSearch: true,
  searchPlaceholder: '请输入关键词搜索',
  showSelection: true,
  showIndex: true,
  showActions: true,
  actionLabel: '操作',
  actionWidth: 160
})

interface Emits {
  (e: 'add'): void
  (e: 'edit', row: any): void
  (e: 'delete', row: any): void
  (e: 'batch-delete', rows: any[]): void
  (e: 'refresh'): void
  (e: 'search', keyword: string): void
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'sort-change', sort: { column: any; prop: string; order: string }): void
}

const emit = defineEmits<Emits>()

// 表格引用
const tableRef = ref<InstanceType<typeof ElTable>>()

// 分页数据
const currentPage = ref(props.page)
const pageSize = ref(props.pageSize)

// 搜索关键词
const searchKeyword = ref('')

// 选中的行
const selectedRows = ref<any[]>([])

// 序号计算
const getIndex = (index: number) => {
  return (currentPage.value - 1) * pageSize.value + index + 1
}

// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 处理排序变化
const handleSortChange = (sort: { column: any; prop: string; order: string }) => {
  emit('sort-change', sort)
}

// 处理搜索
const handleSearch = () => {
  emit('search', searchKeyword.value)
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  emit('page-change', page)
}

// 处理页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  emit('size-change', size)
}

// 监听props变化
watch(() => props.page, (newPage) => {
  currentPage.value = newPage
})

watch(() => props.pageSize, (newPageSize) => {
  pageSize.value = newPageSize
})

// 清空选择
const clearSelection = () => {
  tableRef.value?.clearSelection()
}

// 暴露方法
defineExpose({
  clearSelection,
  tableRef
})
</script>

<style lang="scss" scoped>
.base-table {
  .table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .table-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
