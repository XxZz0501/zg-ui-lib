import Input from './src/Input.vue'
import type { InputProps, InputPropsWithEl } from './types/input'

// 为组件添加install方法，支持Vue.use()
Input.install = (app: any) => {
  app.component('ZgInput', Input)
}

export { Input }
export type { InputProps, InputPropsWithEl }
export default Input