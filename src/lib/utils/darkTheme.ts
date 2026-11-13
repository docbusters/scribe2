/** The part of a DOM node that decides the theme. Typed this small so the rule can be tested without a DOM */
export interface ThemeNode {
    classList: { contains(name: string): boolean };
    parentElement: ThemeNode | null;
    getRootNode(): unknown;
}

/** A shadow root, which is the only root that has a host */
function getShadowHost(root: unknown): ThemeNode | null {
    return root && typeof root === 'object' && 'host' in root ? ((root as { host: ThemeNode }).host ?? null) : null;
}

/**
 * The element and all of its ancestors, up to the document. It crosses shadow roots (a shadow root has no parent element, so the
 * chain goes on with its host): CSS custom properties inherit through a shadow boundary, so a `.dark` outside it themes what is inside
 */
export function getAncestorChain(element: ThemeNode): ThemeNode[] {
    const chain: ThemeNode[] = [];
    for (let node: ThemeNode | null = element; node; node = node.parentElement ?? getShadowHost(node.getRootNode())) {
        chain.push(node);
    }
    return chain;
}

/** The same rule as the CSS (`.dark` sets the `--scribe-*` tokens, which the descendants inherit): dark when any node of the chain has the class `dark` */
export function hasDarkClass(chain: ThemeNode[]): boolean {
    return chain.some((node) => node.classList.contains('dark'));
}
