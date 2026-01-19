/**
 * 埋点相关配置属性（用于用户行为分析）
 */
export interface Track {
  /**
   * 是否开启埋点追踪
   *
   * - 当为 `true` 时，组件会在 click / blur 等事件中自动上报埋点
   * @default false
   */
  trackable?: boolean

  /**
   * 埋点事件名称（event name）
   *
   * - 用于区分不同组件或场景，建议使用小写+下划线命名
   * - 示例：`'login_username'`, `'search_keyword'`
   */
  trackName?: string

  /**
   * 埋点标签（label / description）
   *
   * - 用于在数据分析平台中显示可读性高的名称
   * - 示例：`'用户名输入框'`, `'搜索关键词'`
   */
  trackLabel?: string

  /**
   * 额外埋点数据（自定义字段）
   *
   * - 传入一个对象，会被合并到埋点 payload 中
   * - 示例：`{ page: 'home', module: 'header' }`
   * @default {}
   */
  trackExtra?: Record<string, unknown>
}
