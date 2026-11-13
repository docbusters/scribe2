import type { BaseComponent, ComponentConfig } from '../domain/components/Component.js';
import type { CollectionValue, DataValue, PrimitiveValue } from '../domain/data/DataValue.js';

import type { DefaultComponents } from './defaultRegistry.js';
import type { ScribeMode, UpdateType } from '../types/ScribeProps.js';
import type { ComponentEditOptions } from './ComponentEditOptions.ts';
import type { InstanceData } from '../svelte/mount.svelte.js';

/**
 * Props that should be implemented by every user-defined component.
 * A component that draws with the CSS of the host (for example Tailwind v4 utilities) can put `data-scribe-host` on its root,
 * so Scribe's resets of plain tags (span, p, headings, a, button, input, border-color) do not apply inside it
 */
export interface ScribeComponentProps<T extends BaseComponent<string, DataValue, ComponentConfig | undefined>> {
    componentData: T;
    sectionId: string;
    mode: ScribeMode;
    /** Component value with bindings resolved */
    resolvedValue: PrimitiveValue | CollectionValue;
    /** Indicates whether the component value is resolved from a binding */
    isBinding: boolean;
    /** Updates the component value handling binding updates */
    updateComponentValue: (newValue: DataValue, updateType: UpdateType) => void;
    /** Updates the component config handling config updates. Ignored outside edit mode, as the config is part of the document */
    updateComponentConfig: (newConfig: ComponentConfig) => void;
    /** Indicates whether the component is in dark mode: the class `dark` is on the root element of Scribe or on any ancestor, and it follows the class live */
    isDarkMode: boolean;
}

/** Height in px of a block component: the one it has when inserted and the limits it can be resized between */
export interface ComponentHeight {
    default: number;
    min: number;
    max: number;
}

/**
 * The height of a block component. With a height the block is a box of that height and its content must fill it.
 * If it is resizeable the user can change the height of the selected block between min and max, so the height is required
 */
export type ComponentHeightDefinition =
    | { isResizeable?: false; height?: ComponentHeight }
    | { isResizeable: true; height: ComponentHeight };

export type ComponentRegistry<
    TComponent extends BaseComponent<string, DataValue, ComponentConfig | undefined> = never
> = {
    [C in DefaultComponents | TComponent as C['type']]: ComponentHeightDefinition & {
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

