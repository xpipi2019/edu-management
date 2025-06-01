<template>
  <ErrorPage
    code="404"
    title="页面不存在"
    description="抱歉，您访问的页面不存在"
  />
</template>

<script setup lang="ts">
import ErrorPage from '@/components/common/ErrorPage/index.vue'
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
    color: $warning-color;
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

  .el-button {
    margin: 0 $spacing-sm;
  }
}
</style>
