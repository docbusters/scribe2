import type { DataValue } from "../domain/data/DataValue.js";
import { i18n } from "../i18n/i18n.svelte.js";

export const stringifyDataValue = (value: DataValue): string => {
    switch (value.type) {
        case 'string':
            return value.value;
        case 'number':
            return value.value.toString();
        case 'boolean':
            return value.value ? i18n.t('common.true') : i18n.t('common.false');
        case 'date': {
            // JSON turns a Date into an ISO string, so a value loaded from a saved document is a string
            const date = new Date(value.value);
            return isNaN(date.getTime()) ? '' : date.toISOString();
        }
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
