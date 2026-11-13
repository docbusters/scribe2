import type { BindingItemProps, BindingItemRenderer, BindingItemRendererHandle } from '../types/ScribeProps.js';

/**
 * Runs the renderer of a row of a custom binding, which is code of the host, and keeps its errors from reaching Scribe. A renderer that
 * throws while mounting calls `onError` (the row then shows the default content), and one that throws while updating or cleaning up is
 * only logged. The returned functions never throw and are safe to call even if the renderer gave nothing back
 */
export function createItemHost(
    renderer: BindingItemRenderer,
    node: HTMLElement,
    props: BindingItemProps,
    onError: () => void
): Required<BindingItemRendererHandle> {
    let handle: BindingItemRendererHandle | undefined;

    try {
        handle = renderer(node, props) as BindingItemRendererHandle | undefined;
    } catch (error) {
        console.error(`[Scribe] The renderer of the rows of the custom binding "${props.bindingType}" threw, so the default row is shown instead.`, error);
        onError();
    }

    return {
        update: (next) => {
            try {
                handle?.update?.(next);
            } catch (error) {
                console.error(`[Scribe] The renderer of the rows of the custom binding "${props.bindingType}" threw while updating a row.`, error);
            }
        },
        destroy: () => {
            try {
                handle?.destroy?.();
            } catch (error) {
                console.error(`[Scribe] The renderer of the rows of the custom binding "${props.bindingType}" threw while cleaning up a row.`, error);
            }
        }
    };
}
