import type { BaseComponent } from "../domain/components/Component.js";
import type { DataValue } from "../domain/data/DataValue.js";
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
}

export interface CustomBinding {
    type: string;
    name: string;
    /** Optional function to get the available ids and their labels for the editor */
    getAvailableIds?: () => { id: string; label?: string }[];
    /** Returns the current value and provides an update function */
    getData: (id: string, update: (newValue: DataValue) => void) => {
        value: DataValue;
        /** Optional cleanup function */
        destroy?: () => void;
    };
}
