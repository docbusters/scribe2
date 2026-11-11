import { describe, expect, it } from 'vitest';
import { en } from './locales/en.js';
import { es } from './locales/es.js';

/** Turns the nested dictionary into `a.b.c` keys, so two languages can be compared key by key. */
function flatten(node: unknown, prefix = ''): Record<string, string> {
	const result: Record<string, string> = {};
	for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
		const path = prefix ? `${prefix}.${key}` : key;
		if (typeof value === 'string') result[path] = value;
		else Object.assign(result, flatten(value, path));
	}
	return result;
}

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

const english = flatten(en);
const spanish = flatten(es);

describe('locales', () => {
	it('have the same keys', () => {
		expect(Object.keys(spanish).sort()).toEqual(Object.keys(english).sort());
	});

	it('have no empty texts', () => {
		for (const [lang, texts] of [['en', english], ['es', spanish]] as const) {
			const empty = Object.entries(texts).filter(([, text]) => text.trim() === '').map(([key]) => key);
			expect(empty, `empty texts in ${lang}`).toEqual([]);
		}
	});

	it('use the same {placeholders} in both languages', () => {
		for (const key of Object.keys(english)) {
			expect(placeholders(spanish[key] ?? ''), `placeholders of ${key}`).toEqual(placeholders(english[key]));
		}
	});
});
