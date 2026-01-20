# 🧩 ZG UI 组件库开发规范

> **适用于** `@zggj/ui-lib` **团队协作开发**
> 技术栈：Vue 3 + TypeScript + Vite + Element Plus

---

## 一、核心设计原则

### 1.1 组件封装哲学

- **只声明自定义 Props\*\***（如\*\* `trackable`, `customClass`）
- **原生属性通过 `$attrs` **透传\***\* **给底层 Element Plus 组件\*\*
- **插槽显式透传\*\***（不使用动态插槽遍历）\*\*
- **支持全局注册 + 按需引入**

**✅ 目的：**

- **避免阻断** `$attrs` **导致透传失效**
- **保持与 ElButton/ElInput 完全一致的 API**
- **提升开发者体验（IDE 提示 + 无类型报错）**

---

### 1.2 埋点能力（Trackable）

**每个组件可选支持埋点，通过以下 props 控制：**

**表格**

| **Prop**     | **类型**  | **默认值**                 | **说明**         |
| ------------ | --------- | -------------------------- | ---------------- |
| `trackable`  | `boolean` | `false`                    | **是否开启埋点** |
| `trackName`  | `string`  | `'button'` **/** `'input'` | **事件名称**     |
| `trackLabel` | `string`  | `'按钮'` **/** `'输入框'`  | **可读标签**     |
| `trackExtra` | `Record`  | `{}`                       | **额外数据**     |

> **💡 埋点逻辑由** `useTrackableEvents` **Composable 统一处理。**

---

## 二、如何开发一个新组件（以 `ZgInput` **为例）**

### 步骤 1：创建组件文件

```
src/
└── components/
    └── input/
        ├── src/
        │   └── Input.vue       # 组件实现
        └── types/
            └── input.ts        # 类型定义
```

---

### 步骤 2：编写组件逻辑（`Input.vue`）

```ts
<!-- src/components/input/src/Input.vue -->
<template>
  <el-input
    v-bind="$attrs"
    :class="['zg-input', customClass]"
    @click="handleClick"
    @blur="handleBlur"
  >
    <!-- 显式透传已知插槽 -->
    <template #prefix><slot name="prefix" /></template>
    <template #suffix><slot name="suffix" /></template>
    <template #prepend><slot name="prepend" /></template>
    <template #append><slot name="append" /></template>
  </el-input>
</template>

<script setup lang="ts">
import { defineOptions } from 'vue'
import { useTrackableEvents } from '@/composables/useTrackableEvent'
import type { InputProps } from '../types/input'

// 关闭自动 attrs 绑定（由 v-bind="$attrs" 接管）
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<InputProps>(), {
  customClass: '',
  trackable: false,
  trackName: 'input',
  trackLabel: 'input输入框',
  trackExtra: () => ({}),
})

const { handleClick, handleBlur } = useTrackableEvents(props, 'ZgInput')
</script>

<style scoped>
.zg-input {
  /* 自定义样式 */
}
</style>
```

> **⚠️** **不要使用 `<template v-for="(_, name) in $slots">` **动态插槽！\*\*\*\*

---

### 步骤 3：定义类型（`input.ts`）

```ts
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
```

> **✅ 所有属性添加 JSDoc 注释，IDE 悬停时会显示说明！**

---

### 步骤 4：注册到主入口（`src/index.ts`）

```ts
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
  }
}

// 默认导出组件库
export default UiLib
```

> **✅ 使用** `export default`，使用者可直接 `import UiLib from '...'`

---

## 三、开发体验保障

### 3.1 Prettier 代码格式化

#### `.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false
}
```

#### `package.json` **脚本**

```json
{
  "scripts": {
    "format": "prettier --write ."
  }
}
```

> **✅ 团队成员应开启编辑器“保存时自动格式化”。**

---

### 3.2 Git 提交规范

#### 提交信息格式（中文）

```
chore: 引入 Prettier 统一代码风格

- 添加 .prettierrc 配置
- 集成 ESLint 避免冲突
- 建议开启 format-on-save
```

#### 提交钩子（Husky + lint-staged）

**确保** `package.json` **中** **不包含 `test` **脚本\*\*\*\*（除非已配置测试）：

```json
{
  "lint-staged": {
    "*.{js,ts,vue,json,md}": ["prettier --write"]
  }
}
```

> **⚠️ 若未配置测试，请勿在** `lint-staged` **中写** `"npm run test"`。

`.husky/pre-commit`内写了 `npx lint-staged` 脚本, 可以在git提交之前自动执行格式化脚本

---

## 四、构建与发布

### `vite.config.ts` **配置**

```ts
/**
 * Vite 构建配置文件
 *
 * 用于构建 @zggj/ui-lib 组件库：
 * - 生成 ESM / UMD 格式的 JS 模块
 * - 自动生成 TypeScript 类型声明文件（.d.ts）
 * - 排除 Vue 和 Element Plus 等外部依赖（由宿主项目提供）
 *
 * 构建产物位于 `dist/` 目录：
 *   ├── index.es.js      → ES 模块（推荐用于现代构建工具）
 *   ├── index.umd.js     → UMD 模块（可用于 script 标签）
 *   ├── ui-lib.css       → 打包后的样式文件
 *   └── types/           → 自动生成的类型声明文件
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    // 启用 Vue 单文件组件（.vue）支持
    vue(),

    // 自动生成 TypeScript 类型声明文件（.d.ts）
    dts({
      // 在输出目录根部自动生成入口类型文件（如 dist/types/index.d.ts）
      insertTypesEntry: true,

      // 移除 .vue 文件名后缀（例如 Button.vue.d.ts → Button.d.ts）
      cleanVueFileName: true,

      // 类型声明文件的输出目录（相对于项目根目录）
      outDir: 'dist/types',

      // 指定使用的 tsconfig.json 路径（确保类型解析一致）
      tsconfigPath: './tsconfig.json',

      // 源码根目录，用于计算类型文件的相对路径
      entryRoot: 'src',

      // 将生成的 .d.ts 文件也复制到 dist 根目录（方便某些工具链引用）
      copyDtsFiles: true,
    }),
  ],

  build: {
    // 配置组件库打包模式（library mode）
    lib: {
      // 入口文件：组件库对外暴露的主模块
      entry: resolve(__dirname, 'src/index.ts'),

      // 组件库全局名称（仅在 UMD 格式中使用，如 window["@zggj/ui-lib"]）
      name: '@zggj/ui-lib',

      // 输出文件名模板，根据格式动态生成
      // 例如：es → index.es.js，umd → index.umd.js
      fileName: format => `index.${format}.js`,

      // 生成的模块格式：
      // - 'es'：ES Module（适用于 Vite、Webpack 5+ 等现代构建工具）
      // - 'umd'：Universal Module Definition（适用于 <script> 标签或旧版构建工具）
      formats: ['es', 'umd'],
    },

    // Rollup 打包选项（Vite 底层基于 Rollup）
    rollupOptions: {
      // 声明外部依赖，不将这些包打包进最终产物
      // 宿主项目需自行安装并提供这些依赖
      external: ['vue', 'element-plus'],

      output: {
        // 为 UMD 格式指定全局变量名映射
        // 例如：当通过 <script> 引入时，expect window.Vue and window.ElementPlus to exist
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
        },
      },
    },
  },

  // 路径别名配置，提升代码可读性与可维护性
  resolve: {
    alias: {
      // 将 '@' 映射到 src 目录，例如：@/components → src/components
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

### 构建产物

```
dist/
├── index.es.js     # ESM
├── index.umd.js    # UMD
├── ui-lib.css      # 样式
└── index.d.ts      # 自动生成类型
```

---

## 五、使用示例（宿主项目）

```vue
<template>
  <zg-input
    v-model="value"
    placeholder="请输入"
    clearable
    trackable
    track-name="search_input"
    track-label="搜索框"
  />
</template>

<script setup></script>
```

```ts
// main.ts
// 全局注册组件
import UiLib from '@zggj/ui-lib'
import '@zggj/ui-lib/dist/ui-lib.css'

// main.ts
createApp(App).use(UiLib).mount('#app')
```

---

## 六、常见问题 FAQ

### Q1: 为什么不用 `DefineComponent<Props>` **声明全局组件？**

> **A: 直接使用** `typeof Button.vue` **更可靠，避免类型过严导致“缺少属性”报错。**

### Q2: 插槽为什么不自动遍历？

> **A: Vue 编译器要求插槽名必须是字面量，动态** `v-for` **无法被正确识别。**

### Q3: 如何让自定义 props 有注释提示？

> **A: 在** `types/*.ts` **的接口属性上写 JSDoc，Volar 会自动提取。**

---

📌 \***\*维护者\*\***：前端基础架构组
📅 \***\*最后更新\*\***：2026年1月20日
🔗 \***\*仓库地址\*\***：https://github.com/XxZz0501/zg-ui-lib
