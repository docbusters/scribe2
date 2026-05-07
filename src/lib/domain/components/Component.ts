import type { DataValue } from "../data/DataValue.ts";

export interface BaseComponent<T extends string, V extends DataValue> {
    id: string;
    type: T;
    mode: 'inline' | 'block';
    value: V;
}

export interface InlineComponent<T extends string, V extends DataValue> extends BaseComponent<T, V> {
    mode: 'inline';
}

export interface BlockComponent<T extends string, V extends DataValue> extends BaseComponent<T, V> {
    mode: 'block';
}

// Utility types to extract inline and block components from a union of components
export type ExtractInline<C> = C extends { mode: 'inline' } ? C : never;
export type ExtractBlock<C> = C extends { mode: 'block' } ? C : never;
