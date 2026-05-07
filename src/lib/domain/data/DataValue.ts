export type DataValue = PrimitiveValue | BindingValue;
export type PrimitiveValue = StringValue | NumberValue | BooleanValue | DateValue;

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

export interface BindingValue {
    type: "binding";
    id: string;
}
