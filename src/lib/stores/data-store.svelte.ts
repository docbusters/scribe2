import type { BindingValue, PrimitiveValue } from "../domain/data/DataValue.js";
import type { BindingsDefinition } from "../domain/Document.js";
import { getEmptyPrimitiveValue } from "../utils/getEmptyPrimitiveValue.js";

class DataStore {
    data: Record<BindingValue['value'], PrimitiveValue> = $state({});

    initialize(bindings: Record<string, BindingsDefinition>) {
        Object.entries(bindings).forEach(([id, binding]) => {
            this.addBinding(id, binding);
        });
    }

    // BINDINGS

    addBinding(id: string, binding: BindingsDefinition) {
        // If no initial value is provided, use an empty value based on the type
        const primitiveValue = (
            binding.initialValue !== undefined
                ? { type: binding.type, value: binding.initialValue }
                : { type: binding.type, value: getEmptyPrimitiveValue(binding.type) }
        ) as PrimitiveValue;
        this.data[id] = this.data[id] = primitiveValue;
    }

    getBindingOptions(supportedTypes?: string[]) {
        const allowedTypes = supportedTypes?.filter(t => t !== 'binding') || [];
        return Object.entries(this.data).map(([id]) => {
            const type = this.data[id].type;
            const disabled = allowedTypes.length > 0 ? !allowedTypes.includes(type) : false;
            return {
                value: id,
                label: `${id} (${this.data[id].value})`,
                disabled,
                type
            };
        });
    }
}

export const dataStore = new DataStore();
