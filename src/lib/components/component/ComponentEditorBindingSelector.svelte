<script lang="ts">
	import { bindingStore } from '$lib/stores/binding-store.svelte.js';
	import { customBindingsStore } from '$lib/stores/custom-bindings-store.svelte.js';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import { stringifyDataValue } from '$lib/utils/stringifyDataValue.js';
	import { truncateString } from '$lib/utils/truncateString.js';
	import type { DataValue } from '$lib/domain/data/DataValue.js';
	import { getI18n } from '$lib/i18n/i18n.svelte.js';
	import { getTypeLabel, isListedBinding } from '$lib/utils/dataTypes.js';
	import TypeIcon from '../utilComponents/TypeIcon.svelte';

	interface ComponentEditorBindingSelectorProps {
		bindingType?: string;
		componentType?: string;
		value?: string;
		onselect?: (id: string) => void;
	}

	let {
		bindingType = 'default',
		componentType = '',
		value = $bindable(''),
		onselect
	}: ComponentEditorBindingSelectorProps = $props();

	const i18n = getI18n();

	let searchQuery = $state('');
	let customPreviewValues = $state<Record<string, string>>({});
	let loadingIds = $state<Record<string, boolean>>({});

	// Determine supported data types for this component
	const supportedTypes = $derived.by<Omit<DataValue['type'], 'binding'>[] | undefined>(() => {
		if (!componentType) return undefined;
		try {
			return globalRegistry.getComponentSupportedBindingValueTypes(componentType);
		} catch {
			return undefined;
		}
	});

	interface BindingItem {
		id: string;
		title: string;
		type: string;
		valuePreview: string;
		disabled: boolean;
		isLoading?: boolean;
	}

	// Fetch or update async values for custom bindings
	$effect(() => {
		if (bindingType !== 'default') {
			const ids = customBindingsStore.getAvailableIds(bindingType, supportedTypes);
			for (const item of ids) {
				if (customPreviewValues[item.value] === undefined && !loadingIds[item.value]) {
					loadingIds[item.value] = true;
					customBindingsStore
						.getValue(bindingType, item.value)
						.then((resolved) => {
							try {
								customPreviewValues[item.value] = stringifyDataValue(resolved);
							} catch {
								customPreviewValues[item.value] = String(resolved?.value ?? '');
							}
						})
						.catch(() => {
							customPreviewValues[item.value] = i18n.t('common.unavailable');
						})
						.finally(() => {
							loadingIds[item.value] = false;
						});
				}
			}
		}
	});

	// Derive the list of all available binding items
	const items = $derived.by<BindingItem[]>(() => {
		if (bindingType === 'default') {
			return Object.entries(bindingStore.data).filter(([id, dataVal]) => isListedBinding(id, dataVal)).map(([id, dataVal]) => {
				const isSupported = !supportedTypes || supportedTypes.includes(dataVal.type);
				let preview: string;
				try {
					preview = stringifyDataValue(dataVal);
				} catch {
					preview = String(dataVal?.value ?? '');
				}

				return {
					id,
					title: id,
					type: dataVal.type,
					valuePreview: preview,
					disabled: !isSupported
				};
			});
		}

		// Custom bindings
		const availableIds = customBindingsStore.getAvailableIds(bindingType, supportedTypes);
		return availableIds.map((item) => {
			const preview = customPreviewValues[item.value] ?? (loadingIds[item.value] ? i18n.t('common.loading') : '');
			return {
				id: item.value,
				title: item.label || item.value,
				type: item.type || 'unknown',
				valuePreview: preview,
				disabled: !!item.disabled,
				isLoading: !!loadingIds[item.value]
			};
		});
	});

	// Filter items based on the search query
	const filteredItems = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return items;
		return items.filter(
			(item) =>
				item.title.toLowerCase().includes(query) ||
				item.id.toLowerCase().includes(query) ||
				item.valuePreview.toLowerCase().includes(query) ||
				item.type.toLowerCase().includes(query)
		);
	});

	function handleSelect(item: BindingItem) {
		if (item.disabled) return;
		value = item.id;
		onselect?.(item.id);
	}
</script>

<div class="binding-selector-root">
	<div class="search-box">
		<div class="search-field-wrapper">
			<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
			<input
				type="text"
				class="search-input"
				placeholder={i18n.t('bindingSelector.searchPlaceholder')}
				aria-label={i18n.t('bindingSelector.searchPlaceholder')}
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
					<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
				</button>
			{/if}
		</div>
	</div>

	{#if filteredItems.length === 0}
		<div class="empty-state">
			{#if searchQuery}
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="empty-icon" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="m13.5 8.5-5 5" /></svg>
				<p class="empty-title">{i18n.t('bindingSelector.noMatchTitle')}</p>
				<p class="empty-subtitle">{i18n.t('bindingSelector.noMatchSubtitle')}</p>
			{:else}
				<span class="empty-icon"><TypeIcon type="binding" size={24} /></span>
				<p class="empty-title">{i18n.t('bindingSelector.emptyTitle')}</p>
				<p class="empty-subtitle">
					{componentType
						? i18n.t('bindingSelector.emptySubtitleComponent')
						: i18n.t('bindingSelector.emptySubtitleDocument')}
				</p>
			{/if}
		</div>
	{:else}
		<div class="items-list">
			{#each filteredItems as item (item.id)}
				{@const isSelected = value === item.id}
				<button
					type="button"
					class="binding-row"
					class:selected={isSelected}
					disabled={item.disabled}
					aria-pressed={isSelected}
					onclick={() => handleSelect(item)}
					title={item.disabled ? i18n.t('bindingSelector.incompatibleTooltip') : item.title}
				>
					<span class="scribe-tile" data-size="sm" data-type={item.type}><TypeIcon type={item.type} /></span>

					<span class="row-main">
						<span class="row-title" title={item.title}>{item.title}</span>
						{#if item.isLoading}
							<span class="row-preview is-muted">{i18n.t('common.loading')}</span>
						{:else if item.valuePreview !== ''}
							<span class="row-preview" title={item.valuePreview}>{truncateString(item.valuePreview, 60)}</span>
						{:else}
							<span class="row-preview is-muted">{i18n.t('common.empty')}</span>
						{/if}
					</span>

					{#if item.disabled}
						<span class="scribe-pill">{i18n.t('common.incompatible')}</span>
					{:else if item.type}
						<span class="scribe-pill" data-type={item.type}>{getTypeLabel(i18n, item.type)}</span>
					{/if}

					<span class="scribe-check" class:is-checked={isSelected} aria-hidden="true">
						{#if isSelected}
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
						{/if}
					</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.binding-selector-root {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
	}

	/* Stays in view while the list scrolls */
	.search-box {
		position: sticky;
		top: 0;
		z-index: 5;
		background-color: var(--scribe-popover);
		padding: 0.125rem 0 0.25rem;
	}

	.search-field-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
	}

	.search-icon {
		position: absolute;
		left: 0.75rem;
		color: var(--scribe-muted-foreground);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		height: 2.375rem;
		padding: 0 2rem 0 2.25rem;
		font-family: var(--scribe-font-sans);
		font-size: var(--scribe-font-size-sm);
		color: var(--scribe-doc-foreground);
		background-color: var(--scribe-section-background);
		border: 1px solid var(--scribe-border-strong);
		border-radius: var(--scribe-radius-md);
		outline: none;
		transition: border-color 150ms ease-out;
		box-sizing: border-box;
	}

	.search-input::placeholder {
		color: var(--scribe-muted-foreground);
	}

	.search-input:focus {
		border-color: var(--scribe-accent);
		outline: 1px solid var(--scribe-accent);
	}

	.search-input.search-input:focus-visible {
		outline: 1px solid var(--scribe-accent);
		outline-offset: 0;
	}

	.clear-btn {
		position: absolute;
		right: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		background: transparent;
		border: none;
		color: var(--scribe-muted-foreground);
		cursor: pointer;
		border-radius: var(--scribe-radius-sm);
	}

	.clear-btn:hover {
		color: var(--scribe-doc-foreground);
		background-color: var(--scribe-muted);
	}

	.items-list {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		/* Room for the outline of a chosen row */
		padding: 0.125rem;
	}

	.binding-row {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		min-height: 3.25rem;
		padding: 0.5rem 0.75rem;
		background-color: var(--scribe-section-background);
		border: 1px solid var(--scribe-border-color);
		border-radius: var(--scribe-radius-lg);
		font-family: var(--scribe-font-sans);
		color: var(--scribe-doc-foreground);
		cursor: pointer;
		text-align: left;
		transition: background-color 150ms ease-out, border-color 150ms ease-out;
		box-sizing: border-box;
	}

	.binding-row:hover:not(:disabled) {
		background-color: var(--scribe-muted);
		border-color: var(--scribe-border-strong);
	}

	/* Chosen: the primary border, a wash of the accent and a check. It keeps the wash while hovered. */
	.binding-row.selected:not(:disabled) {
		border-color: var(--scribe-primary);
		outline: 1px solid var(--scribe-primary);
		background-color: var(--scribe-accent-wash);
	}

	.binding-row:disabled {
		opacity: 0.55;
		cursor: not-allowed;
		border-style: dashed;
		background-color: var(--scribe-muted);
	}

	.row-main {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		flex: 1;
		min-width: 0;
	}

	.row-title {
		font-size: var(--scribe-font-size-sm);
		font-weight: var(--scribe-font-weight-semibold);
		line-height: 1.25;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.row-preview {
		font-size: var(--scribe-font-size-xs);
		font-variant-numeric: tabular-nums;
		line-height: 1.3;
		color: var(--scribe-muted-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.row-preview.is-muted {
		font-style: italic;
	}

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		text-align: center;
		color: var(--scribe-muted-foreground);
		background-color: var(--scribe-muted);
		border: 1px dashed var(--scribe-border-strong);
		border-radius: var(--scribe-radius-lg);
	}

	.empty-icon {
		display: flex;
		margin-bottom: 0.5rem;
	}

	.empty-title {
		font-size: var(--scribe-font-size-sm);
		font-weight: var(--scribe-font-weight-semibold);
		color: var(--scribe-doc-foreground);
		margin: 0 0 0.25rem 0;
	}

	.empty-subtitle {
		font-size: var(--scribe-font-size-xs);
		color: var(--scribe-muted-foreground);
		margin: 0;
		max-width: 240px;
	}
</style>
