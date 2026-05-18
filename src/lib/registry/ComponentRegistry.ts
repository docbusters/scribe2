import type { BaseComponent, ComponentConfig } from '$lib/domain/components/Component.js';
import type { DataValue } from '$lib/domain/data/DataValue.js';
import type { Component } from 'svelte';
import type { DefaultComponents } from './defaultRegistry.js';
import type { ScribeMode } from '$lib/types/ScribeProps.js';

/** Props that should be implemented by every user-defined component */
export interface ScribeComponentProps<T extends BaseComponent<string, DataValue, ComponentConfig | undefined>> {
    componentData: T;
    sectionId: string;
    mode: ScribeMode;
}

export type ComponentRegistry<
    TComponent extends BaseComponent<string, DataValue, ComponentConfig | undefined> = never
> = {
    [C in DefaultComponents | TComponent as C['type']]: {
        name: string;
        description: string;
        icon: string;
        component: Component<ScribeComponentProps<C>>;
        /** Contains the default configuration for the component when inserted. Id will be generated automatically */
        empty:  Omit<C, 'id' | 'value'> & { value: C['value']['type'] };
    };
};

