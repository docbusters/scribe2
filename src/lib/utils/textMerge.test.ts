import { describe, expect, it } from 'vitest';
import type { BaseComponent, ComponentConfig } from '../domain/components/Component.js';
import type { DataValue } from '../domain/data/DataValue.js';
import { mergeAdjacentTexts } from './textMerge.js';

type AnyComponent = BaseComponent<string, DataValue, ComponentConfig | undefined>;
type Entries = [string, AnyComponent][];

const text = (id: string, value: string): [string, AnyComponent] => [id, { id, type: 'text', mode: 'inline', value: { type: 'string', value } }];
const image = (id: string, mode: 'inline' | 'block' = 'block'): [string, AnyComponent] => [id, { id, type: 'image', mode, value: { type: 'string', value: 'x.png' } } as AnyComponent];

const ids = (entries: Entries) => entries.map(([id]) => id);
const values = (entries: Entries) => entries.map(([, component]) => (component.value as { value: string }).value);

describe('mergeAdjacentTexts after a delete', () => {
    // The caller removes the component first, so the two texts are already next to each other
    it('keeps a single space when the inline component sat between "Hello " and "world"', () => {
        const result = mergeAdjacentTexts([text('a', 'Hello '), text('b', 'world')], undefined, ' ');
        expect(values(result.entries)).toEqual(['Hello world']);
        expect(ids(result.entries)).toEqual(['a']);
    });

    it('adds a space between "Hello" and "world"', () => {
        expect(values(mergeAdjacentTexts([text('a', 'Hello'), text('b', 'world')], undefined, ' ').entries)).toEqual(['Hello world']);
    });

    it('does not double a space that starts the second text', () => {
        expect(values(mergeAdjacentTexts([text('a', 'Hello'), text('b', ' world')], undefined, ' ').entries)).toEqual(['Hello world']);
    });

    it('keeps one line break when the block sat between "a\\n" and "b"', () => {
        expect(values(mergeAdjacentTexts([text('a', 'a\n'), text('b', 'b')], undefined, '\n').entries)).toEqual(['a\nb']);
    });

    it('adds a line break between "a" and "b"', () => {
        expect(values(mergeAdjacentTexts([text('a', 'a'), text('b', 'b')], undefined, '\n').entries)).toEqual(['a\nb']);
    });

    it('adds no separator next to an empty text', () => {
        expect(values(mergeAdjacentTexts([text('a', ''), text('b', 'b')], undefined, ' ').entries)).toEqual(['b']);
        expect(values(mergeAdjacentTexts([text('a', 'a'), text('b', '')], undefined, '\n').entries)).toEqual(['a']);
    });

    it('keeps the id of the first text, and the other components in their places', () => {
        const result = mergeAdjacentTexts([image('i1'), text('a', 'x'), text('b', 'y'), image('i2')], undefined, ' ');
        expect(ids(result.entries)).toEqual(['i1', 'a', 'i2']);
        expect(values(result.entries)[1]).toBe('x y');
    });
});

describe('mergeAdjacentTexts after an insert', () => {
    it('joins the texts with no separator', () => {
        expect(values(mergeAdjacentTexts([text('a', 'Hello '), text('b', 'world')]).entries)).toEqual(['Hello world']);
    });

    it('returns the id of the text that absorbed the target', () => {
        const result = mergeAdjacentTexts([text('a', 'Hello '), text('new', 'world')], 'new');
        expect(result.targetId).toBe('a');
    });

    it('returns the target itself when it is the first text of the run', () => {
        expect(mergeAdjacentTexts([text('new', 'Hello '), text('b', 'world')], 'new').targetId).toBe('new');
    });

    it('returns undefined when the target was not merged', () => {
        expect(mergeAdjacentTexts([text('a', 'x'), image('new'), text('b', 'y')], 'new').targetId).toBeUndefined();
    });

    it('returns undefined without a target', () => {
        expect(mergeAdjacentTexts([text('a', 'x'), text('b', 'y')]).targetId).toBeUndefined();
    });
});

describe('mergeAdjacentTexts in general', () => {
    it('does not merge texts that a component separates', () => {
        const result = mergeAdjacentTexts([text('a', 'x'), image('i', 'inline'), text('b', 'y')], undefined, ' ');
        expect(ids(result.entries)).toEqual(['a', 'i', 'b']);
    });

    it('merges a run of three texts into the first', () => {
        const result = mergeAdjacentTexts([text('a', 'a'), text('b', 'b'), text('c', 'c')], 'c', ' ');
        expect(values(result.entries)).toEqual(['a b c']);
        expect(result.targetId).toBe('a');
    });

    it('merges each run on its own', () => {
        const result = mergeAdjacentTexts([text('a', '1'), text('b', '2'), image('i'), text('c', '3'), text('d', '4')], undefined, '\n');
        expect(ids(result.entries)).toEqual(['a', 'i', 'c']);
        expect(values(result.entries)).toEqual(['1\n2', 'x.png', '3\n4']);
    });

    it('does not mutate the entries it receives', () => {
        const entries: Entries = [text('a', 'x'), text('b', 'y')];
        mergeAdjacentTexts(entries, undefined, ' ');
        expect(values(entries)).toEqual(['x', 'y']);
    });

    it('returns the same entries when there is nothing to merge', () => {
        const entries: Entries = [text('a', 'x'), image('i')];
        expect(mergeAdjacentTexts(entries).entries).toEqual(entries);
    });
});
