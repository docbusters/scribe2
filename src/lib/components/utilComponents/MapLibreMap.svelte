<script lang="ts">
	import {
		GeolocateControl,
		GlobeControl,
		MapLibre,
		Marker,
		NavigationControl
	} from 'svelte-maplibre-gl';
	import type { Map as MaplibreMap } from 'maplibre-gl';
	import Button from './Button.svelte';
	import { fade } from 'svelte/transition';
	import ScrollArea from './ScrollArea.svelte';
	import { geocodingApi, reverseGeocodingApi, type GeocodingResult } from '$lib/api/geocoding.js';

	export interface MapSelectorProps {
		isMarkerDraggable?: boolean;
		class?: string;
		onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
		hasSearchbar?: boolean;
		markerColor?: string;
		hasGlobeBtn?: boolean;
		hasZoomBtn?: boolean;
		hasCurrentPosBtn?: boolean;
		isLoading?: boolean;
		initialZoom?: number;
		initialPosition?: {
			lat: number;
			lng: number;
		};
		readonly?: boolean;
		location?: {
			lat: number;
			lng: number;
			address: string;
		};
	}

	let {
		isMarkerDraggable = false,
		hasSearchbar = false,
		class: className,
		location = $bindable(),
		markerColor = '#277ee8',
		hasGlobeBtn = false,
		hasZoomBtn = false,
		hasCurrentPosBtn = false,
		isLoading = $bindable(false),
		initialZoom = 14,
		initialPosition = { lat: 38.02383085987818, lng: -1.173557484002349 },
		readonly = false,
		onLocationSelect,
	}: MapSelectorProps = $props();

	let map = $state<MaplibreMap | undefined>();

	let searchBarValue = $state<string>(location?.address || '');
	let pinCoords = $state<{ lat: number; lng: number } | null>(location ? { lat: location.lat, lng: location.lng } : null);
	let searchBarResults = $state<GeocodingResult[] | null>(null);
	const isSearchDisabled = $derived<boolean>(searchBarValue.trim() === '' || searchBarValue === location?.address || readonly);
	// svelte-ignore state_referenced_locally
	// Note: We dont want to reset the map center when the location changes, only on initial load, so we use a separate variable for that
	// This is necessary because initialPosition may change when the location changes, but we dont want to reset the map center in that case
	const center = initialPosition;

	async function handleMapAddMarkerInteraction(e: {lngLat: { lat: number; lng: number }}) {
		if (readonly) return;
		const { lng, lat } = e.lngLat;
		pinCoords = { lng, lat };
		moveMapCamera(lat, lng);
		const success = await getLocationInfo(lat, lng);
		if (success) {
			location = { lat, lng, address: searchBarValue };
		}
	}

	async function onMarkerDragEnd() {
		if (!pinCoords || readonly) return;
		moveMapCamera(pinCoords.lat, pinCoords.lng);
		const success = await getLocationInfo(pinCoords.lat, pinCoords.lng);
		if (success) {
			location = { lat: pinCoords.lat, lng: pinCoords.lng, address: searchBarValue };
		}
	}

	async function moveMapCamera(lat: number, lng: number, zoom: number = 16) {
		map?.flyTo({
			center: [lng, lat],
			zoom,
			essential: true
		});
	}

	async function onUserSearchAddress() {
		if (isSearchDisabled) return;
		isLoading = true;
		const result = await geocodingApi(searchBarValue, 'en_US');

		if (result.status === 200 && result.data) {
			searchBarResults = result.data;
		} else {
			console.error("Could not fetch geocoding results");
		}
		isLoading = false;
	}

	// Search functions
	function onSelectSearchResult(result: GeocodingResult) {
		const lng = parseFloat(result.lon);
		const lat = parseFloat(result.lat);
		pinCoords = { lng, lat };
		moveMapCamera(lat, lng);
		searchBarValue = result.formatted_address;
		searchBarResults = null;
		onLocationSelect?.({ lat, lng, address: searchBarValue });
		location = { lat, lng, address: searchBarValue };
	}

	async function getLocationInfo(lat: number, lng: number) {
		isLoading = true;
		const result = await reverseGeocodingApi(lat, lng, 'en_US');

		if (result.status === 200 && result.data) {
			searchBarValue = result.data.formatted_address;
			searchBarResults = null;
			isLoading = false;
			onLocationSelect?.({ lat, lng, address: searchBarValue });
			location = { lat, lng, address: searchBarValue };
			return true;
		}
		
        console.error("Could not fetch reverse geocoding results");
		pinCoords = null; // Reset marker position if reverse geocoding fails
		isLoading = false;
		location = undefined;

		return false;
	}
</script>

<div
	class="map-wrapper {className || ''}"
>
	<MapLibre
		zoom={initialZoom}
		{center}
		bind:map
        inlineStyle="height: 100%; width: 100%;"
		style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
		doubleClickZoom={false}
		ondblclick={(e) => handleMapAddMarkerInteraction(e)}
	>
		{#if hasZoomBtn}
			<NavigationControl position="bottom-right" showCompass={false} />
		{/if}
		{#if hasGlobeBtn}
			<GlobeControl position="bottom-left" />
		{/if}
		{#if hasCurrentPosBtn}
			<GeolocateControl
				position="bottom-left"
				positionOptions={{ enableHighAccuracy: true }}
				trackUserLocation={true}
				showAccuracyCircle={true}
			/>
		{/if}
		{#if pinCoords}
			<Marker bind:lnglat={pinCoords} draggable={isMarkerDraggable && !readonly} ondragend={onMarkerDragEnd}>
				{#snippet content()}
					<div class="marker-content">
						{#if isLoading}
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="marker-loading lucide lucide-loader-circle-icon lucide-loader-circle"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={markerColor} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin-icon lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
						{/if}
					</div>
				{/snippet}
			</Marker>
		{/if}
	</MapLibre>

	{#if hasSearchbar}
		<!-- Search Bar -->
		<div class="search-wrapper">
			<div class="search-input-container">
				{#if readonly}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pinned-icon lucide-map-pinned"><path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0"/><circle cx="12" cy="8" r="2"/><path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712"/></svg>
                {:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
				{/if}
				<input
					id="map-search"
					data-testid="map-search-input"
					disabled={readonly}
					bind:value={searchBarValue}
					placeholder={readonly ? "No address selected" : "Search for an address..."}
					class="search-input"
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							onUserSearchAddress()
						}
					}}
				/>
			</div>
			{#if !readonly}
				<Button
					disabled={isSearchDisabled}
					loading={isLoading}
					size="icon"
					style="border-radius: 100%;"
					data-testid="map-search-btn"
					onclick={onUserSearchAddress}
				>
                    {#if !isLoading}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right-icon lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    {/if}
                </Button>
			{/if}
		</div>

		<!-- Search Results -->
		{#if searchBarResults !== null}
			<div class="search-results-wrapper" in:fade out:fade>
				<ScrollArea orientation="vertical" class="scribe-map-scroll-area-container">
					<div class="search-results-list">
						{#each searchBarResults as result, index (index)}
							<Button data-testid={`search-result-${index}`} variant="ghost" class="search-result-btn" onclick={() => onSelectSearchResult(result)}>
								<span class="search-result-text">
									{result.formatted_address}
								</span>
							</Button>
						{:else}
							No results found
						{/each}
					</div>
				</ScrollArea>
			</div>
		{/if}
	{/if}
</div>

<style>
	.map-wrapper {
		position: relative;
		background-color: var(--scribe-doc-background);
		border-color: var(--scribe-border-color);
		height: 100%;
		width: 100%;
		overflow: hidden;
		border-radius: var(--scribe-radius-xl);
		border-width: 2px;
		border-style: solid;
	}

	.marker-content {
		border-radius: 100%;
		padding: 0.5rem;
		background-color: var(--scribe-doc-background);
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
		border: 1px solid var(--scribe-border-color);
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

    .marker-loading {
        animation: spin 1s linear infinite;
        color: var(--scribe-muted-foreground);
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

	.search-wrapper {
		position: absolute;
		top: 1rem;
		right: 1.25rem;
		left: 1.25rem;
		display: flex;
		height: 2.5rem;
		align-items: center;
		gap: 0.75rem;
	}

	.search-input-container {
		border-color: var(--scribe-border-color);
		background-color: var(--scribe-secondary);
		display: flex;
		height: 100%;
		width: 100%;
		align-items: center;
		gap: 0.75rem;
		border-radius: 100px;
		border-width: 1px;
		border-style: solid;
		padding-left: 0.75rem;
		padding-right: 0.75rem;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	}

	.search-input {
		color: var(--scribe-secondary-foreground);
		height: 100%;
		width: 100%;
		font-size: var(--scribe-font-size-md);
		font-family: var(--scribe-font-sans);
		line-height: 1.5rem;
		outline: 2px solid transparent;
		outline-offset: 2px;
		background: transparent;
		border: none;
	}

	.search-results-wrapper {
		position: absolute;
		top: 4rem;
		right: 4.25rem;
		left: 1.25rem;
		bottom: 25%;
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		pointer-events: none;
	}

	:global(.scribe-map-scroll-area-container) {
		pointer-events: auto;
		border-color: var(--scribe-border-color);
		background-color: var(--scribe-secondary);
		display: flex;
		flex-direction: column;
		max-height: 100%;
		width: 100%;
		border-radius: var(--scribe-radius-md);
		border-width: 1px;
		border-style: solid;
		padding: 0.25rem;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	}

	.search-results-list {
		flex: 1 1 0%;
		height: fit-content;
		padding-right: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.search-result-btn {
		width: 100%;
		font-weight: var(--scribe-font-weight-regular);
	}

	.search-result-text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
