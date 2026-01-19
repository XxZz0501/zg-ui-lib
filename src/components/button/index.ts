import Button from './src/Button.vue'
import type { ButtonProps, ButtonPropsWithEl } from './types/button'

// 为组件添加install方法，支持Vue.use()
Button.install = (app: any) => {
  app.component('ZgButton', Button)
}

export { Button }
export type { ButtonProps, ButtonPropsWithEl }
export default Button