import type { BindingsDefinition } from "../domain/Document.js";
import type { DataValue } from "../domain/data/DataValue.js";
import { editStore } from "../stores/edit-store.svelte.js";
import { generateRandomId } from "./generateRandomId.js";

/**
 * Generates a default data value given a type. If specified, it will use the initialValue to generate the default value, but if the type of the initialValue does not match the specified type, it will throw an error.
 */
export function generateDefaultDataValue(type: DataValue['type'], initialValue?: DataValue, componentType?: string): DataValue {
    if (initialValue && type !== 'binding' && initialValue.type !== type) {
        throw new Error(`Initial value type (${initialValue.type}) does not match the specified type (${type})`);
    }
    switch (type) {
        case 'empty':
            return {
                type: 'empty',
                value: undefined,
            };
        case 'string':
            return {
                type: 'string',
                value: initialValue?.value as string ?? '',
            };
        case 'number':
            return {
                type: 'number',
                value: initialValue?.value as number ?? 0,
            };
        case 'boolean':
            return {
                type: 'boolean',
                value: initialValue?.value as boolean ?? false,
            };
        case 'date':
            return {
                type: 'date',
                value: initialValue?.value as Date ?? new Date(),
            };
        case 'array':
            return {
                type: 'array',
                value: initialValue?.value as DataValue[] ?? [],
            };
        case 'record': {
            return {
                type: 'record',
                value: initialValue?.value as Record<string, DataValue> ?? {},
            };
        }
        case 'binding': {
            // In this case we need to add a new binding
            let bindingDef: BindingsDefinition;

            if (initialValue && initialValue.type !== 'binding') {
                bindingDef = {
                    type: initialValue.type,
                    initialValue: initialValue.value,
                } as BindingsDefinition;
            } else if (componentType === 'text-input') {
                bindingDef = {
                    type: 'string',
                    initialValue: '',
                };
            } else {
                bindingDef = {
                    type: 'empty',
                    initialValue: undefined,
                };
            }

            const bindingId = editStore.addBinding(bindingDef, componentType);
            return {
                type: 'binding',
                bindingType: 'default',
                value: bindingId,
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
