import { describe, expect, it } from 'vitest';
import type { DataValue } from '../domain/data/DataValue.js';
import { removeTableLine } from './tableCells.js';

/** A table value whose slots are strings named after their cell, so each one can be told apart */
const table = (...keys: string[]): DataValue => ({
    type: 'record',
    value: Object.fromEntries(keys.map(key => [key, { type: 'string', value: key }]))
});

const keysOf = (value: DataValue) => Object.keys(value.value as Record<string, DataValue>).sort();
const slotAt = (value: DataValue, key: string) => (value.value as Record<string, DataValue>)[key]?.value;

describe('removeTableLine', () => {
    const grid = table('0:0', '0:1', '0:2', '1:0', '1:1', '1:2', '2:0', '2:1', '2:2');

    it('removes a middle row and moves the later ones up', () => {
        const result = removeTableLine(grid, 'row', 1);
        expect(keysOf(result)).toEqual(['0:0', '0:1', '0:2', '1:0', '1:1', '1:2']);
        // The old third row is now the second
        expect(slotAt(result, '1:0')).toBe('2:0');
        expect(slotAt(result, '1:2')).toBe('2:2');
    });

    it('removes a middle column and moves the later ones left', () => {
        const result = removeTableLine(grid, 'col', 1);
        expect(keysOf(result)).toEqual(['0:0', '0:1', '1:0', '1:1', '2:0', '2:1']);
        expect(slotAt(result, '0:1')).toBe('0:2');
        expect(slotAt(result, '2:1')).toBe('2:2');
    });

    it('removes the first row and the first column', () => {
        expect(slotAt(removeTableLine(grid, 'row', 0), '0:0')).toBe('1:0');
        expect(slotAt(removeTableLine(grid, 'col', 0), '0:0')).toBe('0:1');
    });

    it('removes the last row and the last column without moving the rest', () => {
        const withoutRow = removeTableLine(grid, 'row', 2);
        expect(keysOf(withoutRow)).toEqual(['0:0', '0:1', '0:2', '1:0', '1:1', '1:2']);
        expect(slotAt(withoutRow, '1:1')).toBe('1:1');

        const withoutCol = removeTableLine(grid, 'col', 2);
        expect(keysOf(withoutCol)).toEqual(['0:0', '0:1', '1:0', '1:1', '2:0', '2:1']);
        expect(slotAt(withoutCol, '2:1')).toBe('2:1');
    });

    it('keeps empty cells empty, as an empty slot is not stored', () => {
        // Only the cells with components are stored: the cell 1:1 is empty
        const result = removeTableLine(table('0:0', '2:2'), 'row', 1);
        expect(keysOf(result)).toEqual(['0:0', '1:2']);
    });

    it('keeps the entries that are not a cell', () => {
        const result = removeTableLine(table('0:0', 'other', '1:0'), 'row', 0);
        expect(keysOf(result)).toEqual(['0:0', 'other']);
        expect(slotAt(result, '0:0')).toBe('1:0');
    });

    it('returns an empty record for an empty record', () => {
        expect(removeTableLine(table(), 'col', 0)).toEqual({ type: 'record', value: {} });
    });

    it('does not mutate the given value', () => {
        const before = structuredClone(grid);
        removeTableLine(grid, 'row', 0);
        removeTableLine(grid, 'col', 1);
        expect(grid).toEqual(before);
    });

    it('returns a value that is not a record as it is', () => {
        const value: DataValue = { type: 'string', value: 'x' };
        expect(removeTableLine(value, 'row', 0)).toBe(value);
    });
});
