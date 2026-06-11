import type { DefaultComponents } from "../registry/defaultRegistry.js";
import type { CollectionValue, PrimitiveValue } from "./data/DataValue.js";
import type { Section } from "./Section.js";

export interface Document<C = never> {
    title: string;
    sections: Record<string, Section<DefaultComponents | C>>;
}

export type BindingsDefinition = {
    [K in PrimitiveValue['type'] | CollectionValue['type']]: {
        type: K;
        initialValue?: Extract<PrimitiveValue | CollectionValue, { type: K }>['value'];
    }
}[PrimitiveValue['type'] | CollectionValue['type']];
