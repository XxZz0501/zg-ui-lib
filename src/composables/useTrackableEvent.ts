// composables/useTrackableEvents.ts
import { useAttrs } from 'vue';
import { debugTrack } from '@/utils/debugTrack';
import type { Track } from '@/types/track';

type EventMap = {
    click: [MouseEvent];
    blur: [FocusEvent];
    change: [Event];
    input: [Event];
    // 可按需扩展
};

/**
 * 通用事件埋点 Hook
 * @param props 包含 track 等配置的 props 对象
 * @param category 组件分类名，如 'MyButton'
 */
export function useTrackableEvents(
    props: any,
    category: string,
    detail?: any
) {
    const attrs = useAttrs();

    // 工厂函数：生成带埋点和透传能力的事件处理器
    function createHandler<K extends keyof EventMap>(
        eventtrackName: K,
        config?: Track
    ) {
        return (...args: EventMap[K]) => {
            // 1. 埋点
            if (config?.trackable && config?.trackName) {
                debugTrack(config.trackName, {
                    category,
                    action: eventtrackName,
                    label: config.trackLabel,
                    // 合并自定义和默认的 trackExtra
                    detail: { ...(props.trackExtra || {}), ...(detail || {}) },
                });
            }

            // 2. 透传原始事件
            const originalHandler = attrs[eventtrackName];
            if (typeof originalHandler === 'function') {
                originalHandler(...args);
            }
        };
    }

    return {
        handleClick: createHandler('click', props),
        handleBlur: createHandler('blur', props),
        handleChange: createHandler('change', props),
        handleInput: createHandler('input', props),
        // 按需导出更多...
    };
}