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
