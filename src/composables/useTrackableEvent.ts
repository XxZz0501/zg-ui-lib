/**
 * 通用埋点事件处理 Hook
 *
 * 功能：
 * - 自动为组件注入带埋点能力的事件处理器（如 click / blur）
 * - 在触发事件时：
 *   1. 若开启埋点（trackable=true），调用 debugTrack 输出结构化日志
 *   2. 透传原始事件给父组件（通过 $attrs 中的同名 handler）
 * - 支持合并自定义埋点数据（props.trackExtra + 调用时传入的 detail）
 *
 * 使用示例（在组件内）：
 * ```ts
 * const { handleClick, handleBlur } = useTrackableEvents(props, 'ZgInput')
 * ```
 * ```vue
 * <el-input @click="handleClick" @blur="handleBlur" />
 * ```
 *
 * 注意：
 * - 本 Hook 依赖 `useAttrs()` 获取父组件传入的原始事件处理器
 * - 仅当 props.trackable 为 true 且 trackName 存在时才触发埋点
 * - 不阻断原生事件流，确保功能完整性
 */

import { useAttrs } from 'vue'
import { debugTrack } from '@/utils/debugTrack'
import type { Track } from '@/types/track'

/**
 * 事件名称与对应事件对象类型的映射表
 * 用于提供类型安全的事件处理器签名
 *
 * 可根据组件需求扩展，例如：
 * - focus: [FocusEvent]
 * - keydown: [KeyboardEvent]
 */
type EventMap = {
  click: [MouseEvent]
  blur: [FocusEvent]
  change: [Event]
  input: [Event]
  // 可按需扩展更多事件类型
}

/**
 * 创建带埋点能力的通用事件处理器工厂
 *
 * @param props - 组件 props，需包含 Track 接口定义的埋点配置
 * @param category - 组件分类名（用于埋点日志标识，如 'ZgButton'）
 * @param detail - 额外埋点上下文（可选，会与 props.trackExtra 合并）
 *
 * @returns 包含多个预绑定事件处理器的对象（如 handleClick, handleBlur）
 */
export function useTrackableEvents(
  props: Track,
  category: string,
  detail?: Record<string, unknown>
) {
  // 获取父组件透传的所有属性（包括事件处理器）
  const attrs = useAttrs()

  /**
   * 内部工厂函数：生成指定事件的处理函数
   *
   * @param eventTrackName - 事件名称（如 'click'），同时作为 action 类型
   * @param config - 埋点配置（通常传入组件的 props）
   *
   * 返回的函数会：
   * 1. 执行埋点（若启用）
   * 2. 调用父组件传入的原始事件处理器（如果存在）
   */
  function createHandler<K extends keyof EventMap>(eventTrackName: K, config?: Track) {
    return (...args: EventMap[K]) => {
      // ✅ 步骤 1：执行埋点（仅当启用且配置有效时）
      if (config?.trackable && config?.trackName) {
        debugTrack(config.trackName, {
          category, // 组件分类（如 'ZgInput'）
          action: eventTrackName, // 事件动作（如 'click'）
          label: config.trackLabel, // 可读标签
          // 合并两层埋点数据：组件级 + 调用时传入
          detail: {
            ...(props.trackExtra || {}),
            ...(detail || {}),
          },
        })
      }

      // ✅ 步骤 2：透传原始事件给父组件
      const originalHandler = attrs[eventTrackName]
      if (typeof originalHandler === 'function') {
        originalHandler(...args)
      }
    }
  }

  // 返回常用事件处理器，命名与 Vue 事件一致
  return {
    handleClick: createHandler('click', props),
    handleBlur: createHandler('blur', props),
    handleChange: createHandler('change', props),
    handleInput: createHandler('input', props),
    // 如需支持更多事件，按相同模式添加即可
  }
}
