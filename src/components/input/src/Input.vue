<template>
  <el-input
    v-bind="$attrs"
    :class="['zg-input', customClass]"
    @click="handleClick"
    @blur="handleBlur"
  >
    <!-- <template v-for="(_, slotName) in $slots" #[slotName]="scope">
      <slot :name="slotName" v-bind="scope"></slot>
    </template> -->
    <template #prefix><slot name="prefix" /></template>
    <template #suffix><slot name="suffix" /></template>
    <template #prepend><slot name="prepend" /></template>
    <template #append><slot name="append" /></template>
  </el-input>
</template>

<script setup lang="ts">
import { useSlots } from 'vue'
import { ElInput } from 'element-plus'
import { useTrackableEvents } from '@/composables/useTrackableEvent'
import type { InputProps } from '../types/input'

// 关闭自动 attrs 绑定
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<InputProps>(), {
  customClass: '',
  trackable: false,
  trackName: 'input',
  trackLabel: 'input输入框',
  trackExtra: () => ({}),
})

const slots = useSlots()

setTimeout(() => {
  console.log('slots', slots)
})

const { handleClick, handleBlur } = useTrackableEvents(props, 'ZgInput')
</script>

<style scoped>
.zg-input {
}
</style>
