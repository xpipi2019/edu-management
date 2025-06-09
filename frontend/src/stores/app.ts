/**
 * @fileoverview 教育管理系统前端应用状态管理
 * @description 管理应用全局状态，如侧边栏折叠状态等
 * @author XPIPI
 * @version 1.0.0
 * @date 2025-06-09
 * @license MIT
 * @copyright © 2025 XPIPI. All rights reserved.
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed'

export const useAppStore = defineStore('app', () => {
  // 从本地存储获取初始状态
  const getInitialCollapsedState = (): boolean => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    return stored ? JSON.parse(stored) : false
  }

  // 侧边栏是否折叠
  const sidebarCollapsed = ref(getInitialCollapsedState())

  // 监听状态变化，保存到本地存储
  watch(sidebarCollapsed, (newValue) => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(newValue))
  })

  // 切换侧边栏状态
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // 设置侧边栏状态
  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
  }

  return {
    sidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed
  }
})
