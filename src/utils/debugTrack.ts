// utils/debugTrack.ts
interface DebugTrackOptions {
  category?: string; // 如 'MyButton', 'MyTable'
  action: string;    // 如 'click', 'view', 'submit'
  label?: string;    // 如 'save_profile_btn'
  detail?: Record<string, any>; // 额外上下文
}

let isDebugEnabled: boolean;

// 全局开关：可通过 localStorage 动态开启/关闭
if (typeof window !== 'undefined') {
  const debugFromStorage = localStorage.getItem('COMPONENT_TRACK_DEBUG');
  if (debugFromStorage === 'true') isDebugEnabled = true;
  if (debugFromStorage === 'false') isDebugEnabled = false;
}

/**
 * 调试专用埋点函数 —— 仅输出到 console
 */
export function debugTrack(eventName: string, options: DebugTrackOptions) {
  if (!isDebugEnabled) return;

  const { category, action, label, detail = {} } = options;

  const now = new Date();

  // 构造结构化日志对象
  const logData = {
    event: eventName,
    category,
    action,
    label,
    timestamp: now.toLocaleString() + "------" + now.getTime(),
    page: location.pathname,
    ...detail,
  };

  // 根据 action 类型选择不同日志样式
  const styles = {
    click: 'color: #409EFF; font-weight: bold;',
    view: 'color: #67C23A;',
    error: 'color: #F56C6C; background: #fef0f0;',
    default: 'color: #909399;',
  };

  const style = styles[action as keyof typeof styles] || styles.default;

  // 输出带样式的日志
  console.groupCollapsed(
    `%c[Component Track] %c${eventName} %c(${action})`,
    'color: #2d8cf0;',
    'color: #67C23A; font-weight: 600;',
    style
  );

  console.log(logData);

  console.groupEnd();
}