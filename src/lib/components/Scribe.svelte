<svelte:options
	customElement={{
		tag: 'scribe-interpreter',
		props: {
			id: { type: 'String' },
			class: { type: 'String' },
			style: { type: 'String' },
			registry: { type: 'Object' },
			document: { type: 'Object' }
		}
	}}
/>

<script lang="ts" generics="C extends BaseComponent<string, DataValue> = never">
	import type { ComponentRegistry } from '../registry/ComponentRegistry.js';
	import type { BaseComponent } from '../domain/components/Component.js';
	import type { DataValue } from '../domain/data/DataValue.js';
	import { defaultRegistry } from '../registry/defaultRegistry.js';
	import Section from './sections/Section.svelte';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import { DEFAULT_SECTION_SEPARATION } from '$lib/constants/DocumentConstants.js';
	import { dataStore } from '$lib/stores/data-store.svelte.js';
	import type { ScribeProps } from '$lib/types/ScribeProps.js';

	let { id, class: className = "", style, document, registry }: ScribeProps = $props();

	$effect.pre(() => {
		// Initialize the global registry with the default components and any custom components provided via props
		globalRegistry.initialize({
			...defaultRegistry,
			...(registry || {})
		} as ComponentRegistry<C>);
	});

	$effect.pre(() => {
		if (document) {
			// Initialize the data store with the initial values from the document's components
			dataStore.initialize(document.bindings);
		}
	});

	const documentStyle = $derived.by(() => {
		const separation = document.sectionSeparation ?? DEFAULT_SECTION_SEPARATION;
		return `gap: ${separation}px;`;
	});
</script>

{#if document}
	<div {id} class={`${className} scribe-document`}>
		<h1>{document.title}</h1>
		<div style={`${documentStyle} ${style}`} class="scribe-sections">
			{#each document.sections as section, index (index)}
				<Section data={section} />
			{/each}
		</div>
	</div>
{/if}

<style>
	.scribe-document {
		width: 100%;
		display: flex;
		flex-direction: column;
		background-color: var(--scribe-background);
		font-family: var(--scribe-font-sans);
        color: var(--scribe-foreground);
	}

	:global(h1) {
		font-family: var(--scribe-font-heading);
	}
	:global(h2) {
		font-family: var(--scribe-font-heading);
	}
    :global(h3) {
        font-family: var(--scribe-font-heading);
    }

	.scribe-sections {
		width: 100%;
		display: flex;
		flex-direction: column;
	}
</style>
