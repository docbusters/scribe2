/** A keyboard shortcut written as in the registry, for example `Mod+Shift+X`, `Ctrl+Space` or `Delete` */
export interface ParsedShortcut {
	/** Ctrl on Windows and Linux, Command on Mac */
	mod: boolean;
	ctrl: boolean;
	alt: boolean;
	shift: boolean;
	/** Lowercase: a single character or a name from NAMED_KEYS */
	key: string;
}

/** The part of a keyboard event that shortcuts read, so they can be tested without a DOM */
export interface ShortcutEvent {
	key: string;
	code: string;
	ctrlKey: boolean;
	metaKey: boolean;
	altKey: boolean;
	shiftKey: boolean;
}

const NAMED_KEYS = ['space', 'delete', 'backspace', 'enter', 'escape', 'tab', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];

const KEY_ALIASES: Record<string, string> = { esc: 'escape', del: 'delete', return: 'enter', up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright' };

/** Whether the keyboard is the one of a Mac, where Mod is Command. Always false without a navigator */
export function isMacPlatform(): boolean {
	if (typeof navigator === 'undefined') return false;
	const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform;
	return /mac|iphone|ipad/i.test(platform);
}

// shortcut: the "+" key cannot be written, as "+" separates the parts. Use another key if one is ever needed
/** Reads a shortcut. It returns null when it is not valid: no key, an unknown modifier or an unknown key name */
export function parseShortcut(shortcut: string): ParsedShortcut | null {
	const parts = shortcut.split('+').map(part => part.trim().toLowerCase());
	const rawKey = parts.pop() ?? '';
	const key = KEY_ALIASES[rawKey] ?? rawKey;
	if (!NAMED_KEYS.includes(key) && key.length !== 1) return null;

	const parsed: ParsedShortcut = { mod: false, ctrl: false, alt: false, shift: false, key };
	for (const modifier of parts) {
		if (modifier !== 'mod' && modifier !== 'ctrl' && modifier !== 'alt' && modifier !== 'shift') return null;
		parsed[modifier] = true;
	}
	return parsed;
}

/** Whether a keyboard event is the shortcut. The modifiers must be exactly the ones of the shortcut */
export function matchesShortcut(event: ShortcutEvent, shortcut: ParsedShortcut, isMac: boolean): boolean {
	const ctrl = shortcut.ctrl || (shortcut.mod && !isMac);
	const meta = shortcut.mod && isMac;
	if (event.ctrlKey !== ctrl || event.metaKey !== meta || event.altKey !== shortcut.alt || event.shiftKey !== shortcut.shift) return false;

	const key = event.key === ' ' ? 'space' : event.key.toLowerCase();
	if (key === shortcut.key) return true;

	// Letters and digits are read by the character they type. The physical key is used only when the layout types something
	// else (a non Latin layout, or Option on a Mac), so a Dvorak "x" is never taken for a QWERTY "x"
	if (/^[a-z0-9]$/.test(key)) return false;
	const physicalKey = /^(Key|Digit)([A-Z0-9])$/.exec(event.code)?.[2].toLowerCase();
	return physicalKey === shortcut.key;
}

/**
 * The keys of a shortcut in the order the platform writes them, to draw them. Modifiers are `ctrl`, `alt`, `shift` and
 * `meta` (Command), the last one is the key: a single lowercase character or a name such as `space`
 */
export function getShortcutTokens(shortcut: ParsedShortcut, isMac: boolean): string[] {
	const modifiers = {
		ctrl: shortcut.ctrl || (shortcut.mod && !isMac),
		alt: shortcut.alt,
		shift: shortcut.shift,
		meta: shortcut.mod && isMac
	};
	// Macs write Control, Option, Shift, Command. The rest write Ctrl, Alt, Shift
	const order = isMac ? ['ctrl', 'alt', 'shift', 'meta'] : ['ctrl', 'alt', 'shift'];
	return [...order.filter(modifier => modifiers[modifier as keyof typeof modifiers]), shortcut.key];
}

/** The value of `aria-keyshortcuts` for a shortcut, for example `Control+Shift+X` */
export function toAriaKeyShortcuts(shortcut: ParsedShortcut, isMac: boolean): string {
	const names: Record<string, string> = { ctrl: 'Control', alt: 'Alt', shift: 'Shift', meta: 'Meta' };
	return getShortcutTokens(shortcut, isMac)
		.map(token => names[token] ?? token.charAt(0).toUpperCase() + token.slice(1))
		.join('+');
}

/**
 * Describes the problems of the shortcuts of the options of a component: invalid ones, and options that share one. Only
 * the options of one component are compared, as only the options of the selected component are active.
 * Mod and Ctrl are the same key on Windows and Linux, so they are reported as a conflict too
 */
export function getShortcutWarnings(componentType: string, options: { type: string; shortcut?: string }[]): string[] {
	const warnings = new Set<string>();
	const valid: { type: string; shortcut: string; parsed: ParsedShortcut }[] = [];

	for (const { type, shortcut } of options) {
		if (shortcut === undefined) continue;
		const parsed = parseShortcut(shortcut);
		if (parsed) {
			valid.push({ type, shortcut, parsed });
		} else {
			warnings.add(`Component "${componentType}": option "${type}" has an invalid shortcut "${shortcut}"`);
		}
	}

	for (const isMac of [true, false]) {
		const byKeys = new Map<string, typeof valid>();
		for (const option of valid) {
			const id = getShortcutTokens(option.parsed, isMac).join('+');
			byKeys.set(id, [...(byKeys.get(id) ?? []), option]);
		}
		for (const shared of byKeys.values()) {
			if (shared.length < 2) continue;
			const list = shared.map(option => `"${option.type}" (${option.shortcut})`).join(', ');
			warnings.add(`Component "${componentType}": the options ${list} use the same shortcut`);
		}
	}

	return [...warnings];
}
