import type { CustomBinding, CustomBindingSubscribable } from '$lib/types/ScribeProps.js';
import type { CollectionValue, DataValue, PrimitiveValue } from '../domain/data/DataValue.js';

interface CustomBindingInstance {
    value: PrimitiveValue | CollectionValue;
    destroy?: () => void;
}

class CustomBindingsStore {
    definitions: Record<string, CustomBinding> = {};
    
    // Stores data values in a non-reactive way to avoid state_unsafe_mutation errors
    private cache = new Map<string, CustomBindingInstance>();
    private pendingRequests = new Map<string, Promise<PrimitiveValue | CollectionValue>>();
    // Triggers used to notify Svelte of changes in a safe way (outside the render cycle)
    private triggers = $state<Record<string, number>>({});

    initialize(bindings: Record<string, CustomBinding> | undefined) {
        this.destroy(); // Clean previous bindings
        this.definitions = bindings || {};
    }

    /** Obtains a reactive value for a given binding type and ID */
    async getValue(bindingType: string, id: string): Promise<PrimitiveValue | CollectionValue> {
        const key = `${bindingType}:${id}`;
        
        // Read trigger to make Svelte subscribe to changes
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.triggers[key]; 

        // If the data already exists in the cache AND it's not pending, return it immediately
        if (this.cache.has(key) && !this.pendingRequests.has(key)) {
            return this.cache.get(key)!.value;
        }

        // If a request is already in progress, wait for it instead of returning a temporary value
        if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key)!;
        }

        const def = this.definitions[bindingType];
        if (!def) {
            throw new Error(`Custom binding definition '${bindingType}' not found.`);
        }

        const fetchPromise = (async () => {
            const instance: CustomBindingInstance = { value: { type: 'string', value: '' } };
            
            // Get the value or the subscribable object
            const result = await def.getData(id);
            const isSubscribable = result !== null && typeof result === 'object' && 'subscribe' in result;
            
            instance.value = isSubscribable 
                ? (result as CustomBindingSubscribable).value 
                : (result as PrimitiveValue | CollectionValue);

            if (isSubscribable) {
                const subscribable = result as CustomBindingSubscribable;
                instance.destroy = subscribable.subscribe((newValue) => {
                    instance.value = newValue; 
                    
                    // Create a microtask that updates the trigger in order to notify Svelte of the change without causing state_unsafe_mutation
                    queueMicrotask(() => {
                        this.triggers[key] = (this.triggers[key] || 0) + 1;
                    });
                });
            }

            this.cache.set(key, instance);
            return instance.value;
        })();

        this.pendingRequests.set(key, fetchPromise);

        try {
            return await fetchPromise;
        } finally {
            this.pendingRequests.delete(key);
        }
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

    getAvailableIds(type: string, supportedTypes?: Omit<DataValue['type'], 'binding'>[]): { value: string; label: string; disabled?: boolean; type: string }[] {
        const def = this.definitions[type];
        if (def && def.getAvailableIds) {
            const allowedTypes = supportedTypes?.filter(t => t !== 'binding') || [];
            return def.getAvailableIds().map(item => {
                const disabled = item.type && allowedTypes.length > 0 ? !allowedTypes.includes(item.type) : false;
                return {
                    value: item.id,
                    label: item.label || item.id,
                    disabled,
                    type: item.type
                };
            });
        }
        return [];
    }
}

export const customBindingsStore = new CustomBindingsStore();
