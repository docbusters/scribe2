import type { DataValue } from "../domain/data/DataValue.js";
import { editStore } from "../stores/edit-store.svelte.js";
import { generateRandomId } from "./generateRandomId.js";

export function generateDefaultDataValue(type: DataValue['type']): DataValue {
    switch (type) {
        case 'string':
            return {
                type: 'string',
                value: '',
            };
        case 'number':
            return {
                type: 'number',
                value: 0,
            };
        case 'boolean':
            return {
                type: 'boolean',
                value: false,
            };
        case 'date':
            return {
                type: 'date',
                value: new Date(),
            };
        case 'array':
            return {
                type: 'array',
                value: [],
            };
        case 'record':
            return {
                type: 'record',
                value: {},
            };
        case 'binding': {
            // In this case we need to add a new binding
            const bindingId = editStore.addBinding({
                type: 'string',
                initialValue: '',
            });
            return {
                type: 'binding',
                id: bindingId,
            };

        }
        case 'component':
            return {
                type: 'component',
                value: {
                    id: generateRandomId('text'),
                    mode: 'inline',
                    type: 'text',
                    value: {
                        type: 'string',
                        value: 'New text',
                    },
                },
            };
        default:
            throw new Error(`Unsupported data value type: ${type}`);
    }
}
