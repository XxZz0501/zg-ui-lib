import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,     // 自动生成 index.d.ts
      cleanVueFileName: true,     // 移除 .vue 后缀
      outDir: 'dist/types',     // 输出目录
      tsconfigPath: './tsconfig.json',
      entryRoot: 'src',
      // 复制 d.ts 文件到根目录
      copyDtsFiles: true,
    })
  ],
  build: {
    lib: {
      // 入口文件
      entry: resolve(__dirname, 'src/index.ts'),
      // 组件库名称
      name: '@zggj/ui-lib',
      // 生成的文件名称，支持多种格式
      fileName: (format) => `index.${format}.js`,
      // 导出格式
      formats: ['es', 'umd']
    },
    // 外部依赖，不打包进组件库
    rollupOptions: {
      external: ['vue', 'element-plus'],
      output: {
        // 全局变量映射
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus'
        }
      }
    }
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
})
