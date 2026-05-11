import type { BaseComponent } from "$lib/domain/components/Component.js";
import type { DataValue } from "$lib/domain/data/DataValue.js";
import type { Document } from "$lib/domain/Document.js";
import type { ComponentRegistry } from "$lib/registry/ComponentRegistry.js";

export interface ScribeProps<C extends BaseComponent<string, DataValue> = never> {
    id?: string;
    class?: string;
    style?: string;
    document: Document<C>;
    registry?: ComponentRegistry<C>;
}
