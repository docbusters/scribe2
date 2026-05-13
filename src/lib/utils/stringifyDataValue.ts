import type { DataValue } from "$lib/domain/data/DataValue.js";
import { dataStore } from "$lib/stores/data-store.svelte.js";

export const stringifyDataValue = (value: DataValue): string => {
    console.log('Stringifying value:', value);
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
