import { describe, expect, it } from 'vitest';
import { getTypeLabel, groupByType, isListedBinding } from './dataTypes.js';

describe('groupByType', () => {
	it('orders known types by the UI order, not by input order', () => {
		const groups = groupByType([{ type: 'record' }, { type: 'string' }, { type: 'array' }, { type: 'string' }]);
		expect(groups.map((g) => g.type)).toEqual(['string', 'array', 'record']);
		expect(groups[0].items).toHaveLength(2);
	});

	it('leaves out types without items', () => {
		expect(groupByType([{ type: 'number' }]).map((g) => g.type)).toEqual(['number']);
		expect(groupByType([])).toEqual([]);
	});

	it('keeps unknown types after the known ones, in first-seen order', () => {
		const groups = groupByType([{ type: 'zeta' }, { type: 'date' }, { type: 'alpha' }]);
		expect(groups.map((g) => g.type)).toEqual(['date', 'zeta', 'alpha']);
	});
});

describe('getTypeLabel', () => {
	const t = (path: string) => `t:${path}`;

	it('translates known types and shows unknown ones as they are', () => {
		expect(getTypeLabel({ t }, 'string')).toBe('t:types.string');
		expect(getTypeLabel({ t }, 'empty')).toBe('t:types.empty');
		expect(getTypeLabel({ t }, 'component')).toBe('component');
	});
});

describe('isListedBinding', () => {
	it('lists real variables', () => {
		expect(isListedBinding('name', { type: 'string' })).toBe(true);
	});

	it('leaves out placeholders', () => {
		expect(isListedBinding('', { type: 'string' })).toBe(false);
		expect(isListedBinding('undefined', { type: 'string' })).toBe(false);
		expect(isListedBinding('x', undefined)).toBe(false);
		expect(isListedBinding('x', { type: 'empty' })).toBe(false);
	});
});
