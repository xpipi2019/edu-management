<template>
  <div class="settings">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>系统设置</h2>
      <p>个性化配置和系统偏好设置</p>
    </div>

    <el-row :gutter="20">
      <!-- 设置面板 -->
      <el-col :span="16">
        <!-- 外观设置 -->
        <el-card class="setting-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Monitor /></el-icon>
              <span>外观设置</span>
            </div>
          </template>

          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <h4>主题模式</h4>
                <p>选择您喜欢的界面主题</p>
              </div>
              <div class="setting-control">
                <el-radio-group v-model="settings.theme" @change="handleThemeChange">
                  <el-radio-button label="light">浅色模式</el-radio-button>
                  <el-radio-button label="dark">深色模式</el-radio-button>
                  <el-radio-button label="auto">跟随系统</el-radio-button>
                </el-radio-group>
              </div>
            </div>

            <el-divider />

            <div class="setting-item">
              <div class="setting-label">
                <h4>主题色彩</h4>
                <p>自定义系统主要颜色</p>
              </div>
              <div class="setting-control">
                <div class="color-picker-group">
                  <div
                    v-for="color in presetColors"
                    :key="color"
                    class="color-option"
                    :class="{ active: settings.primaryColor === color }"
                    :style="{ backgroundColor: color }"
                    @click="handleColorChange(color)"
                  ></div>
                  <el-color-picker
                    v-model="settings.primaryColor"
                    @change="handleColorChange"
                    size="small"
                  />
                </div>
              </div>
            </div>

            <el-divider />

            <div class="setting-item">
              <div class="setting-label">
                <h4>字体大小</h4>
                <p>调整系统显示字体大小</p>
              </div>
              <div class="setting-control">
                <el-radio-group v-model="settings.fontSize" @change="handleFontSizeChange">
                  <el-radio-button label="small">小号</el-radio-button>
                  <el-radio-button label="medium">中号</el-radio-button>
                  <el-radio-button label="large">大号</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 语言设置 -->
        <el-card class="setting-card" shadow="never" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <el-icon><MessageBox /></el-icon>
              <span>语言设置</span>
            </div>
          </template>

          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <h4>界面语言</h4>
                <p>选择系统界面显示语言</p>
              </div>
              <div class="setting-control">
                <el-select v-model="settings.language" @change="handleLanguageChange">
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="English" value="en-US" />
                </el-select>
              </div>
            </div>

            <el-divider />

            <div class="setting-item">
              <div class="setting-label">
                <h4>时区设置</h4>
                <p>设置本地时区</p>
              </div>
              <div class="setting-control">
                <el-select v-model="settings.timezone" @change="handleTimezoneChange">
                  <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
                  <el-option label="纽约时间 (UTC-5)" value="America/New_York" />
                  <el-option label="伦敦时间 (UTC+0)" value="Europe/London" />
                </el-select>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 通知设置 -->
        <el-card class="setting-card" shadow="never" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <el-icon><Bell /></el-icon>
              <span>通知设置</span>
            </div>
          </template>

          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <h4>桌面通知</h4>
                <p>在浏览器中显示系统通知</p>
              </div>
              <div class="setting-control">
                <el-switch
                  v-model="settings.notifications.desktop"
                  @change="handleNotificationChange"
                />
              </div>
            </div>

            <el-divider />

            <div class="setting-item">
              <div class="setting-label">
                <h4>邮件通知</h4>
                <p>通过邮件接收重要系统消息</p>
              </div>
              <div class="setting-control">
                <el-switch
                  v-model="settings.notifications.email"
                  @change="handleNotificationChange"
                />
              </div>
            </div>

            <el-divider />

            <div class="setting-item">
              <div class="setting-label">
                <h4>声音提示</h4>
                <p>播放通知提示音</p>
              </div>
              <div class="setting-control">
                <el-switch
                  v-model="settings.notifications.sound"
                  @change="handleNotificationChange"
                />
              </div>
            </div>
          </div>
        </el-card>

        <!-- 隐私设置 -->
        <el-card class="setting-card" shadow="never" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <el-icon><Lock /></el-icon>
              <span>隐私设置</span>
            </div>
          </template>

          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-label">
                <h4>个人信息可见性</h4>
                <p>控制其他用户能查看您的信息范围</p>
              </div>
              <div class="setting-control">
                <el-select v-model="settings.privacy.profileVisibility">
                  <el-option label="公开" value="public" />
                  <el-option label="仅同学/同事" value="colleagues" />
                  <el-option label="私密" value="private" />
                </el-select>
              </div>
            </div>

            <el-divider />

            <div class="setting-item">
              <div class="setting-label">
                <h4>活动状态</h4>
                <p>显示在线状态和最后活动时间</p>
              </div>
              <div class="setting-control">
                <el-switch
                  v-model="settings.privacy.showOnlineStatus"
                  @change="handlePrivacyChange"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 操作面板 -->
      <el-col :span="8">
        <el-card class="setting-card" shadow="never">
          <template #header>
            <span>操作</span>
          </template>

          <div class="action-group">
            <el-button type="primary" @click="saveSettings" :loading="saving" class="action-button">
              <el-icon><Check /></el-icon>
              保存设置
            </el-button>

            <el-button @click="resetSettings" class="action-button">
              <el-icon><Refresh /></el-icon>
              恢复默认
            </el-button>

            <el-divider />

            <el-button @click="exportSettings" class="action-button">
              <el-icon><Download /></el-icon>
              导出设置
            </el-button>

            <el-button @click="showImportDialog = true" class="action-button">
              <el-icon><Upload /></el-icon>
              导入设置
            </el-button>
          </div>
        </el-card>

        <!-- 设置预览 -->
        <el-card class="setting-card" shadow="never" style="margin-top: 20px;">
          <template #header>
            <span>设置预览</span>
          </template>

          <div class="preview-content">
            <div class="preview-item">
              <span class="preview-label">主题:</span>
              <span class="preview-value">{{ getThemeText(settings.theme) }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">语言:</span>
              <span class="preview-value">{{ getLanguageText(settings.language) }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">字体:</span>
              <span class="preview-value">{{ getFontSizeText(settings.fontSize) }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">通知:</span>
              <span class="preview-value">{{ getNotificationStatus() }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 导入设置对话框 -->
    <el-dialog
      v-model="showImportDialog"
      title="导入设置"
      width="500px"
    >
      <div class="import-content">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          accept=".json"
          drag
        >
          <el-icon class="el-icon--upload"><Upload /></el-icon>
          <div class="el-upload__text">
            将设置文件拖拽到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只支持 JSON 格式的设置文件
            </div>
          </template>
        </el-upload>
      </div>

      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" @click="importSettings" :loading="importing">
          导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Monitor,
  MessageBox,
  Bell,
  Lock,
  Check,
  Refresh,
  Download,
  Upload
} from '@element-plus/icons-vue'

// 响应式数据
const saving = ref(false)
const importing = ref(false)
const showImportDialog = ref(false)
const uploadRef = ref()
const importFile = ref<File | null>(null)

// 预设颜色
const presetColors = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399',
  '#606266',
  '#303133'
]

// 设置数据
const settings = reactive({
  theme: 'light',
  primaryColor: '#409EFF',
  fontSize: 'medium',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  notifications: {
    desktop: true,
    email: true,
    sound: false
  },
  privacy: {
    profileVisibility: 'colleagues',
    showOnlineStatus: true
  }
})

// 加载设置
const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem('systemSettings')
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings)
      Object.assign(settings, parsedSettings)
      applySettings()
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 应用设置
const applySettings = () => {
  // 应用主题
  document.documentElement.setAttribute('data-theme', settings.theme)

  // 应用主题色
  document.documentElement.style.setProperty('--el-color-primary', settings.primaryColor)

  // 应用字体大小
  const fontSizeMap: Record<string, string> = {
    small: '12px',
    medium: '14px',
    large: '16px'
  }
  document.documentElement.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize] || '14px')
}

// 保存设置
const saveSettings = async () => {
  try {
    saving.value = true

    // 保存到本地存储
    localStorage.setItem('systemSettings', JSON.stringify(settings))

    // 应用设置
    applySettings()

    // 这里可以调用API保存到服务器
    // await settingsApi.save(settings)

    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

// 重置设置
const resetSettings = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要恢复默认设置吗？此操作不可撤销。',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 恢复默认设置
    Object.assign(settings, {
      theme: 'light',
      primaryColor: '#409EFF',
      fontSize: 'medium',
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      notifications: {
        desktop: true,
        email: true,
        sound: false
      },
      privacy: {
        profileVisibility: 'colleagues',
        showOnlineStatus: true
      }
    })

    // 保存并应用
    await saveSettings()
    ElMessage.success('已恢复默认设置')
  } catch (error) {
    // 用户取消操作
  }
}

// 导出设置
const exportSettings = () => {
  try {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `system-settings-${new Date().toISOString().split('T')[0]}.json`
    link.click()

    ElMessage.success('设置导出成功')
  } catch (error) {
    console.error('导出设置失败:', error)
    ElMessage.error('导出设置失败')
  }
}

// 处理文件选择
const handleFileChange = (file: any) => {
  importFile.value = file.raw
}

// 导入设置
const importSettings = async () => {
  if (!importFile.value) {
    ElMessage.error('请选择要导入的文件')
    return
  }

  try {
    importing.value = true

    const fileContent = await importFile.value.text()
    const importedSettings = JSON.parse(fileContent)

    // 验证设置格式
    if (typeof importedSettings !== 'object') {
      throw new Error('无效的设置文件格式')
    }

    // 合并设置
    Object.assign(settings, importedSettings)

    // 保存并应用
    await saveSettings()

    showImportDialog.value = false
    ElMessage.success('设置导入成功')
  } catch (error) {
    console.error('导入设置失败:', error)
    ElMessage.error('导入设置失败：文件格式不正确')
  } finally {
    importing.value = false
    importFile.value = null
  }
}

// 事件处理函数
const handleThemeChange = (theme: string) => {
  applySettings()
}

const handleColorChange = (color: string) => {
  settings.primaryColor = color
  applySettings()
}

const handleFontSizeChange = (fontSize: string) => {
  applySettings()
}

const handleLanguageChange = (language: string) => {
  ElMessage.info('语言切换功能开发中...')
}

const handleTimezoneChange = (timezone: string) => {
  ElMessage.info('时区设置功能开发中...')
}

const handleNotificationChange = () => {
  // 处理通知设置变更
}

const handlePrivacyChange = () => {
  // 处理隐私设置变更
}

// 工具函数
const getThemeText = (theme: string) => {
  const themeMap: Record<string, string> = {
    light: '浅色模式',
    dark: '深色模式',
    auto: '跟随系统'
  }
  return themeMap[theme] || theme
}

const getLanguageText = (language: string) => {
  const languageMap: Record<string, string> = {
    'zh-CN': '简体中文',
    'en-US': 'English'
  }
  return languageMap[language] || language
}

const getFontSizeText = (fontSize: string) => {
  const fontSizeMap: Record<string, string> = {
    small: '小号',
    medium: '中号',
    large: '大号'
  }
  return fontSizeMap[fontSize] || fontSize
}

const getNotificationStatus = () => {
  const enabledCount = Object.values(settings.notifications).filter(Boolean).length
  return `${enabledCount}/3 项已启用`
}

// 生命周期
onMounted(() => {
  loadSettings()
})
</script>

<style lang="scss" scoped>
.settings {
  padding: $spacing-lg;
  background-color: $bg-page;
  min-height: 100vh;
}

.page-header {
  margin-bottom: $spacing-xl;

  h2 {
    color: $text-primary;
    margin: 0 0 $spacing-xs 0;
    font-size: 24px;
    font-weight: 600;
  }

  p {
    color: $text-regular;
    margin: 0;
    font-size: 14px;
  }
}

.setting-card {
  border: none;
  box-shadow: $box-shadow-light;

  .card-header {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-weight: 600;
  }
}

.setting-group {
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: $spacing-md 0;

    .setting-label {
      flex: 1;
      margin-right: $spacing-lg;

      h4 {
        margin: 0 0 $spacing-xs 0;
        font-size: 16px;
        font-weight: 500;
        color: $text-primary;
      }

      p {
        margin: 0;
        font-size: 13px;
        color: $text-regular;
        line-height: 1.4;
      }
    }

    .setting-control {
      flex-shrink: 0;
      min-width: 200px;
    }
  }
}

.color-picker-group {
  display: flex;
  align-items: center;
  gap: $spacing-xs;

  .color-option {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.3s;

    &:hover {
      transform: scale(1.1);
    }

    &.active {
      border-color: $text-primary;
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
    }
  }
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  .action-button {
    width: 100%;
    justify-content: flex-start;

    .el-icon {
      margin-right: $spacing-xs;
    }
  }
}

.preview-content {
  .preview-item {
    display: flex;
    justify-content: space-between;
    padding: $spacing-sm 0;
    border-bottom: 1px solid $border-lighter;

    &:last-child {
      border-bottom: none;
    }

    .preview-label {
      color: $text-regular;
      font-size: 13px;
    }

    .preview-value {
      color: $text-primary;
      font-size: 13px;
      font-weight: 500;
    }
  }
}

.import-content {
  margin: $spacing-lg 0;
}

// 响应式设计
@media (max-width: 768px) {
  .settings {
    padding: $spacing-md;
  }

  .setting-item {
    flex-direction: column;
    align-items: stretch !important;

    .setting-label {
      margin-right: 0 !important;
      margin-bottom: $spacing-md;
    }

    .setting-control {
      min-width: auto;
    }
  }
}
</style>
