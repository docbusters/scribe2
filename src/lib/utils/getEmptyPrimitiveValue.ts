import type { PrimitiveValue } from "$lib/domain/data/DataValue.js";

export function getEmptyPrimitiveValue<T extends PrimitiveValue['type']>(
    type: T
): Extract<PrimitiveValue, { type: T }>['value'];

export function getEmptyPrimitiveValue(type: PrimitiveValue['type']): PrimitiveValue['value'] {
    switch (type) {
        case 'string':
            return '';
        case 'number':
            return 0;
        case 'boolean':
            return false;
        case 'date':
            return new Date();
        default:
            throw new Error(`Unsupported data value type: ${type}`);
    }
}
