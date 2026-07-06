import type { BaseComponent, ComponentConfig } from '../domain/components/Component.js';
import type { CollectionValue, DataValue, PrimitiveValue } from '../domain/data/DataValue.js';

import type { DefaultComponents } from './defaultRegistry.js';
import type { ScribeMode, UpdateType } from '../types/ScribeProps.js';
import type { ComponentEditOptions } from './ComponentEditOptions.ts';
import type { InstanceData } from './svelteMountHelper.svelte.ts';

/** Props that should be implemented by every user-defined component */
export interface ScribeComponentProps<T extends BaseComponent<string, DataValue, ComponentConfig | undefined>> {
    componentData: T;
    sectionId: string;
    mode: ScribeMode;
    /** Component value with bindings resolved */
    resolvedValue: PrimitiveValue | CollectionValue;
    /** Updates the component value handling binding updates */
    updateComponentValue: (newValue: DataValue, updateType: UpdateType) => void;
    /** Updates the component config handling config updates */
    updateComponentConfig: (newConfig: ComponentConfig) => void;
    /** Indicates whether the component is in dark mode */
    isDarkMode: boolean;
}

export type ComponentRegistry<
    TComponent extends BaseComponent<string, DataValue, ComponentConfig | undefined> = never
> = {
    [C in DefaultComponents | TComponent as C['type']]: {
        name: string;
        description: string;
        icon: string;
        /** Mount the component into the given DOM node */
        mount: (node: HTMLElement, props: ScribeComponentProps<C>) => InstanceData<ScribeComponentProps<C>>;
        /** Optional method to update the component with new props */
        update?: (instance: InstanceData<ScribeComponentProps<C>>, props: ScribeComponentProps<C>) => void;
        /** Optional method to unmount the component and clean up */
        unmount?: (instance: InstanceData<ScribeComponentProps<C>>) => void;
        /** Contains the default configuration for the component when inserted. Id will be generated automatically */
        empty: Omit<C, 'id' | 'value'> & { value: C['value']['type'] };
        /** 
         * Initial value for the component. If not provided, a default value will be used.
         * NOTE: Some value types such as records required this to be provided since they don't have a meaningful default value
         */
        initialValue?: DataValue;
        /** Options displayed for editing a component. If not provided, default options will be used */
        options?: ComponentEditOptions[];
        /** Allowed value types for this component */
        valueTypes: DataValue['type'][];
        /** Supported value types for bindings. Only needs to be specified if the component supports bindings */
        supportedBindingValueTypes?: Omit<DataValue['type'], 'binding'>[];
    };
};

