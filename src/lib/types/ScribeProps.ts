import type { BaseComponent } from "../domain/components/Component.js";
import type { CollectionValue, DataValue, PrimitiveValue } from "../domain/data/DataValue.js";
import type { Document, BindingsDefinition } from "../domain/Document.js";
import type { ComponentRegistry } from "../registry/ComponentRegistry.js";

export type ScribeMode = "edit" | "view";

export interface ScribeProps<C extends BaseComponent<string, DataValue> = never> {
    id?: string;
    class?: string;
    style?: string;
    mode?: ScribeMode;
    /** Initial document value. Changes made in the document while in edit mode will be notified via the `ondocumentchange` event. */
    document: Document<C>;
    bindings?: Record<string, BindingsDefinition>;
    registry?: ComponentRegistry<C>;
    customBindings?: Record<string, CustomBinding>;
    ondocumentchange?: (event: CustomEvent<Document<C>>) => void;
    onbindingchange?: (event: CustomEvent<CustomBindingValueUpdate | BindingDefinitionUpdate>) => void;
}

export interface CustomBinding {
    type: string;
    name: string;
    /** Returns the available ids and their labels for the editor */
    getAvailableIds: () => { id: string; label: string; type: string }[];
    /** Returns the current value and provides an update function */
    getData: (id: string, update: (newValue: PrimitiveValue | CollectionValue) => void) => {
        value: PrimitiveValue | CollectionValue;
        /** Optional cleanup function */
        destroy?: () => void;
    };
}

/** 
 * The type of update that occurred. 
 * onchange: The value has updated but the user has not finished interacting with the input.
 * onblur: The user has finished interacting with the input and the value is finalized.
 */
export type UpdateType = 'onchange' | 'onblur';

/** A binding definition has been updated, most likely its initial value */
export interface BindingDefinitionUpdate {
    type: 'binding_update';
    updateType: UpdateType;
    id: string;
    definition: BindingsDefinition;
} 

/** A custom binding value has been updated */
export interface CustomBindingValueUpdate {
    type: 'value_update';
    updateType: UpdateType;
    bindingType: string;
    id: string;
    value: PrimitiveValue | CollectionValue;
}
