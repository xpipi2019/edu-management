<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">{{ errorCode }}</h1>
      <h2 class="error-title">{{ errorTitle }}</h2>
      <p class="error-description">{{ errorDescription }}</p>
      <div class="error-actions">
        <el-button type="primary" @click="goBack">返回上一页</el-button>
        <el-button @click="goHome">回到首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  code?: string | number
  title?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  code: '404',
  title: '页面不存在',
  description: '抱歉，您访问的页面不存在'
})

const router = useRouter()

const errorCode = computed(() => String(props.code))
const errorTitle = computed(() => props.title)
const errorDescription = computed(() => props.description)

const errorCodeColor = computed(() => {
  const code = String(props.code)
  if (code.startsWith('4')) return 'var(--el-color-warning)'
  if (code.startsWith('5')) return 'var(--el-color-danger)'
  return 'var(--el-color-primary)'
})

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-page;
}

.error-content {
  text-align: center;

  .error-code {
    font-size: 120px;
    font-weight: bold;
    color: v-bind(errorCodeColor);
    margin: 0;
    line-height: 1;
  }

  .error-title {
    font-size: 32px;
    color: $text-primary;
    margin: $spacing-lg 0;
  }

  .error-description {
    font-size: 16px;
    color: $text-secondary;
    margin-bottom: $spacing-xl;
  }

  .error-actions {
    display: flex;
    gap: $spacing-sm;
    justify-content: center;
  }
}
</style>
