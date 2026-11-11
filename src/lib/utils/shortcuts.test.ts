import { describe, expect, it } from 'vitest';
import { getShortcutTokens, getShortcutWarnings, matchesShortcut, parseShortcut, toAriaKeyShortcuts, type ParsedShortcut, type ShortcutEvent } from './shortcuts.js';

const event = (overrides: Partial<ShortcutEvent>): ShortcutEvent => ({ key: '', code: '', ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...overrides });
const parse = (shortcut: string) => parseShortcut(shortcut) as ParsedShortcut;

describe('parseShortcut', () => {
	it('reads modifiers and key, ignoring case and spaces', () => {
		expect(parseShortcut('mod + SHIFT + x')).toEqual({ mod: true, ctrl: false, alt: false, shift: true, key: 'x' });
	});

	it('reads named keys and their aliases', () => {
		expect(parseShortcut('Ctrl+Space')?.key).toBe('space');
		expect(parseShortcut('Del')?.key).toBe('delete');
	});

	it('rejects shortcuts without a key, with unknown modifiers or with unknown keys', () => {
		expect(parseShortcut('')).toBeNull();
		expect(parseShortcut('Mod+')).toBeNull();
		expect(parseShortcut('Hyper+B')).toBeNull();
		expect(parseShortcut('Mod+Banana')).toBeNull();
	});
});

describe('matchesShortcut', () => {
	it('maps Mod to Ctrl or Command depending on the platform', () => {
		const bold = parse('Mod+B');
		expect(matchesShortcut(event({ key: 'b', ctrlKey: true }), bold, false)).toBe(true);
		expect(matchesShortcut(event({ key: 'b', metaKey: true }), bold, false)).toBe(false);
		expect(matchesShortcut(event({ key: 'b', metaKey: true }), bold, true)).toBe(true);
		expect(matchesShortcut(event({ key: 'b', ctrlKey: true }), bold, true)).toBe(false);
	});

	it('requires the exact modifiers', () => {
		expect(matchesShortcut(event({ key: 'b', ctrlKey: true, shiftKey: true }), parse('Mod+B'), false)).toBe(false);
		expect(matchesShortcut(event({ key: 'x', ctrlKey: true, shiftKey: true }), parse('Mod+Shift+X'), false)).toBe(true);
		expect(matchesShortcut(event({ key: 'Delete', ctrlKey: true }), parse('Delete'), false)).toBe(false);
	});

	it('matches a shifted letter and the space key', () => {
		expect(matchesShortcut(event({ key: 'X', ctrlKey: true, shiftKey: true }), parse('Mod+Shift+X'), false)).toBe(true);
		expect(matchesShortcut(event({ key: ' ', ctrlKey: true }), parse('Ctrl+Space'), true)).toBe(true);
	});

	it('matches Alt+Shift+digit whatever the layout types for it', () => {
		const fit = parse('Alt+Shift+1');
		// Windows types "!" and a Mac types a symbol with Option, but the physical key is the same
		expect(matchesShortcut(event({ key: '!', code: 'Digit1', altKey: true, shiftKey: true }), fit, false)).toBe(true);
		expect(matchesShortcut(event({ key: '⁄', code: 'Digit1', altKey: true, shiftKey: true }), fit, true)).toBe(true);
		expect(matchesShortcut(event({ key: '@', code: 'Digit2', altKey: true, shiftKey: true }), fit, false)).toBe(false);
		// AltGr is Ctrl+Alt on Windows: it must not be taken for Alt
		expect(matchesShortcut(event({ key: '|', code: 'Digit1', ctrlKey: true, altKey: true }), fit, false)).toBe(false);
	});

	it('uses the physical key only when the layout does not type a letter or digit', () => {
		const bold = parse('Mod+B');
		expect(matchesShortcut(event({ key: 'и', code: 'KeyB', ctrlKey: true }), bold, false)).toBe(true);
		// A Dvorak layout: the physical key B types "x", which is not the bold shortcut
		expect(matchesShortcut(event({ key: 'x', code: 'KeyB', ctrlKey: true }), bold, false)).toBe(false);
	});
});

describe('getShortcutTokens and toAriaKeyShortcuts', () => {
	it('writes the modifiers in the order of each platform', () => {
		expect(getShortcutTokens(parse('Mod+Shift+X'), false)).toEqual(['ctrl', 'shift', 'x']);
		expect(getShortcutTokens(parse('Mod+Shift+X'), true)).toEqual(['shift', 'meta', 'x']);
		expect(getShortcutTokens(parse('Ctrl+Alt+Space'), true)).toEqual(['ctrl', 'alt', 'space']);
	});

	it('builds the aria-keyshortcuts value', () => {
		expect(toAriaKeyShortcuts(parse('Mod+Shift+X'), false)).toBe('Control+Shift+X');
		expect(toAriaKeyShortcuts(parse('Mod+D'), true)).toBe('Meta+D');
		expect(toAriaKeyShortcuts(parse('Delete'), false)).toBe('Delete');
	});
});

describe('getShortcutWarnings', () => {
	it('is empty when shortcuts are unique or missing', () => {
		expect(getShortcutWarnings('text', [{ type: 'a', shortcut: 'Mod+B' }, { type: 'b', shortcut: 'Mod+I' }, { type: 'c' }])).toEqual([]);
	});

	it('reports options that share a shortcut, however it is written', () => {
		const warnings = getShortcutWarnings('text', [{ type: 'a', shortcut: 'Mod+B' }, { type: 'b', shortcut: 'mod+b' }]);
		expect(warnings).toHaveLength(1);
		expect(warnings[0]).toContain('"a" (Mod+B), "b" (mod+b)');
	});

	it('reports Mod and Ctrl together, as they are the same key outside the Mac', () => {
		expect(getShortcutWarnings('text', [{ type: 'a', shortcut: 'Mod+D' }, { type: 'b', shortcut: 'Ctrl+D' }])).toHaveLength(1);
	});

	it('reports invalid shortcuts', () => {
		const warnings = getShortcutWarnings('text', [{ type: 'a', shortcut: 'Mod+Banana' }]);
		expect(warnings).toEqual(['Component "text": option "a" has an invalid shortcut "Mod+Banana"']);
	});
});
