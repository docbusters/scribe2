<svelte:options
	customElement={{
		tag: 'scribe-interpreter',
		shadow: 'none',
		props: {
			id: { type: 'String' },
			class: { type: 'String' },
			style: { type: 'String' },
			mode: { type: 'String' },
			registry: { type: 'Object' },
			document: { type: 'Object' },
			bindings: { type: 'Object' },
			ondocumentchange: { type: 'Object' }
		}
	}}
/>

<script lang="ts" generics="C extends BaseComponent<string, DataValue> = never">
	import type { ComponentRegistry } from '../registry/ComponentRegistry.js';
	import type { BaseComponent } from '../domain/components/Component.js';
	import type { DataValue } from '../domain/data/DataValue.js';
	import { defaultRegistry } from '../registry/defaultRegistry.js';
	import Section from './sections/Section.svelte';
	import { globalRegistry } from '../stores/global-registry.svelte.js';
	import { dataStore } from '../stores/data-store.svelte.js';
	import { customBindingsStore } from '../stores/custom-bindings-store.svelte.js';
	import type { ScribeProps } from '../types/ScribeProps.js';
	import { setContext, onDestroy, untrack } from 'svelte';
	import Sortable from 'sortablejs';
	import type { Document } from '../domain/Document.js';
	import { editStore } from '../stores/edit-store.svelte.js';
	import Button from './utilComponents/Button.svelte';
	import { parseStringForContentEditable } from '../utils/parseStringForContentEditable.js';
	import TextFormatToolbar from './utilComponents/TextFormatToolbar.svelte';
	import ComponentToolbar from './component/ComponentToolbar.svelte';

	let { id, class: className = "", style, document, bindings, customBindings = {}, registry, mode = 'view' }: ScribeProps = $props();

	let portalTarget = $state<HTMLElement | null>(null);
	setContext('scribe-portal-target', () => portalTarget);

	let loading = $state(true);
	let rootElement = $state<HTMLElement | null>(null);
	let isInitialized = false;
	let dataOrder = $state<HTMLElement>();

	let documentState = $derived<Document<C>>(mode === 'edit' ? editStore.document as Document<C> : document);
	let sections = $derived(Object.values(documentState?.sections || {}));

	$effect.pre(() => {
		// We treat document as an initial value
		const doc = untrack(() => document)
		// Initialize the global registry with the default components and any custom components provided via props
		globalRegistry.initialize({
			...defaultRegistry,
			...(registry || {})
		} as ComponentRegistry<C>);
			
		// If using edit mode, initialize the data store with the document's initial bindings
		if (mode === 'edit' && doc) {
			editStore.initialize(doc, bindings || {});
		}

		loading = false;
	});

	$effect.pre(() => {
		if (bindings) {
			// Initialize the data store with the initial values from the document's components
			dataStore.initialize(bindings);
		}
		if (customBindings) {
			customBindingsStore.initialize(customBindings);
		}
	});

	// Clean up custom bindings on destroy to avoid memory leaks
	onDestroy(() => {
		customBindingsStore.destroy();
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
            ghostClass: 'sortable-ghost',
			dragClass: 'sortable-drag',

            onEnd(event) {
                const { oldIndex, newIndex } = event;
                if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return;

				editStore.moveSection(oldIndex, newIndex);
            },
		});

		return () => {
			if (instance) {
				instance.destroy();
			}
		};
	});

	// Notify change events to the consumer
	$effect(() => {
		// Omit customBindings since they contain functions which cannot be cloned by $state.snapshot
		const docSnapshot = $state.snapshot(documentState) as Document<never>;
		
		if (docSnapshot) {
			if (!isInitialized) {
				isInitialized = true;
				return;
			}
			
			// Dispatch native custom DOM event
			if (rootElement) {
				const host = rootElement.closest('scribe-interpreter');
				if (host) {
					host.dispatchEvent(new CustomEvent('documentchange', {
						detail: docSnapshot,
						bubbles: true,
						composed: true
					}));
				}
			}
		}
	});

	let title = $derived(parseStringForContentEditable(documentState.title));

	function handleTitleChange(event: Event & { currentTarget: EventTarget & HTMLDivElement; }) {
        const target = event.target as HTMLDivElement;
		console.log('New doc title value:', target.innerText);
        editStore.setDocumentTitle(target.innerText);
    }
</script>

<div {id} bind:this={rootElement} class={`${className} scribe-document`}>
	{#if mode === 'edit'}
		<Button variant="outline" onclick={() => console.log($state.snapshot(documentState))}>Print document (debugging)</Button>
	{/if}
	{#if documentState}
		<div class="title-container">
			{#key title}
				<h1 class="document-title" contenteditable={mode === 'edit'} onblur={handleTitleChange}>
					{#each title as line, index (index)}
						{#if line === ''}
							<br>
						{:else}
							{line}
						{/if}
					{/each}
				</h1>
			{/key}
		</div>
		<div {style} bind:this={dataOrder} class="scribe-sections">
			{#if !loading}
				{#each sections as section (section.id)}
					<Section data={section} {mode} />
				{:else}
					<Button variant="outline" onclick={() => editStore.addSectionBelow(null)}>
						Add first section
					</Button>
				{/each}
			{/if}
		</div>
	{/if}

	{#if mode === 'edit'}
		<ComponentToolbar />
		<TextFormatToolbar />
	{/if}
	<div bind:this={portalTarget} class="scribe-portal-target"></div>
</div>

<style>
	:global(.scribe-document .sortable-ghost) {
		opacity: 1;
		background-color: var(--scribe-selection-color) !important;
	}

	:global(.scribe-document .sortable-drag) {
		opacity: 0;
	}

	.scribe-document {
		width: 100%;
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
		display: inline;
	}

	.document-title {
		outline: none;
        display: inline;
	}

	:global(.scribe-document h1) {
		font-family: var(--scribe-font-heading);
		font-weight: var(--scribe-font-weight-h1);
		font-size: var(--scribe-font-size-h1);
		margin: 0;
	}
	:global(.scribe-document h2) {
		font-family: var(--scribe-font-heading);
		font-weight: var(--scribe-font-weight-h2);
		font-size: var(--scribe-font-size-h2);
		margin: 0;
	}
    :global(.scribe-document h3) {
        font-family: var(--scribe-font-heading);
		font-weight: var(--scribe-font-weight-h3);
		font-size: var(--scribe-font-size-h3);
		margin: 0;
    }
	:global(.scribe-document p) {
		margin: 0;
	}
	:global(.scribe-document span) {
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

	/* Dropdown Styles */

	:global(.scribe-dropdown-content) {
        width: 229px;
        padding: 0.375rem 0.25rem;
        background-color: var(--scribe-popover);
        border: 1px solid var(--scribe-border-color);
        border-radius: var(--scribe-radius-xl);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* shadow-popover */
        outline: none;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
    }

    :global(.scribe-dropdown-content:focus-visible) {
        outline: none;
    }

    :global(.scribe-dropdown-item) {
        display: flex;
        align-items: center;
        padding: 0.2rem 0.5rem;
        font-size: var(--scribe-font-size-sm);
        font-weight: var(--scribe-font-weight-medium);
        border-radius: var(--radius-button, 0.5rem);
        user-select: none;
        outline: none !important;
        box-shadow: none !important;
    }

    :global(.scribe-dropdown-item[data-highlighted]) {
        background-color: var(--scribe-muted);
    }

	

	/* Animations */
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	/* Apply the animation to a class, mimicking Tailwind's timing */
	:global(.scribe-animation-pulse) {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
