import { describe, expect, it } from 'vitest';
import { getAncestorChain, hasDarkClass, type ThemeNode } from './darkTheme.js';

/** A fake node: its classes, its parent, and the root it belongs to (a shadow root has a host) */
function node(name: string, classes: string[] = [], parent: ThemeNode | null = null, root: unknown = null): ThemeNode & { name: string } {
	return { name, classList: { contains: (c) => classes.includes(c) }, parentElement: parent, getRootNode: () => root };
}

const names = (chain: ThemeNode[]) => chain.map((n) => (n as ThemeNode & { name: string }).name);

describe('getAncestorChain', () => {
	it('lists the element first and then each ancestor up to the top', () => {
		const html = node('html');
		const wrapper = node('wrapper', [], html);
		const root = node('root', [], wrapper);

		expect(names(getAncestorChain(root))).toEqual(['root', 'wrapper', 'html']);
	});

	it('is only the element when it has no parent', () => {
		expect(names(getAncestorChain(node('alone')))).toEqual(['alone']);
	});

	it('goes on with the host when the top of the chain is inside a shadow root', () => {
		const html = node('html');
		const host = node('host', [], html);
		const shadowRoot = { host };
		const inner = node('inner', [], null, shadowRoot);
		const root = node('root', [], inner, shadowRoot);

		expect(names(getAncestorChain(root))).toEqual(['root', 'inner', 'host', 'html']);
	});

	it('stops at a root that is not a shadow root (a document has no host)', () => {
		const top = node('top', [], null, { nodeType: 9 });

		expect(names(getAncestorChain(top))).toEqual(['top']);
	});
});

describe('hasDarkClass', () => {
	it('is dark when the element itself has the class', () => {
		expect(hasDarkClass(getAncestorChain(node('root', ['dark'], node('html'))))).toBe(true);
	});

	it('is dark when a wrapper or the document element has the class', () => {
		const html = node('html', ['dark']);
		expect(hasDarkClass(getAncestorChain(node('root', [], node('wrapper', [], html))))).toBe(true);

		const wrapper = node('wrapper', ['dark'], node('html'));
		expect(hasDarkClass(getAncestorChain(node('root', [], wrapper)))).toBe(true);
	});

	it('is dark when the class is outside a shadow root that contains Scribe', () => {
		const host = node('host', ['dark']);
		const root = node('root', [], null, { host });

		expect(hasDarkClass(getAncestorChain(root))).toBe(true);
	});

	it('is not dark without the class in the chain, and ignores similar classes', () => {
		const html = node('html', ['darker', 'not-dark']);
		expect(hasDarkClass(getAncestorChain(node('root', ['light'], node('wrapper', [], html))))).toBe(false);
	});

	it('does not look at descendants or siblings, only at the chain', () => {
		const html = node('html');
		node('sibling', ['dark'], html);
		expect(hasDarkClass(getAncestorChain(node('root', [], html)))).toBe(false);
	});
});
