import type { BindingValue, PrimitiveValue } from "$lib/domain/data/DataValue.js";
import type { BindingsDefinition, Document } from "$lib/domain/Document.js";
import { getEmptyPrimitiveValue } from "$lib/utils/getEmptyPrimitiveValue.js";

class DataStore {
    data: Record<BindingValue['id'], PrimitiveValue> = $state({});

    initialize(bindings: Document['bindings']) {
        Object.entries(bindings).forEach(([id, binding]) => {
            this.addBinding(id, binding);
        });
    }

    addBinding(id: string, binding: BindingsDefinition) {
        // If no initial value is provided, use an empty value based on the type
        const primitiveValue = (
            binding.initialValue !== undefined
                ? { type: binding.type, value: binding.initialValue }
                : { type: binding.type, value: getEmptyPrimitiveValue(binding.type) }
        ) as PrimitiveValue;
        this.data[id] = this.data[id] = primitiveValue;
    }
}

export const dataStore = new DataStore();
