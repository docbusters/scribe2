import type { BaseComponent } from "../domain/components/Component.js";
import type { DataValue } from "../domain/data/DataValue.js";
import type { Document } from "../domain/Document.js";
import type { ComponentRegistry } from "../registry/ComponentRegistry.js";

export type ScribeMode = "edit" | "view";

export interface ScribeProps<C extends BaseComponent<string, DataValue> = never> {
    id?: string;
    class?: string;
    style?: string;
    mode?: ScribeMode;
    document: Document<C>;
    registry?: ComponentRegistry<C>;
    customBindings?: Record<string, CustomBinding>;
    ondocumentchange?: (event: CustomEvent<Document<C>>) => void;
}

export interface CustomBinding {
    type: string;
    name: string;
    /** Returns the current value and provides an update function */
    getData: (id: string, update: (newValue: DataValue) => void) => {
        value: DataValue;
        /** Optional cleanup function */
        destroy?: () => void;
    };
}