import type { DataValue } from "../data/DataValue.js";

export interface ComponentConfig {
    [key: string]: unknown;
}

// Añadimos un tercer genérico P (Props) que por defecto es un objeto vacío
export interface BaseComponent<T extends string, V extends DataValue, P extends ComponentConfig | undefined = undefined> {
    id: string;
    type: T;
    mode: 'inline' | 'block';
    value: V;
    config?: P;
}

export interface InlineComponent<T extends string, V extends DataValue, P extends ComponentConfig | undefined = undefined> extends BaseComponent<T, V, P> {
    mode: 'inline';
}

export interface BlockComponent<T extends string, V extends DataValue, P extends ComponentConfig | undefined = undefined> extends BaseComponent<T, V, P> {
    mode: 'block';
}

// Utility types to extract inline and block components from a union of components
export type ExtractInline<C> = C extends { mode: 'inline' } ? C : never;
export type ExtractBlock<C> = C extends { mode: 'block' } ? C : never;
