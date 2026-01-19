<template>
  <el-button v-bind="$attrs" :class="['zg-button', customClass]" @click="handleClick">
    <template #default>
      <slot name="default"></slot>
    </template>
  </el-button>
</template>

<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useTrackableEvents } from '@/composables/useTrackableEvent'
import type { ButtonProps } from '../types/button'

// 关闭自动 attrs 绑定
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ButtonProps>(), {
  customClass: '',
  trackable: false,
  trackName: 'button',
  trackLabel: '按钮',
  trackExtra: () => ({}),
})

const { handleClick } = useTrackableEvents(props, 'ZgButton')
</script>

<style scoped>
.zg-button {
}
</style>
