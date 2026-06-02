import type { CustomBinding } from '$lib/types/ScribeProps.js';
import type { DataValue } from '../domain/data/DataValue.js';

interface CustomBindingInstance {
    value: DataValue;
    destroy?: () => void;
}


class CustomBindingsStore {
    definitions: Record<string, CustomBinding> = {};
    
    // Stores data values in a non-reactive way to avoid state_unsafe_mutation errors
    private cache = new Map<string, CustomBindingInstance>();
    // Triggers used to notify Svelte of changes in a safe way (outside the render cycle)
    private triggers = $state<Record<string, number>>({});

    initialize(bindings: Record<string, CustomBinding> | undefined) {
        this.destroy(); // Clean previous bindings
        this.definitions = bindings || {};
    }

    /** Obtains a reactive value for a given binding type and ID */
    getValue(bindingType: string, id: string): DataValue {
        const key = `${bindingType}:${id}`;
        
        // Read trigger to make Svelte subscribe to changes
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.triggers[key]; 

        // If the data already exists in the cache, return it immediately
        if (this.cache.has(key)) {
            return this.cache.get(key)!.value;
        }

        const def = this.definitions[bindingType];
        if (!def) {
            throw new Error(`Custom binding definition '${bindingType}' not found.`);
        }

        // Store temporarily an empty value to avoid infinite loops if getData calls getValue again
        const instance: CustomBindingInstance = { value: { type: 'string', value: '' } };
        this.cache.set(key, instance);

        // Initialize the binding and get the initial value
        const result = def.getData(id, (newValue) => {
            instance.value = newValue; // Update the cached initial value
            
            // Create a microtask that updates the trigger in order to notify Svelte of the change without causing state_unsafe_mutation
            queueMicrotask(() => {
                this.triggers[key] = (this.triggers[key] || 0) + 1;
            });
        });

        // Update the cache with the actual value and destroy function
        instance.value = result.value;
        instance.destroy = result.destroy;

        return instance.value;
    }

    // Called when Scribe unmounts or changes document
    destroy() {
        this.cache.forEach(instance => {
            if (instance.destroy) instance.destroy();
        });
        this.cache.clear();
        this.triggers = {};
    }

    getBindingsList(): { type: string; name: string }[] {
        return Object.entries(this.definitions).map(([type, def]) => ({
            type,
            name: def.name || type
        }));
    }

    getAvailableIds(type: string, supportedTypes?: string[]): { value: string; label: string; disabled?: boolean }[] {
        const def = this.definitions[type];
        if (def && def.getAvailableIds) {
            const allowedTypes = supportedTypes?.filter(t => t !== 'binding') || [];
            return def.getAvailableIds().map(item => {
                const disabled = item.type && allowedTypes.length > 0 ? !allowedTypes.includes(item.type) : false;
                return {
                    value: item.id,
                    label: item.label || item.id,
                    disabled
                };
            });
        }
        return [];
    }
}

export const customBindingsStore = new CustomBindingsStore();
