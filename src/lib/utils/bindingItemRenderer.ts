/** What a renderer of the host hands back: how to give it the new props and how to clean up. Both are optional */
interface RendererHandle<P> {
    update?: (props: P) => void;
    destroy?: () => void;
}

/** Which part of a custom binding the renderer draws, for the messages of the console */
export type RendererPart = 'rows' | 'picker';

/**
 * Runs a renderer of the host (the rows of a custom binding or its picker), which is code of the host, and keeps its errors from reaching
 * Scribe. A renderer that throws while mounting calls `onError` (the rows then show the default content and the picker gives way to the
 * list), and one that throws while updating or cleaning up is only logged. The returned functions never throw and are safe to call even if
 * the renderer gave nothing back
 */
export function createRendererHost<P extends { bindingType: string }>(
    renderer: (node: HTMLElement, props: P) => RendererHandle<P> | void,
    node: HTMLElement,
    props: P,
    onError: () => void,
    part: RendererPart
): Required<RendererHandle<P>> {
    let handle: RendererHandle<P> | undefined;
    const what = part === 'rows' ? 'the rows of' : 'the picker of';
    const fallback = part === 'rows' ? 'the default row is shown instead' : 'the list is shown instead';

    try {
        handle = renderer(node, props) as RendererHandle<P> | undefined;
    } catch (error) {
        console.error(`[Scribe] The renderer of ${what} the custom binding "${props.bindingType}" threw, so ${fallback}.`, error);
        onError();
    }

    return {
        update: (next) => {
            try {
                handle?.update?.(next);
            } catch (error) {
                console.error(`[Scribe] The renderer of ${what} the custom binding "${props.bindingType}" threw while updating.`, error);
            }
        },
        destroy: () => {
            try {
                handle?.destroy?.();
            } catch (error) {
                console.error(`[Scribe] The renderer of ${what} the custom binding "${props.bindingType}" threw while cleaning up.`, error);
            }
        }
    };
}
