<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { MapComponent } from '../../domain/components/DefaultComponents.ts';
	import { fade } from 'svelte/transition';
	import MapLibreMap from '../utilComponents/MapLibreMap.svelte';
	import { editStore } from '$lib/stores/edit-store.svelte.js';
	import { untrack } from 'svelte';
	import { dataStore } from '$lib/stores/data-store.svelte.js';
	import { customBindingsStore } from '$lib/stores/custom-bindings-store.svelte.js';
	import type { DataValue } from '$lib/domain/data/DataValue.js';

    let { componentData, sectionId }: ScribeComponentProps<MapComponent> = $props();

    const value = $derived.by(() => {
        if (componentData.value.type === 'record') {
            const { latitude, longitude, address } = componentData.value.value;

            const lat = latitude && !isNaN(latitude.value as number) ? latitude.value as number : 0;
            const lng = longitude && !isNaN(longitude.value as number) ? longitude.value as number : 0;
            const addr = address && typeof address.value === 'string' ? address.value as string : '';

            return {
                lat,
                lng,
                address: addr,
            }
        } else if (componentData.value.type === 'binding' && componentData.value.valueType === 'record') {
            // NOTE: When handling bindings we need to verify that it is binded to a record with the correct structure
            let resolvedValue: DataValue | undefined;
            if (componentData.value.bindingType === undefined || componentData.value.bindingType === 'default') {
                resolvedValue = dataStore.data[componentData.value.value];
            } else {
                resolvedValue = customBindingsStore.getValue(componentData.value.bindingType, componentData.value.value);
            }

            if (resolvedValue && resolvedValue.type === 'record') {
                const { latitude, longitude, address } = resolvedValue.value as Record<string, DataValue>;

                const lat = latitude && !isNaN(latitude.value as number) ? latitude.value as number : 0;
                const lng = longitude && !isNaN(longitude.value as number) ? longitude.value as number : 0;
                const addr = address && typeof address.value === 'string' ? address.value as string : '';

                return {
                    lat,
                    lng,
                    address: addr,
                };
            }
        }
        
        throw new Error(`Invalid component data type for MapComponent: ${componentData.value.type}`);
    });
    const config = $derived(componentData.config);

    // Used to specify the value that was set internally
    // svelte-ignore state_referenced_locally
    let lastInternalValue = JSON.stringify(value);

    // This will force a re-render of the map when the value changes externally
    let mapKey = $state(0);

    $effect(() => {
        const currentValueStr = JSON.stringify(value);
        untrack(() => {
            if (currentValueStr !== lastInternalValue) {
                mapKey += 1;
                lastInternalValue = currentValueStr;
            }
        });
    });

    const onLocationChange = (newLocation: { lat: number; lng: number; address: string }) => {
        const newValue = {
            lat: newLocation.lat,
            lng: newLocation.lng,
            address: newLocation.address
        };
        // Sets the same value so that it doesn't trigger a re-render of the map
        lastInternalValue = JSON.stringify(newValue);

        editStore.setComponentValue(sectionId, componentData.id, {
            type: 'record',
            value: {
                latitude: { type: 'number', value: newLocation.lat },
                longitude: { type: 'number', value: newLocation.lng },
                address: { type: 'string', value: newLocation.address },
            }
        });
    };

</script>

<div class="map-container" in:fade>
    {#key mapKey}
        <MapLibreMap
            initialZoom={config?.initialZoom}
            initialPosition={config?.initialPosition || value}
            readonly={config?.readonly}
            hasSearchbar={config?.hasSearchbar}
            markerColor={config?.markerColor}
            hasCurrentPosBtn={config?.hasCurrentPosBtn}
            hasGlobeBtn={config?.hasGlobeBtn}
            hasZoomBtn={config?.hasZoomBtn}
            isMarkerDraggable={config?.isMarkerDraggable}
            location={value}
            onLocationSelect={onLocationChange}
        />
    {/key}
</div>

<style>
    .map-container {
        flex: 1;
        overflow: hidden;
        height: 400px;
        width: 100%;
        border-radius: var(--scribe-radius-2xl);
        padding: 0.5rem;
        align-items: center;
        display: flex;
        justify-content: center;
    }
</style>
