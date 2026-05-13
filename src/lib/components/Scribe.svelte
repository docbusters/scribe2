<svelte:options
	customElement={{
		tag: 'scribe-interpreter',
		props: {
			id: { type: 'String' },
			class: { type: 'String' },
			style: { type: 'String' },
			mode: { type: 'String' },
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
	import { dataStore } from '$lib/stores/data-store.svelte.js';
	import type { ScribeProps } from '$lib/types/ScribeProps.js';
	import Sortable from 'sortablejs';
	import type { Document } from '$lib/domain/Document.js';
	import { editStore } from '$lib/stores/edit-store.svelte.js';

	let { id, class: className = "", style, document, registry, mode = 'view' }: ScribeProps = $props();

	let loading = $state(true);
	let dataOrder = $state<HTMLElement>();
	let documentState = $state<Document<C>>(null!);

	$effect.pre(() => {
		// Initialize the global registry with the default components and any custom components provided via props
		globalRegistry.initialize({
			...defaultRegistry,
			...(registry || {})
		} as ComponentRegistry<C>);
			
		// If using edit mode, initialize the data store with the document's initial bindings
		if (mode === 'edit' && document) {
			editStore.initialize(document);
			documentState = document;
		} else {
			documentState = document;
		}

		loading = false;
	});

	$effect.pre(() => {
		if (document) {
			// Initialize the data store with the initial values from the document's components
			dataStore.initialize(document.bindings);
		}
	});

	// Sortable initialization
	$effect(() => {
		if (mode !== 'edit') return;
		if (!dataOrder) return;

		const instance = Sortable.create(dataOrder, {
            sort: true,
            direction: 'vertical',
            handle: '#edit-handle',
			animation: 200,
            ghostClass: 'bg-blue-100',

            onSort(event) {
                const { oldIndex, newIndex } = event;
                if (oldIndex === undefined || newIndex === undefined) return;
				editStore.moveSection(oldIndex, newIndex);
            },
		});

		return () => {
			if (instance) {
				instance.destroy();
			}
		};
	})
</script>

<div {id} class={`${className} scribe-document md:w-full`}>
	<div class="title-container">
		<h1>{documentState.title}</h1>
		<button onclick={() => console.log($state.snapshot(documentState))}>Print document</button>
	</div>
	<div {style} bind:this={dataOrder} class="scribe-sections">
		{#if !loading}
			{#each documentState.sections as section, index (index)}
				<Section data={section} {mode} />
			{/each}
		{/if}
	</div>
</div>

<style>
	.scribe-document {
		width: var(--scribe-doc-width-mobile);
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		box-sizing: border-box;
		background-color: var(--scribe-doc-background);
		font-family: var(--scribe-font-sans);
		font-weight: var(--scribe-font-weight-body);
		font-size: var(--scribe-font-size-body);
        color: var(--scribe-doc-foreground);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale; 
	}

	.scribe-document *,
	.scribe-document *::before,
	.scribe-document *::after {
		box-sizing: inherit;
	}

	.title-container {
		display: flex;
		gap: 2rem;
	}

	@media (width >= 48rem /* 768px */) {
		.scribe-document {
			width: var(--scribe-doc-width);
		}
	}

	:global(h1) {
		font-family: var(--scribe-font-heading);
		font-weight: var(--scribe-font-weight-h1);
		font-size: var(--scribe-font-size-h1);
		margin: 0;
	}
	:global(h2) {
		font-family: var(--scribe-font-heading);
		font-weight: var(--scribe-font-weight-h2);
		font-size: var(--scribe-font-size-h2);
		margin: 0;
	}
    :global(h3) {
        font-family: var(--scribe-font-heading);
		font-weight: var(--scribe-font-weight-h3);
		font-size: var(--scribe-font-size-h3);
		margin: 0;
    }
	:global(p) {
		margin: 0;
	}
	:global(span) {
		font-family: var(--scribe-font-sans);
		font-weight: var(--scribe-font-weight-body);
		font-size: var(--scribe-font-size-body);
	}

	.scribe-sections {
		width: 100%;
		display: flex;
		gap: var(--scribe-section-separation);
		flex-direction: column;
	}
</style>
