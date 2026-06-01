<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { MapComponent } from '../../domain/components/DefaultComponents.ts';
	import { fade } from 'svelte/transition';
	import MapLibreMap from '../utilComponents/MapLibreMap.svelte';
	import { editStore } from '$lib/stores/edit-store.svelte.js';

    let { componentData, sectionId }: ScribeComponentProps<MapComponent> = $props();

    const value = $derived.by(() => {
        const { latitude, longitude, address } = componentData.value.value;

        const lat = isNaN(latitude.value as number) ? 0 : latitude.value as number;
        const lng = isNaN(longitude.value as number) ? 0 : longitude.value as number;
        const addr = (typeof address.value !== 'string') ? '' : address.value as string;

        return {
            lat,
            lng,
            address: addr,
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
        isMarkerDraggable={config?.isMarkerDraggable}
        location={value}
        onLocationSelect={onLocationChange}
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
