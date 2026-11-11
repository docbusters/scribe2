import { describe, expect, it } from 'vitest';
import type { BaseComponent, ComponentConfig } from '../domain/components/Component.js';
import type { DataValue, RecordValue } from '../domain/data/DataValue.js';
import { findSlotOf, readSlotEntries, rekeySlotContents, toSlotValue, type ContentEntries } from './componentSlots.js';

type AnyComponent = BaseComponent<string, DataValue, ComponentConfig | undefined>;

const text = (id: string, value = ''): AnyComponent => ({ id, type: 'text', mode: 'inline', value: { type: 'string', value } });

/** A component whose value is a record of slots, like a table */
const holder = (id: string, slots: Record<string, AnyComponent[]>): AnyComponent => ({
    id,
    type: 'table',
    mode: 'block',
    value: {
        type: 'record',
        value: Object.fromEntries(Object.entries(slots).map(([key, components]) => [
            key,
            toSlotValue(components.map(component => [component.id, component] as [string, AnyComponent]))
        ]))
    } as RecordValue<string, DataValue>
});

describe('readSlotEntries', () => {
    it('reads the components of a slot in order', () => {
        const parent = holder('t', { '0:0': [text('a'), text('b')] });
        expect(readSlotEntries(parent.value, '0:0')?.map(([id]) => id)).toEqual(['a', 'b']);
    });

    it('reads a missing slot as empty', () => {
        expect(readSlotEntries(holder('t', {}).value, '0:0')).toEqual([]);
    });

    it('rejects a value that is not a record', () => {
        expect(readSlotEntries({ type: 'string', value: 'x' }, '0:0')).toBeNull();
    });

    it('rejects a slot that does not hold components', () => {
        const parent: AnyComponent = {
            id: 't', type: 'table', mode: 'block',
            value: { type: 'record', value: { '0:0': { type: 'component', value: text('a') } } }
        };
        // The old shape (a bare component per cell) is not a record of components
        expect(readSlotEntries(parent.value, '0:0')).toBeNull();

        const mixed: AnyComponent = {
            id: 't', type: 'table', mode: 'block',
            value: { type: 'record', value: { '0:0': { type: 'record', value: { a: { type: 'string', value: 'x' } } } } }
        };
        expect(readSlotEntries(mixed.value, '0:0')).toBeNull();
    });
});

describe('toSlotValue', () => {
    it('keeps the order and keys the components by id', () => {
        const entries: ContentEntries = [['b', text('b')], ['a', text('a')]];
        const value = toSlotValue(entries);
        expect(Object.keys(value.value)).toEqual(['b', 'a']);
        expect(value.value.a.value).toBe(entries[1][1]);
    });
});

describe('findSlotOf', () => {
    const inner = holder('inner', { '0:0': [text('deep')] });
    const outer = holder('outer', { '0:0': [text('a')], '0:1': [inner] });
    const content = { outer, top: text('top') };

    it('returns null for a component of the content itself', () => {
        expect(findSlotOf(content, 'top')).toBeNull();
        expect(findSlotOf(content, 'outer')).toBeNull();
    });

    it('finds the slot of a nested component', () => {
        expect(findSlotOf(content, 'a')).toEqual({ parentId: 'outer', slotKey: '0:0' });
        expect(findSlotOf(content, 'inner')).toEqual({ parentId: 'outer', slotKey: '0:1' });
    });

    it('finds components in slots inside slots', () => {
        expect(findSlotOf(content, 'deep')).toEqual({ parentId: 'inner', slotKey: '0:0' });
    });

    it('returns undefined for an unknown component', () => {
        expect(findSlotOf(content, 'nope')).toBeUndefined();
    });
});

describe('rekeySlotContents', () => {
    it('keys the slots by the new ids at any depth', () => {
        const inner = holder('inner', { '0:0': [text('deep')] });
        const outer = holder('outer', { '0:0': [text('a'), inner] });

        // What cloning does: the ids change, the keys stay the old ones
        const slot = (outer.value as RecordValue<string, RecordValue<string, { type: 'component'; value: AnyComponent }>>).value['0:0'];
        slot.value.a.value.id = 'a2';
        slot.value.inner.value.id = 'inner2';
        const deepSlot = (slot.value.inner.value.value as RecordValue<string, RecordValue<string, { type: 'component'; value: AnyComponent }>>).value['0:0'];
        deepSlot.value.deep.value.id = 'deep2';

        rekeySlotContents(outer.value);

        expect(Object.keys(slot.value)).toEqual(['a2', 'inner2']);
        expect(Object.keys(deepSlot.value)).toEqual(['deep2']);
        expect(findSlotOf({ outer }, 'deep2')).toEqual({ parentId: 'inner2', slotKey: '0:0' });
    });

    it('leaves records that are not made of components untouched', () => {
        const value: DataValue = { type: 'record', value: { latitude: { type: 'number', value: 1 }, address: { type: 'string', value: 'x' } } };
        rekeySlotContents(value);
        expect(Object.keys(value.value)).toEqual(['latitude', 'address']);
    });
});
