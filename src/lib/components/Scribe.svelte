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
			ondocumentchange: { type: 'Object' },
			onbindingchange: { type: 'Object' },
			customBindings: { type: 'Object' },
		}
	}}
/>

<script lang="ts" generics="C extends BaseComponent<string, DataValue>">
	import type { ComponentRegistry } from '../registry/ComponentRegistry.js';
	import type { BaseComponent } from '../domain/components/Component.js';
	import type { DataValue } from '../domain/data/DataValue.js';
	import { defaultRegistry } from '../registry/defaultRegistry.js';
	import Section from './sections/Section.svelte';
	import { globalRegistry } from '../stores/global-registry.svelte.js';
	import { bindingStore } from '../stores/binding-store.svelte.ts';
	import { customBindingsStore } from '../stores/custom-bindings-store.svelte.js';
	import type { ScribeProps, CustomBinding } from '../types/ScribeProps.js';
	import { setContext, onDestroy } from 'svelte';
	import Sortable from 'sortablejs';
	import type { Document, BindingsDefinition } from '../domain/Document.js';
	import { editStore } from '../stores/edit-store.svelte.js';
	import Button from './utilComponents/Button.svelte';
	import { parseStringForContentEditable } from '../utils/parseStringForContentEditable.js';
	import TextFormatToolbar from './utilComponents/TextFormatToolbar.svelte';
	import ComponentToolbar from './component/ComponentToolbar.svelte';

	let { id, class: className = "", style, document, bindings, customBindings = {}, registry, mode = 'view', ondocumentchange, onbindingchange }: ScribeProps = $props();

	// We clone document and bindings to completely isolate Scribe from external reactivity
	// They are kept in state so they can be refreshed externally via exposed methods
	// svelte-ignore state_referenced_locally
	let initialDocument = $state<Document<C>>(document ? structuredClone($state.snapshot(document)) : document);
	// svelte-ignore state_referenced_locally
	let initialBindings = $state(bindings ? structuredClone($state.snapshot(bindings)) : bindings);
	// svelte-ignore state_referenced_locally
	let initialCustomBindings = $state(customBindings);
	
	let isDarkMode = $state(false);
	let isWebComponent = $state(false);
	
	// We check for dark mode and web component status on the host element
	$effect(() => {
		if (rootElement) {
			const host = rootElement.closest('scribe-interpreter');
			if (host) {
				isWebComponent = true;
				isDarkMode = host.classList.contains('dark') || window.document.documentElement.classList.contains('dark');
			} else {
				isWebComponent = false;
				isDarkMode = className.includes('dark') || window.document.documentElement.classList.contains('dark');
			}
		}
	});

	let computedClass = $derived(isWebComponent ? 'scribe-document' : `${className} scribe-document`);

	// EXPOSED METHODS

	export function getCustomBindingUsages() {
		return editStore.customBindingUsages;
	}

	export function refreshDocument(newDocument: Document<C>) {
		initialDocument = newDocument ? structuredClone($state.snapshot(newDocument)) as Document<C> : newDocument;
	}

	export function refreshBindings(newBindings: Record<string, BindingsDefinition>) {
		initialBindings = newBindings ? structuredClone($state.snapshot(newBindings)) : newBindings;
		if (initialBindings) {
			bindingStore.initialize(initialBindings);
		}
	}

	export function refreshCustomBindings(newCustomBindings: Record<string, CustomBinding>) {
		initialCustomBindings = newCustomBindings;
		if (initialCustomBindings) {
			customBindingsStore.initialize(initialCustomBindings);
		}
	}

	let portalTarget = $state<HTMLElement | null>(null);
	setContext('scribe-portal-target', () => portalTarget);

	let loading = $state(true);
	let rootElement = $state<HTMLElement | null>(null);
	let isInitialized = false;
	let dataOrder = $state<HTMLElement>();

	let documentState = $derived<Document<C>>(mode === 'edit' ? editStore.document as Document<C> : initialDocument as Document<C>);
	let sections = $derived(Object.values(documentState?.sections || {}));

	// Initialize binding stores
	$effect.pre(() => {
		console.log('Initializing bindings with:', $state.snapshot(initialBindings));
		if (initialBindings) {
			bindingStore.initialize(initialBindings);
		}
	});

	$effect.pre(() => {
		console.log('Initializing custom bindings with:', $state.snapshot(initialCustomBindings));
		if (initialCustomBindings) {
			customBindingsStore.initialize(initialCustomBindings);
		}
	});

	// Initialize the global registry with the default components and any custom components provided via props
	$effect.pre(() => {
		globalRegistry.initialize({
			...defaultRegistry,
			...(registry || {})
		} as ComponentRegistry<C>);
	});


	// Initialize the edit store
	$effect.pre(() => {
		if (mode === 'edit' && initialDocument) {
			editStore.initialize(initialDocument as Document<C>, initialBindings || {});
		}
		loading = false;
	});

	// Subscribe to binding changes
	$effect(() => {
		const unsubscribe = bindingStore.subscribeToChanges((event) => {
			const bindingChangeEvent = new CustomEvent('bindingchange', {
				detail: event.detail,
				bubbles: true,
				composed: true
			});

			onbindingchange?.(bindingChangeEvent);
			
			const host = rootElement ? (rootElement.closest('scribe-interpreter') || rootElement) : null;
			if (host) {
				host.dispatchEvent(bindingChangeEvent);
			}
		});

		return () => {
			unsubscribe();
		};
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

			const documentChangeEvent = new CustomEvent('documentchange', {
				detail: docSnapshot,
				bubbles: true,
				composed: true
			});

			if (ondocumentchange) {
				ondocumentchange(documentChangeEvent);
			}

			// Dispatch native custom DOM event
			const host = rootElement ? (rootElement.closest('scribe-interpreter') || rootElement) : null;
			if (host) {
				host.dispatchEvent(documentChangeEvent);
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

<div id={isWebComponent ? undefined : id} style={isWebComponent ? undefined : style} bind:this={rootElement} class={computedClass}>
	{#if mode === 'edit'}
		<Button size="icon" style="max-width: fit-content; margin-left: auto;" variant="outline" title="Print document (debugging)" onclick={() => console.log($state.snapshot(documentState))}>
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scroll-text-icon lucide-scroll-text"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>
		</Button>
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
					<Section data={section} {mode} {isDarkMode} />
				{:else}
					{#if mode === 'edit'}
						<Button style="max-width: fit-content;" variant="outline" onclick={() => editStore.addSectionBelow(null)}>
							Add first section
						</Button>
					{/if}
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

	:global(.scribe-document *,
	.scribe-document *::before,
	.scribe-document *::after) {
		box-sizing: border-box;
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
