/**
 * 组件埋点调试工具（仅用于开发环境）
 *
 * 功能：
 * - 在开启调试模式时，将组件埋点事件输出到浏览器控制台
 * - 支持按事件类型着色、结构化展示、时间戳、页面路径等上下文信息
 * - 通过 localStorage 动态开关，无需重启应用
 *
 * 使用方式：
 * 1. 在浏览器控制台执行：localStorage.setItem('COMPONENT_TRACK_DEBUG', 'true')
 * 2. 刷新页面，触发组件事件（如点击按钮）
 * 3. 查看 console 中带样式的结构化日志
 * 4. 关闭调试：localStorage.setItem('COMPONENT_TRACK_DEBUG', 'false')
 *
 * 示例：
 *   debugTrack('user_action', {
 *     category: 'ZgButton',
 *     action: 'click',
 *     label: 'submit_order_btn',
 *     detail: { orderId: '123' }
 *   })
 */

/**
 * 埋点事件的配置选项
 */
interface DebugTrackOptions {
  /**
   * 事件分类（通常为组件名）
   * @example 'ZgButton', 'ZgInput', 'UserTable'
   */
  category?: string

  /**
   * 事件动作类型（必填）
   * @example 'click', 'view', 'blur', 'submit', 'error'
   */
  action: string

  /**
   * 事件标签（用于区分同类组件的不同实例）
   * @example 'search_input', 'save_profile_btn'
   */
  label?: string

  /**
   * 额外上下文数据（任意键值对）
   * @example { value: 'hello', page: 'profile' }
   */
  detail?: Record<string, any>
}

/**
 * 调试模式全局开关
 * - 默认未定义（即关闭）
 * - 可通过 localStorage.COMPONENT_TRACK_DEBUG 动态控制：
 *   - 'true'  → 开启
 *   - 'false' → 关闭
 * - 仅在浏览器环境中生效（SSR 安全）
 */
let isDebugEnabled: boolean

// 初始化调试开关：从 localStorage 读取用户设置
if (typeof window !== 'undefined') {
  const debugFromStorage = localStorage.getItem('COMPONENT_TRACK_DEBUG')
  if (debugFromStorage === 'true') isDebugEnabled = true
  if (debugFromStorage === 'false') isDebugEnabled = false
}

/**
 * 调试专用埋点函数 —— 仅在控制台输出结构化日志，不发送真实埋点
 *
 * @param eventName - 事件名称（如 'button_click'）
 * @param options - 埋点配置选项
 *
 * 输出效果：
 *   - 折叠组：[Component Track] event_name (action)
 *   - 展开后显示完整结构化对象（含时间戳、页面路径、自定义字段等）
 *   - 不同 action 类型使用不同颜色标识（click / view / error 等）
 */
export function debugTrack(eventName: string, options: DebugTrackOptions) {
  // 若未开启调试模式，直接静默退出（零性能损耗）
  if (!isDebugEnabled) return

  const { category, action, label, detail = {} } = options

  const now = new Date()

  // 构造完整的日志数据对象，便于排查问题
  const logData = {
    event: eventName, // 事件名称
    category, // 组件分类
    action, // 动作类型
    label, // 实例标签
    timestamp: now.toLocaleString() + '------' + now.getTime(), // 可读 + 毫秒时间戳
    page: location.pathname, // 当前页面路径
    ...detail, // 合并用户自定义字段
  }

  // 为不同 action 类型定义控制台样式（提升可读性）
  const styles = {
    click: 'color: #409EFF; font-weight: bold;', // 蓝色加粗
    view: 'color: #67C23A;', // 成功绿色
    error: 'color: #F56C6C; background: #fef0f0;', // 错误红色+浅红背景
    default: 'color: #909399;', // 灰色（默认）
  }

  const style = styles[action as keyof typeof styles] || styles.default

  // 使用 console.groupCollapsed 创建可折叠日志组，避免控制台刷屏
  console.groupCollapsed(
    `%c[Component Track] %c${eventName} %c(${action})`,
    'color: #2d8cf0;', // 主标题样式
    'color: #67C23A; font-weight: 600;', // 事件名样式
    style // 动作类型样式
  )

  // 输出完整结构化数据
  console.log(logData)

  // 关闭日志组
  console.groupEnd()
}
