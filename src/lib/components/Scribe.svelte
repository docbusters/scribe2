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
			lang: { type: 'String' },
			showBindingsPanel: { type: 'Boolean' },
			showPrintButton: { type: 'Boolean' },
		}
	}}
/>

<script module lang="ts">
	// The stores are page-wide singletons, so a second mounted instance would overwrite the state of the first one
	let mountedInstances = 0;
</script>

<script lang="ts" generics="C extends BaseComponent<string, DataValue>">
	import type { ComponentRegistry } from '../registry/ComponentRegistry.js';
	import type { BaseComponent } from '../domain/components/Component.js';
	import type { DataValue } from '../domain/data/DataValue.js';
	import { getDefaultRegistry } from '../registry/defaultRegistry.js';
	import Section from './sections/Section.svelte';
	import { globalRegistry } from '../stores/global-registry.svelte.js';
	import { bindingStore } from '../stores/binding-store.svelte.ts';
	import { customBindingsStore } from '../stores/custom-bindings-store.svelte.js';
	import type { ScribeProps, CustomBinding } from '../types/ScribeProps.js';
	import { setContext, onDestroy, onMount } from 'svelte';
	import Sortable from 'sortablejs';
	import type { Document, BindingsDefinition } from '../domain/Document.js';
	import { editStore } from '../stores/edit-store.svelte.js';
	import { selectionStore } from '../stores/selection-store.svelte.js';
	import Button from './utilComponents/Button.svelte';
	import { parseStringForContentEditable } from '../utils/parseStringForContentEditable.js';
	import ComponentToolbar from './component/ComponentToolbar.svelte';
	import ComponentValueDialog from './component/ComponentValueDialog.svelte';
	import TopToolbar from './toolbar/TopToolbar.svelte';
	import DocumentTitle from './utilComponents/DocumentTitle.svelte';
	import BindingsFloatingPanel from './bindings/BindingsFloatingPanel.svelte';
	import { setI18n } from '../i18n/i18n.svelte.js';
	import { getAncestorChain, hasDarkClass } from '../utils/darkTheme.js';

	let { id, class: className = "", style, document, bindings, customBindings = {}, registry, mode = 'view', ondocumentchange, onbindingchange, lang = 'en', showBindingsPanel = true, showPrintButton = false }: ScribeProps = $props();

	// svelte-ignore state_referenced_locally
	const i18n = setI18n(lang);

	// Detect language changes
	$effect(() => {
		i18n.setLanguage(lang);
	});

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
	
	// Web component status of the root element
	$effect(() => {
		if (rootElement) {
			isWebComponent = !!rootElement.closest('scribe-interpreter');
		}
	});

	// Dark mode follows the rule of the CSS: a `.dark` on the root element or on any ancestor (`<html>`, a wrapper, the Scribe element)
	// themes Scribe, and it is kept up to date: `classList` is not reactive, so a MutationObserver watches the class attribute of each node
	// of the chain. It does not watch `<html>` with `subtree`, as Scribe itself toggles classes all the time (hover, selected) and the
	// observer would fire constantly. The `class` prop is on the root element in the Svelte case, so it is in the chain as well.
	// shortcut: the chain is read when the element mounts, so an element moved to another parent later keeps watching the old ancestors, remount it to refresh
	$effect(() => {
		if (!rootElement) return;

		const chain = getAncestorChain(rootElement);
		const update = () => {
			isDarkMode = hasDarkClass(chain);
		};
		update();

		const observer = new MutationObserver(update);
		for (const node of chain) {
			observer.observe(node as Element, { attributes: true, attributeFilter: ['class'] });
		}
		return () => observer.disconnect();
	});

	let computedClass = $derived(isWebComponent ? 'scribe-document' : `${className} scribe-document`);

	// EXPOSED METHODS

	export function getCustomBindingUsages() {
		return editStore.customBindingUsages;
	}

	export function refreshDocument(newDocument: Document<C>) {
		initialDocument = newDocument ? structuredClone($state.snapshot(newDocument)) as Document<C> : newDocument;
		selectionStore.clear();
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
		if (initialBindings) {
			bindingStore.initialize(initialBindings);
		}
	});

	$effect.pre(() => {
		if (initialCustomBindings) {
			customBindingsStore.initialize(initialCustomBindings);
		}
	});

	// Initialize the global registry with the default components and any custom components provided via props
	$effect.pre(() => {
		// Track lang to refresh component translations when language changes
		void lang;
		globalRegistry.initialize({
			...getDefaultRegistry(i18n),
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

	onMount(() => {
		mountedInstances++;
		if (mountedInstances > 1) {
			console.warn('[Scribe] More than one Scribe instance is mounted on this page. Scribe keeps its state in page-wide stores, so the instances will overwrite each other\'s document, bindings and registry. Use one Scribe per page.');
		}
		return () => {
			mountedInstances--;
		};
	});

	// Clean up custom bindings on destroy to avoid memory leaks
	onDestroy(() => {
		customBindingsStore.destroy();
		selectionStore.clear();
	});

	// Selection is cleared when what it refers to disappears (component deleted, merged into another text...)
	$effect(() => {
		const selected = selectionStore.selected;
		if (mode !== 'edit' || !selected) return;

		const sectionExists = !!editStore.document?.sections[selected.sectionId];
		// An insertion point holds the caret of a ghost or an empty text, so there is no component to look up
		if (!sectionExists || (selected.kind === 'component' && !editStore.getComponent(selected.sectionId, selected.componentId))) {
			selectionStore.clear();
		}
	});

	// Selectors of the areas that must keep the current selection when interacted with.
	// Inside a paragraph the selection is replaced by the text that receives the focus (a component or an insertion point),
	// so the interaction does not need to clear it first
	const KEEP_SELECTION_SELECTOR = '.component-edit-contents, .component-flow, .scribe-portal-target, .scribe-dropdown-content, .scribe-top-toolbar';

	/**
	 * Clears the selection when the interaction happens outside any component or selection-preserving area.
	 * The composed path is used instead of the event target, as the target is retargeted to the host element
	 * when Scribe is embedded inside another shadow root.
	 */
	function handleClearSelection(event: Event) {
		if (mode !== 'edit') return;
		const keepSelection = event.composedPath().some(node => node instanceof Element && node.matches(KEEP_SELECTION_SELECTOR));
		if (keepSelection) return;
		selectionStore.clear();
	}

	// Sortable initialization
	$effect(() => {
		if (mode !== 'edit') return;
		if (!dataOrder) return;

		const instance = Sortable.create(dataOrder, {
            sort: true,
            direction: 'vertical',
            handle: '.edit-handle',
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

</script>

<!-- Pointerdown is listened to on the whole document, so clicking anywhere outside the components clears the selection.
     It is handled in the capture phase, so the selection is cleared before inner handlers (such as focusing the closest text) can select a component -->
<svelte:document onpointerdowncapture={handleClearSelection} />

<div id={isWebComponent ? undefined : id} style={isWebComponent ? undefined : style} bind:this={rootElement} class={computedClass} onfocusin={handleClearSelection}>
	{#if mode === 'edit'}
		<TopToolbar />
	{/if}
	{#if mode === 'edit' && showPrintButton}
		<Button size="icon" style="max-width: fit-content; margin-left: auto;" variant="outline" title={i18n.t('editor.printDocument')} onclick={() => console.log($state.snapshot(documentState))}>
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scroll-text-icon lucide-scroll-text"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>
		</Button>
	{/if}
	{#if documentState}
		<DocumentTitle isEditMode={mode === 'edit'} text={title} />
		<div {style} bind:this={dataOrder} class="scribe-sections">
			{#if !loading}
				{#each sections as section (section.id)}
					<Section data={section} {mode} {isDarkMode} />
				{:else}
					{#if mode === 'edit'}
						<Button style="max-width: fit-content;" variant="outline" onclick={() => editStore.addSectionBelow(null, i18n.t('sections.defaultTitle'))}>
							{i18n.t('sections.addFirstSection')}
						</Button>
					{/if}
				{/each}
			{/if}
		</div>
	{/if}

	{#if mode === 'edit'}
		{#if showBindingsPanel}
			<BindingsFloatingPanel floating={true} />
		{/if}
		<ComponentToolbar />
		<ComponentValueDialog />
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
		position: relative;
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

	:global(.scribe-document h1:not(:where([data-scribe-host], [data-scribe-host] *))) {
		font-family: var(--scribe-font-heading);
		font-weight: var(--scribe-font-weight-h1);
		font-size: var(--scribe-font-size-h1);
		letter-spacing: -0.02em;
		line-height: 1.2;
		color: var(--scribe-doc-foreground);
		margin: 0;
	}
	:global(.scribe-document h2:not(:where([data-scribe-host], [data-scribe-host] *))) {
		font-family: var(--scribe-font-heading);
		font-weight: var(--scribe-font-weight-h2);
		font-size: var(--scribe-font-size-h2);
		letter-spacing: -0.01em;
		line-height: 1.3;
		color: var(--scribe-doc-foreground);
		margin: 0;
	}
    :global(.scribe-document h3:not(:where([data-scribe-host], [data-scribe-host] *))) {
        font-family: var(--scribe-font-heading);
		font-weight: var(--scribe-font-weight-h3);
		font-size: var(--scribe-font-size-h3);
		color: var(--scribe-doc-foreground);
		margin: 0;
    }
	:global(.scribe-document p:not(:where([data-scribe-host], [data-scribe-host] *))) {
		color: var(--scribe-doc-foreground);
		margin: 0;
	}
	:global(:where(.scribe-document) span:not(:where([data-scribe-host], [data-scribe-host] *))) {
		font-family: var(--scribe-font-sans);
		font-weight: var(--scribe-font-weight-body);
		font-size: var(--scribe-font-size-body);
		color: var(--scribe-doc-foreground);
	}

	.scribe-sections {
		width: 100%;
		display: flex;
		gap: var(--scribe-section-separation);
		flex-direction: column;
	}

	/* Dropdown Styles */

	:global(.scribe-dropdown-content) {
        width: 264px;
        max-height: min(var(--bits-dropdown-menu-content-available-height, 320px), 320px);
        padding: 0.375rem;
        background-color: var(--scribe-popover);
        color: var(--scribe-popover-foreground);
        border: 1px solid var(--scribe-border-color);
        border-radius: var(--scribe-radius-xl);
        box-shadow: var(--scribe-shadow-float);
        outline: none;
		/* Above the top toolbar, the section handles and the component editors, but below the bindings panel and dialogs */
		z-index: 30;
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
    }

    :global(.scribe-dropdown-content:focus-visible) {
        outline: none;
    }

    :global(.scribe-dropdown-item) {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.375rem 0.5rem;
        font-size: var(--scribe-font-size-sm);
        font-weight: var(--scribe-font-weight-medium);
        border-radius: var(--scribe-radius-md);
        user-select: none;
        outline: none !important;
        box-shadow: none !important;
        scroll-margin: 0.25rem;
        cursor: pointer;
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
