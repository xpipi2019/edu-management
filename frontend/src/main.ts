/**
 * @fileoverview 教育管理系统前端应用主入口文件
 * @description 初始化Vue应用，配置全局插件、路由和状态管理
 * @author XPIPI
 * @version 1.0.0
 * @date 2025-06-09
 * @license MIT
 * @copyright © 2025 XPIPI. All rights reserved.
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

// 全局样式
import '@/assets/styles/index.scss'

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化认证状态
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
