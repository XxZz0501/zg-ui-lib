import type { App, DefineComponent } from 'vue'
import { Button, Input } from './components'
export type { ButtonProps, InputProps } from './components'
import './styles/index.scss'

// 导出安装函数，用于app.use()
const install = (app: App) => {
  // 注册所有组件
  app.component('ZgButton', Button)
  app.component('ZgInput', Input)
}

/**
 * ============================================================================
 * ⚠️ 重要：以下代码专为 IDE（Volar）提供智能提示而设计
 * ============================================================================
 *
 * 背景问题：
 * - 组件内部使用 `$attrs` 透传 Element Plus 原生属性（如 `type`, `loading` 等）
 * - 但若在 `defineProps()` 中声明这些原生属性，会导致 Vue 将其视为组件自身 prop，
 *   从而从 `$attrs` 中移除，造成透传失效。
 * - 若完全不声明，则 IDE 无法提供 `type="primary"` 等属性的类型提示。
 *
 * 解决方案（类型与实现分离）：
 * 1. 【运行时】`Button.vue` 仅通过 `defineProps<ButtonProps>()` 声明自定义属性
 *    → 确保所有 ElButton 原生属性保留在 `$attrs` 中，透传正常。
 * 2. 【类型系统】对外导出一个“增强类型” `ButtonPropsWithEl`，
 *    它合并了自定义属性 + `Partial<ElButtonProps>`。
 * 3. 通过类型断言 `Button as DefineComponent<ButtonPropsWithEl>`
 *    和全局模块扩展，让 Volar 认为 `<zg-button>` 支持完整 props。
 *
 * 效果：
 * ✅ 运行时：`type`/`loading` 等正确透传给 `<el-button>`
 * ✅ 开发体验：IDE 提供完整的 ElButton 属性提示和类型检查
 * ✅ 类型安全：自定义属性仍受默认值和类型约束
 *
 * 注意事项：
 * - 不要将 `ButtonPropsWithEl` 用于 `defineProps()`，否则会破坏透传！
 * - 此模式依赖 Volar 的模板类型推断机制，确保使用最新版 Volar。
 * - 如需支持 TSX，JSX 声明不可删除。
 *
 * 参考：
 * - Vue 3 文档：Fallthrough Attributes（https://vuejs.org/guide/components/attrs.html）
 * - Volar 类型推断机制：https://github.com/vuejs/language-tools
 * ============================================================================
 */

import type { ButtonPropsWithEl, InputPropsWithEl } from './components'

// 创建一个类型增强视图：运行时仍是原始组件，但类型上暴露完整 props
const ZgButton = Button as DefineComponent<ButtonPropsWithEl>
const ZgInput = Input as DefineComponent<InputPropsWithEl>

const UiLib = {
  install,
  ZgButton,
  ZgInput,
} as const

// 为 TSX/JSX 使用场景提供类型支持
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'zg-button': DefineComponent<ButtonPropsWithEl>
      'zg-input': DefineComponent<InputPropsWithEl>
    }
  }
}

// 为 Vue SFC 模板中的 <zg-button> 提供全局组件类型提示
declare module 'vue' {
  export interface GlobalComponents {
    ZgButton: typeof ZgButton
    ZgInput: typeof ZgInput
    // ZgButton: DefineComponent<ButtonPropsWithEl>;
    // ZgButton: ComponentPublicInstance<{
    //   $props: ButtonPropsWithEl;
    // }>;
  }
}

// 默认导出组件库
export default UiLib
