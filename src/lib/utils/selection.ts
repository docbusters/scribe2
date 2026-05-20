/**
 * Safely gets the selection object inside both standard DOM and Shadow DOM environments.
 * If the element is within a Shadow Root, uses `shadowRoot.getSelection()`.
 * Otherwise, falls back to `window.getSelection()`.
 */
export function getSelection(el?: HTMLElement | null): Selection | null {
    if (!el) return window.getSelection();
    const rootNode = el.getRootNode();
    if (rootNode && 'getSelection' in rootNode) {
        return (rootNode as Document).getSelection();
    }
    return window.getSelection();
}
