import type { I18nService } from '$lib/i18n/i18n.svelte.js';

/** Data types a variable can have, in the order they are listed in the UI. */
export const DATA_TYPE_ORDER = ['string', 'number', 'boolean', 'date', 'array', 'record'] as const;

/** Translated name of a data type. Unknown types are shown as they are. */
export function getTypeLabel(i18n: Pick<I18nService, 't'>, type: string): string {
	return (DATA_TYPE_ORDER as readonly string[]).includes(type) || type === 'empty' ? i18n.t(`types.${type}`) : type;
}

/**
 * Groups items by their data type. Known types come first in `DATA_TYPE_ORDER`,
 * unknown ones after them in first-seen order. Types without items are left out.
 */
export function groupByType<T extends { type: string }>(items: T[]): { type: string; items: T[] }[] {
	const groups = new Map<string, T[]>(DATA_TYPE_ORDER.map((type) => [type, []]));
	for (const item of items) {
		const group = groups.get(item.type);
		if (group) group.push(item);
		else groups.set(item.type, [item]);
	}
	return [...groups].filter(([, list]) => list.length > 0).map(([type, list]) => ({ type, items: list }));
}

/** Whether a binding is a real variable to list. The store can hold placeholders (an `undefined` id, or an empty value). */
export function isListedBinding(id: string, value: { type: string } | undefined): boolean {
	return Boolean(id) && id !== 'undefined' && Boolean(value) && Boolean(value?.type) && value?.type !== 'empty';
}
