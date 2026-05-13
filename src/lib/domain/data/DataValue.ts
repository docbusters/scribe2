import type { BaseComponent, ComponentConfig } from "../components/Component.ts";

/** All available data values */
export type DataValue = PrimitiveValue | BindingValue | CollectionValue;

export type CollectionValue = ArrayValue<DataValue> | RecordValue<string, DataValue>;
export type PrimitiveValue = StringValue | NumberValue | BooleanValue | DateValue | ComponentValue;

export interface BaseValue {
    type: string;
}

export interface StringValue {
    type: "string";
    value: string;
}

export interface NumberValue {
    type: "number";
    value: number;
}

export interface BooleanValue {
    type: "boolean";
    value: boolean;
}

export interface DateValue {
    type: "date";
    value: Date;
}

export interface ArrayValue<T> {
    type: "array";
    value: T[];
}

export interface RecordValue<T extends string, K> {
    type: "record";
    value: Record<T, K>;
}

export interface ComponentValue {
    type: "component";
    value: BaseComponent<string, DataValue, ComponentConfig | undefined>;
}

export interface BindingValue {
    type: "binding";
    id: string;
}
