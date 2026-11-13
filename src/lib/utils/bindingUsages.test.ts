import { describe, expect, it } from 'vitest';
import type { DataValue } from '../domain/data/DataValue.js';
import type { Document } from '../domain/Document.js';
import { calculateDocumentBindingUsages, extractBindingUsages, getDefaultBindingUsages, type CustomBindingUsages } from './bindingUsages.js';

const binding = (value: string, bindingType = 'default'): DataValue => ({ type: 'binding', bindingType, value });
const text = (id: string, value: DataValue) => ({ id, type: 'text', mode: 'inline', value });

/** A document with one section whose components hold the given values */
function documentWith(...components: ReturnType<typeof text>[]): Document {
    return {
        title: 'Test',
        sections: {
            s1: {
                id: 's1',
                title: 'Section',
                content: Object.fromEntries(components.map((component) => [component.id, component]))
            }
        }
    } as unknown as Document;
}

describe('getDefaultBindingUsages', () => {
    it('finds a component that is bound directly', () => {
        const doc = documentWith(text('a', binding('name')), text('b', { type: 'string', value: 'plain' }));
        expect(getDefaultBindingUsages(doc, 'name')).toEqual(['a']);
    });

    it('finds bindings inside arrays and records', () => {
        const doc = documentWith(
            text('a', { type: 'array', value: [{ type: 'string', value: 'x' }, binding('name')] }),
            text('b', { type: 'record', value: { key: binding('name') } })
        );
        expect(getDefaultBindingUsages(doc, 'name').sort()).toEqual(['a', 'b']);
    });

    it('reports a nested component by its own id', () => {
        const nested = text('inner', binding('name'));
        const doc = documentWith(text('outer', { type: 'component', value: nested } as DataValue));
        expect(getDefaultBindingUsages(doc, 'name')).toEqual(['inner']);
    });

    it('ignores other ids and custom bindings', () => {
        const doc = documentWith(text('a', binding('other')), text('b', binding('name', 'custom-type')));
        expect(getDefaultBindingUsages(doc, 'name')).toEqual([]);
    });

    it('lists each component once, even if it uses the binding several times', () => {
        const doc = documentWith(text('a', { type: 'array', value: [binding('name'), binding('name')] }));
        expect(getDefaultBindingUsages(doc, 'name')).toEqual(['a']);
    });

    it('returns nothing when there is no document', () => {
        expect(getDefaultBindingUsages(null as unknown as Document, 'name')).toEqual([]);
    });
});

describe('custom binding usages', () => {
    it('are calculated for custom bindings only', () => {
        const doc = documentWith(text('a', binding('x', 'custom-type')), text('b', binding('name')));
        const usages = calculateDocumentBindingUsages(doc);
        expect(Object.keys(usages)).toEqual(['custom-type']);
        expect([...usages['custom-type']['x']]).toEqual(['a']);
    });

    // The documentchange event gives the usages of the snapshot of the document, so components nested in a slot (a record of
    // components held by another component, as a table cell) must be found as well
    it('are found for a component inside a slot, by its own id', () => {
        const cell = text('cell-input', binding('x', 'custom-type'));
        const table = { id: 'table-1', type: 'table', mode: 'block', value: { type: 'record', value: { '0:0': { type: 'record', value: { 'cell-input': { type: 'component', value: cell } } } } } };
        const usages = calculateDocumentBindingUsages(documentWith(table as unknown as ReturnType<typeof text>));

        expect([...usages['custom-type']['x']]).toEqual(['cell-input']);
    });

    it('are new objects on every call, so a host never shares a Set with the next event', () => {
        const doc = documentWith(text('a', binding('x', 'custom-type')));
        const first = calculateDocumentBindingUsages(doc);
        const second = calculateDocumentBindingUsages(doc);

        first['custom-type']['x'].add('intruder');
        expect([...second['custom-type']['x']]).toEqual(['a']);
    });

    it('are empty when no component uses a custom binding', () => {
        expect(calculateDocumentBindingUsages(documentWith(text('a', binding('name'))))).toEqual({});
    });

    it('are added and removed per component, including nested ones', () => {
        const usages: CustomBindingUsages = {};
        const nested = text('inner', binding('x', 'custom-type'));
        const value = { type: 'array', value: [{ type: 'component', value: nested }, binding('x', 'custom-type')] } as DataValue;

        extractBindingUsages(usages, 'outer', value, true);
        expect([...usages['custom-type']['x']].sort()).toEqual(['inner', 'outer']);

        extractBindingUsages(usages, 'outer', value, false);
        expect(usages['custom-type']['x'].size).toBe(0);
    });
});
