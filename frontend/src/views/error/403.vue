<template>
  <ErrorPage
    code="403"
    title="无权限访问"
    description="抱歉，您没有权限访问该页面"
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
    color: $danger-color;
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
