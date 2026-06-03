import type { ScribeMode } from "$lib/types/ScribeProps.js";
import { generateDefaultDataValue } from "$lib/utils/generateDefaultDataValue.js";
import type { BindingValue, CollectionValue, DataValue, PrimitiveValue } from "../domain/data/DataValue.ts";
import type { BindingsDefinition } from "../domain/Document.ts";
import { customBindingsStore } from "./custom-bindings-store.svelte.js";
import { editStore } from "./edit-store.svelte.js";

class BindingStore {
    data: Record<BindingValue['value'], CollectionValue | PrimitiveValue> = $state({});

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
                : generateDefaultDataValue(binding.type)
        ) as CollectionValue | PrimitiveValue;
        this.data[id] = this.data[id] = primitiveValue;
    }

    getBindingOptions(supportedTypes?: Omit<DataValue['type'], 'binding'>[]) {
        return Object.entries(this.data).map(([id]) => {
            const type = this.data[id].type;
            const disabled = !supportedTypes?.includes(type);
            return {
                value: id,
                label: `${id} (${this.data[id].value})`,
                disabled,
                type
            };
        });
    }

    /** Returns the value of a binding based on its ID and type */
    getBindingValue(id: string, bindingType: "default" | string) {
        if (bindingType === "default") {
            if (!this.data[id]) {
                throw new Error(`Binding with id ${id} does not exist.`);
            }

            return this.data[id];
        }

        return customBindingsStore.getValue(bindingType, id);
    }

    /**
     * Updates a binding value dpending on the mode and binding type.
     * Edit mode: Updates the value and initial value of default bindings and updates the value of custom bindings.
     * View mode: Only updates the value bindings without modifying the initial value.
     */
    updateBindingValue(mode: ScribeMode, bindingId: string, bindingType: "default" | string, newValue: CollectionValue | PrimitiveValue) {
        const isDefaultBinding = bindingType === "default";
        const isEditMode = mode === "edit";

        console.log(`Updating binding ${bindingId} with value`, newValue, `in mode ${mode} and binding type ${bindingType}`);

        if (!isDefaultBinding) {
            // TODO: Update custom bindings
            return;
        }
        
        if (isEditMode) {
            editStore.setBindingInitialValue(bindingId, newValue);
        }

        this.setBindingValue(bindingId, newValue);
    }

    /** Sets the value of a default binding contained in this store */
    private setBindingValue(id: BindingValue['value'], value: CollectionValue | PrimitiveValue) {
        if (!this.data[id]) {
            throw new Error(`Binding with id ${id} does not exist.`);
        }
        this.data[id] = value;
    }
}

export const bindingStore = new BindingStore();
