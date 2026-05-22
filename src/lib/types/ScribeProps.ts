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
    onchange?: (document: Document<C>) => void;
}
