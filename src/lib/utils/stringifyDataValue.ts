import type { DataValue } from "../domain/data/DataValue.js";
import { dataStore } from "../stores/data-store.svelte.js";
import { customBindingsStore } from "../stores/custom-bindings-store.svelte.js";

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
        case 'binding': {
            // Check if it is a default document binding
            if (value.bindingType === undefined || value.bindingType === 'default') {
                return stringifyDataValue(dataStore.data[value.value]); 
            }
            
            // Resolve the custom binding
            const customValue = customBindingsStore.getValue(value.bindingType, value.value);
            return stringifyDataValue(customValue);
        }
        default:
            throw new Error('Unsupported data value type');
    }
}
