import type { Track } from '@/types/track'
import type { ButtonProps as ElButtonProps } from 'element-plus'

// 定义 ButtonProps 类型，结合 ElButtonProps 和 Track 类型
// Partial 将 ElButtonProps 的所有属性变为可选属性 否则在使用过程中IDE会报类型错误  & Partial<ElButtonProps>
// 对外暴露的完整类型（用于 IDE 提示）
export type ButtonPropsWithEl = Track &
  Partial<ElButtonProps> & {
    customClass?: string
  }

// 内部使用的精简类型（用于 defineProps）
export type ButtonProps = Track & {
  customClass?: string
}
