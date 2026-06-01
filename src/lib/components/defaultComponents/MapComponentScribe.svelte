<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { MapComponent } from '../../domain/components/DefaultComponents.ts';
	import { fade } from 'svelte/transition';
	import MapLibreMap from '../utilComponents/MapLibreMap.svelte';
	import { editStore } from '$lib/stores/edit-store.svelte.js';

    let { componentData, sectionId }: ScribeComponentProps<MapComponent> = $props();

    const value = $derived.by(() => {
        const { latitude, longitude, address } = componentData.value.value;

        if (isNaN(latitude.value as number) || isNaN(longitude.value as number)) {
            throw new Error('Latitude and Longitude must be valid numbers');
        }
        if (typeof address.value !== 'string' || address.value.trim() === '') {
            throw new Error('Address must be a non-empty string');
        }

        return {
            lat: latitude.value as number,
            lng: longitude.value as number,
            address: address.value as string,
        }
    });
    const config = $derived(componentData.config);

    const onLocationChange = (newLocation: { lat: number; lng: number; address: string }) => {
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
    <MapLibreMap
        initialZoom={config?.initialZoom}
        initialPosition={config?.initialPosition || value}
        readonly={config?.readonly}
        hasSearchbar={config?.hasSearchbar}
        markerColor={config?.markerColor}
        hasCurrentPosBtn={config?.hasCurrentPosBtn}
        hasGlobeBtn={config?.hasGlobeBtn}
        hasZoomBtn={config?.hasZoomBtn}
        location={value}
        onLocationSelect={onLocationChange}
        isMarkerDraggable
    />
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
