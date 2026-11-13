<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { bindingStore } from '$lib/stores/binding-store.svelte.js';
	import { editStore } from '$lib/stores/edit-store.svelte.js';
	import ScrollArea from '../utilComponents/ScrollArea.svelte';
	import Button from '../utilComponents/Button.svelte';
	import TypeIcon from '../utilComponents/TypeIcon.svelte';
	import BindingItemCard from './BindingItemCard.svelte';
	import AddBindingDialog from './AddBindingDialog.svelte';
	import { getI18n } from '$lib/i18n/i18n.svelte.js';
	import { getTypeLabel, groupByType, isListedBinding } from '$lib/utils/dataTypes.js';
	import type { BindingsPanelProps } from '$lib/types/BindingsPanelProps.js';

	let {
		class: className = '',
		style = '',
		floating = false,
		isExpanded = $bindable(true),
		collapsible = true,
		lang
	}: BindingsPanelProps = $props();

	const i18n = getI18n();

	$effect(() => {
		if (lang) {
			i18n.setLanguage(lang);
		}
	});

	// On a phone the floating panel would cover the document, so it starts folded into its chip
	onMount(() => {
		if (floating && collapsible && matchMedia('(max-width: 640px)').matches) {
			isExpanded = false;
		}
	});

	let searchQuery = $state('');
	let isAddModalOpen = $state(false);
	// Types whose group the user has folded. A search opens every group, so no result is hidden.
	const foldedTypes = new SvelteSet<string>();

	// Reactive list of default bindings
	const bindingsList = $derived.by(() => {
		return Object.entries(bindingStore.data)
			.filter(([id, val]) => isListedBinding(id, val))
			.map(([id, val]) => ({
				id,
				type: val.type,
				value: val.value
			}));
	});

	const isSearching = $derived(searchQuery.trim() !== '');

	// Filtered list based on search query, by name or by type
	const filteredBindings = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return bindingsList;
		return bindingsList.filter(
			(b) =>
				b.id.toLowerCase().includes(q) ||
				b.type.toLowerCase().includes(q) ||
				getTypeLabel(i18n, b.type).toLowerCase().includes(q)
		);
	});

	const groups = $derived(groupByType(filteredBindings));

	function isOpen(type: string): boolean {
		return isSearching || !foldedTypes.has(type);
	}

	function toggleGroup(type: string) {
		if (foldedTypes.has(type)) foldedTypes.delete(type);
		else foldedTypes.add(type);
	}

	function handleDeleteBinding(id: string) {
		editStore.deleteBinding(id);
	}
</script>

<div class="scribe-bindings-panel-root {floating ? 'is-floating' : ''} {className}" {style}>
	{#if collapsible && !isExpanded}
		<button
			type="button"
			class="scribe-bindings-collapsed-chip"
			onclick={() => (isExpanded = true)}
			title={i18n.t('bindingsPanel.expandTooltip')}
		>
			<TypeIcon type="binding" size={14} />
			<span class="chip-label">{i18n.t('bindingsPanel.title')}</span>
			<span class="scribe-count">{bindingsList.length}</span>
		</button>
	{:else}
		<aside class="scribe-bindings-panel" aria-label={i18n.t('bindingsPanel.title')}>
			<header class="panel-header">
				<div class="header-left">
					<span class="header-icon"><TypeIcon type="binding" size={15} /></span>
					<h3 class="panel-title scribe-caps-label">{i18n.t('bindingsPanel.title')}</h3>
					<span class="scribe-count">{bindingsList.length}</span>
				</div>

				<div class="header-right">
					<Button
						size="icon-sm"
						variant="ghost"
						title={i18n.t('bindingsPanel.newVariable')}
						aria-label={i18n.t('bindingsPanel.newVariable')}
						onclick={() => (isAddModalOpen = true)}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
					</Button>

					{#if collapsible}
						<Button
							size="icon-sm"
							variant="ghost"
							title={i18n.t('bindingsPanel.collapseTooltip')}
							aria-label={i18n.t('bindingsPanel.collapseTooltip')}
							onclick={() => (isExpanded = false)}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
						</Button>
					{/if}
				</div>
			</header>

			<div class="search-container">
				<div class="search-input-wrapper">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
					<input
						type="text"
						class="search-field"
						placeholder={i18n.t('bindingsPanel.filterPlaceholder')}
						aria-label={i18n.t('bindingsPanel.filterPlaceholder')}
						bind:value={searchQuery}
					/>
					{#if searchQuery}
						<button
							type="button"
							class="clear-btn"
							onclick={() => (searchQuery = '')}
							title={i18n.t('bindingSelector.clearSearch')}
							aria-label={i18n.t('bindingSelector.clearSearch')}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
						</button>
					{/if}
				</div>
			</div>

			<ScrollArea orientation="vertical" class="bindings-scrollarea" viewportClasses="bindings-viewport">
				<div class="groups-list">
					{#if groups.length === 0}
						<div class="empty-state">
							{#if isSearching}
								{i18n.t('bindingsPanel.noFilterResults', { query: searchQuery })}
							{:else}
								{i18n.t('bindingsPanel.noBindings')}
							{/if}
						</div>
					{:else}
						{#each groups as group (group.type)}
							<section class="group">
								<button
									type="button"
									class="group-header"
									aria-expanded={isOpen(group.type)}
									aria-controls="scribe-binding-group-{group.type}"
									onclick={() => toggleGroup(group.type)}
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-chevron" class:is-open={isOpen(group.type)} aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
									<span class="scribe-tile" data-size="sm" data-type={group.type}><TypeIcon type={group.type} /></span>
									<span class="group-label">{getTypeLabel(i18n, group.type)}</span>
									<span class="scribe-count">{group.items.length}</span>
								</button>

								{#if isOpen(group.type)}
									<div class="group-rows" id="scribe-binding-group-{group.type}">
										{#each group.items as b (b.id)}
											<BindingItemCard id={b.id} type={b.type} value={b.value} ondelete={handleDeleteBinding} />
										{/each}
									</div>
								{/if}
							</section>
						{/each}
					{/if}
				</div>
			</ScrollArea>
		</aside>
	{/if}

	<!-- Add Binding Modal -->
	<AddBindingDialog bind:open={isAddModalOpen} />
</div>

<style>
	.scribe-bindings-panel-root {
		font-family: var(--scribe-font-sans);
		box-sizing: border-box;
	}

	.scribe-bindings-panel-root.is-floating {
		position: fixed;
		top: 1.25rem;
		right: 1.25rem;
		z-index: 40;
	}

	.scribe-bindings-panel-root:not(.is-floating) {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}

	/* Collapsed chip */
	.scribe-bindings-collapsed-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		height: 2.25rem;
		padding: 0 0.625rem 0 0.75rem;
		background-color: var(--scribe-popover);
		color: var(--scribe-popover-foreground);
		border: 1px solid var(--scribe-border-color);
		border-radius: 9999px;
		box-shadow: var(--scribe-shadow-float);
		cursor: pointer;
		font-family: var(--scribe-font-sans);
		font-size: var(--scribe-font-size-sm);
		font-weight: var(--scribe-font-weight-semibold);
		transition: background-color 150ms ease-out;
	}

	.scribe-bindings-collapsed-chip:hover {
		background-color: var(--scribe-muted);
	}

	.chip-label {
		letter-spacing: -0.01em;
	}

	/* Expanded panel */
	.scribe-bindings-panel {
		width: 340px;
		max-width: calc(100vw - 2.5rem);
		max-height: calc(100vh - 2.5rem);
		display: flex;
		flex-direction: column;
		background-color: var(--scribe-popover);
		color: var(--scribe-popover-foreground);
		border: 1px solid var(--scribe-border-color);
		border-radius: var(--scribe-radius-xl);
		overflow: hidden;
	}

	.is-floating .scribe-bindings-panel {
		box-shadow: var(--scribe-shadow-float);
	}

	.scribe-bindings-panel-root:not(.is-floating) .scribe-bindings-panel {
		width: 100%;
		max-width: none;
		height: 100%;
		max-height: 100%;
		min-height: 0;
		flex: 1 1 auto;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.75rem 0.75rem 0.5rem 1rem;
		flex-shrink: 0;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}

	.header-icon {
		display: flex;
		color: var(--scribe-muted-foreground);
	}

	.panel-title {
		margin: 0;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.125rem;
	}

	/* Search */
	.search-container {
		padding: 0.25rem 0.75rem 0.75rem;
		flex-shrink: 0;
	}

	.search-input-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		height: 2.125rem;
		padding: 0 0.5rem 0 0.625rem;
		background-color: var(--scribe-section-background);
		border: 1px solid var(--scribe-border-strong);
		border-radius: var(--scribe-radius-md);
		transition: border-color 150ms ease-out;
	}

	.search-input-wrapper:focus-within {
		border-color: var(--scribe-accent);
		outline: 1px solid var(--scribe-accent);
	}

	.search-icon {
		color: var(--scribe-muted-foreground);
		flex-shrink: 0;
	}

	.search-field {
		flex: 1;
		min-width: 0;
		border: none;
		outline: none;
		background: transparent;
		font-family: var(--scribe-font-sans);
		font-size: var(--scribe-font-size-sm);
		color: var(--scribe-doc-foreground);
	}

	.search-field.search-field:focus-visible {
		outline: none;
	}

	.search-field::placeholder {
		color: var(--scribe-muted-foreground);
	}

	.clear-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		border: none;
		background: transparent;
		color: var(--scribe-muted-foreground);
		cursor: pointer;
		border-radius: 9999px;
	}

	.clear-btn:hover {
		color: var(--scribe-doc-foreground);
		background-color: var(--scribe-muted);
	}

	/* List & ScrollArea */
	:global(.bindings-scrollarea) {
		flex: 1 1 auto;
		min-height: 0;
		width: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--scribe-border-color);
	}

	:global(.bindings-viewport) {
		width: 100%;
		height: 100%;
		min-height: 0;
		flex: 1 1 auto;
	}

	.groups-list {
		padding: 0.5rem 0.5rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.group-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.375rem 0.5rem;
		border: none;
		border-radius: var(--scribe-radius-md);
		background: transparent;
		color: var(--scribe-popover-foreground);
		font-family: var(--scribe-font-sans);
		cursor: pointer;
		text-align: left;
		transition: background-color 150ms ease-out;
	}

	.group-header:hover {
		background-color: var(--scribe-muted);
	}

	.group-chevron {
		flex: none;
		color: var(--scribe-muted-foreground);
		transition: transform 150ms ease-out;
	}

	.group-chevron.is-open {
		transform: rotate(90deg);
	}

	.group-label {
		flex: 1;
		min-width: 0;
		font-size: var(--scribe-font-size-sm);
		font-weight: var(--scribe-font-weight-semibold);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.group-rows {
		display: flex;
		flex-direction: column;
		padding: 0 0 0.5rem;
	}

	/* A phone: the panel is a sheet at the bottom, so the document stays visible above it */
	@media (max-width: 640px) {
		.scribe-bindings-panel-root.is-floating {
			left: 0.75rem;
			right: 0.75rem;
			top: auto;
			bottom: 0.75rem;
		}

		.is-floating .scribe-bindings-panel {
			width: 100%;
			max-width: none;
			max-height: 60vh;
		}
	}

	.empty-state {
		margin: 0.5rem 0.25rem;
		text-align: center;
		padding: 1.75rem 1rem;
		color: var(--scribe-muted-foreground);
		background-color: var(--scribe-muted);
		border: 1px dashed var(--scribe-border-strong);
		border-radius: var(--scribe-radius-lg);
		font-size: var(--scribe-font-size-sm);
		line-height: 1.5;
	}
</style>
