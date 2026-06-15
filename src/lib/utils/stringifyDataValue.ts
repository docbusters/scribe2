import type { DataValue } from "../domain/data/DataValue.js";

export const stringifyDataValue = (value: DataValue): string => {
    switch (value.type) {
        case 'string':
            return value.value;
        case 'number':
            return value.value.toString();
        case 'boolean':
            return value.value ? 'True' : 'False';
        case 'date':
            return value.value.toISOString();
        case 'array':
            return value.value.map(stringifyDataValue).join(', ');
        case 'record':
            return Object.entries(value.value)
                .map(([key, val]) => `${key}: ${stringifyDataValue(val)}`)
                .join(', ');
        case 'empty':
            return '';
        default:
            throw new Error('Unsupported data value type');
    }
}
