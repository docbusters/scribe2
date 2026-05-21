import type { DataValue } from "../domain/data/DataValue.js";
import { dataStore } from "../stores/data-store.svelte.js";

export const stringifyDataValue = (value: DataValue): string => {
    switch (value.type) {
        case 'string':
            return value.value;
        case 'number':
            return value.value.toString();
        case 'boolean':
            return value.value ? 'true' : 'false';
        case 'date':
            return value.value.toISOString();
        case 'binding':
            return stringifyDataValue(dataStore.data[value.id]);  
        default:
            throw new Error('Unsupported data value type');
    }
}
