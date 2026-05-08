import type { BaseComponent } from '$lib/domain/components/Component.js';
import type { DataValue } from '$lib/domain/data/DataValue.js';
import type { Component } from 'svelte';
import type { DefaultComponents } from './defaultRegistry.js';

/** Props that should be implemented by every user-defined component */
export interface ScribeComponentProps<T extends BaseComponent<string, DataValue>> {
    componentData: T;
}

export type ComponentRegistry<TComponent extends BaseComponent<string, DataValue> = never> = {
    [K in (DefaultComponents | TComponent)['type']]: Component<ScribeComponentProps<Extract<DefaultComponents | TComponent, { type: K }>>>;
};

