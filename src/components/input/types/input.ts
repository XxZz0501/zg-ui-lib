import type { Track } from '@/types/track'
import type { InputProps as ElProps } from 'element-plus'

// 对外暴露的完整类型（用于 IDE 提示）
export type InputPropsWithEl = Track &
  Partial<ElProps> & {
    customClass?: string
  }

// 内部使用的精简类型（用于 defineProps）
export type InputProps = Track & {
  customClass?: string
}
