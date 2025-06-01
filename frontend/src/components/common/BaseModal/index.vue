<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :top="top"
    :modal="modal"
    :modal-class="modalClass"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :before-close="handleBeforeClose"
    :destroy-on-close="destroyOnClose"
    v-bind="$attrs"
  >
    <!-- 默认插槽 -->
    <slot />

    <!-- 底部操作区 -->
    <template #footer v-if="showFooter">
      <slot name="footer">
        <div class="dialog-footer">
          <el-button @click="handleCancel" :loading="loading">
            {{ cancelText }}
          </el-button>
          <el-button
            type="primary"
            @click="handleConfirm"
            :loading="loading"
          >
            {{ confirmText }}
          </el-button>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // 显示状态
  modelValue: boolean
  // 标题
  title?: string
  // 尺寸
  width?: string | number
  top?: string
  // 行为配置
  modal?: boolean
  modalClass?: string
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  showClose?: boolean
  destroyOnClose?: boolean
  // 底部配置
  showFooter?: boolean
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: '500px',
  top: '15vh',
  modal: true,
  closeOnClickModal: false,
  closeOnPressEscape: true,
  showClose: true,
  destroyOnClose: false,
  showFooter: true,
  confirmText: '确定',
  cancelText: '取消',
  loading: false
})

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

// 双向绑定
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})

// 处理确认
const handleConfirm = () => {
  emit('confirm')
}

// 处理取消
const handleCancel = () => {
  emit('cancel')
  dialogVisible.value = false
}

// 处理关闭前回调
const handleBeforeClose = (done: () => void) => {
  emit('close')
  done()
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
