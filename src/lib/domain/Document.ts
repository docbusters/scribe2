import type { DefaultComponents } from "../registry/defaultRegistry.js";
import type { BindingValue, PrimitiveValue } from "./data/DataValue.ts";
import type { Section } from "./Section.js";

export interface Document<C = never> {
    id: string;
    title: string;
    sections: Record<string, Section<DefaultComponents | C>>;
    bindings: Record<BindingValue['id'], BindingsDefinition>;
}

export type BindingsDefinition = {
    [K in PrimitiveValue['type']]: {
        type: K;
        initialValue?: Extract<PrimitiveValue, { type: K }>['value'];
    }
}[PrimitiveValue['type']];
