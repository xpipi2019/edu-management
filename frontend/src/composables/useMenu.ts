import { computed } from 'vue'
import { SIDEBAR_MENU, type MenuItem } from '@/constants/menu'
import { usePermission } from './usePermission'

export const useMenu = () => {
  const { hasPermission } = usePermission()

  // 检查菜单项是否有权限访问
  const hasMenuPermission = (item: MenuItem): boolean => {
    if (!item.permission) return true
    
    // 添加调试日志
    const result = hasPermission(item.permission)
    console.log(`检查菜单权限: ${item.title}, 权限: ${Array.isArray(item.permission) ? item.permission.join(',') : item.permission}, 结果: ${result}`)
    return result
  }

  // 深拷贝菜单项
  const deepCloneMenuItem = (item: MenuItem): MenuItem => {
    return {
      ...item,
      children: item.children ? item.children.map(child => deepCloneMenuItem(child)) : undefined
    }
  }

  // 递归过滤菜单项
  const filterMenu = (menuItems: MenuItem[]): MenuItem[] => {
    console.log('开始过滤菜单项...')
    
    const filtered = menuItems
      .map(item => deepCloneMenuItem(item)) // 深拷贝避免修改原数组
      .filter(item => {
        // 如果菜单项被隐藏，直接过滤掉
        if (item.hidden) return false

        // 如果有子菜单，先过滤子菜单
        if (item.children && item.children.length > 0) {
          const filteredChildren = filterMenu(item.children)
          // 如果过滤后没有子菜单，且父菜单本身没有路径，则隐藏父菜单
          if (filteredChildren.length === 0 && !item.path) {
            console.log(`菜单 ${item.title} 没有可见的子菜单，且没有路径，将被隐藏`)
            return false
          }
          // 更新子菜单
          item.children = filteredChildren
        }

        // 检查当前菜单项的权限
        const hasPermission = hasMenuPermission(item)
        console.log(`菜单项 ${item.title} 权限检查结果: ${hasPermission}`)
        return hasPermission
      })
    
    console.log(`过滤后的菜单项数量: ${filtered.length}`)
    return filtered
  }

  // 过滤后的菜单
  const filteredMenus = computed(() => {
    const result = filterMenu(SIDEBAR_MENU)
    console.log('最终过滤后的菜单:', result)
    return result
  })

  // 获取所有有权限的叶子节点菜单（用于面包屑等）
  const getAllLeafMenus = (menuItems: MenuItem[] = filteredMenus.value): MenuItem[] => {
    const result: MenuItem[] = []

    menuItems.forEach(item => {
      if (item.children && item.children.length > 0) {
        result.push(...getAllLeafMenus(item.children))
      } else if (item.path) {
        result.push(item)
      }
    })

    return result
  }

  // 根据路径查找菜单项
  const findMenuByPath = (path: string, menuItems: MenuItem[] = filteredMenus.value): MenuItem | null => {
    for (const item of menuItems) {
      if (item.path === path) {
        return item
      }
      if (item.children && item.children.length > 0) {
        const found = findMenuByPath(path, item.children)
        if (found) return found
      }
    }
    return null
  }

  // 获取菜单路径层级（用于面包屑）
  const getMenuPath = (targetPath: string, menuItems: MenuItem[] = filteredMenus.value): MenuItem[] => {
    const findPath = (items: MenuItem[], path: MenuItem[] = []): MenuItem[] | null => {
      for (const item of items) {
        const currentPath = [...path, item]

        if (item.path === targetPath) {
          return currentPath
        }

        if (item.children && item.children.length > 0) {
          const found = findPath(item.children, currentPath)
          if (found) return found
        }
      }
      return null
    }

    return findPath(menuItems) || []
  }

  return {
    filteredMenus,
    hasMenuPermission,
    getAllLeafMenus,
    findMenuByPath,
    getMenuPath
  }
}
