<script lang="ts">
	import { bindingStore } from '$lib/stores/binding-store.svelte.js';
	import { customBindingsStore } from '$lib/stores/custom-bindings-store.svelte.js';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import { stringifyDataValue } from '$lib/utils/stringifyDataValue.js';
	import { truncateString } from '$lib/utils/truncateString.js';
	import type { DataValue } from '$lib/domain/data/DataValue.js';
	import { getI18n } from '$lib/i18n/i18n.svelte.js';

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
							customPreviewValues[item.value] = 'Unavailable';
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
			return Object.entries(bindingStore.data).map(([id, dataVal]) => {
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
			const preview = customPreviewValues[item.value] ?? (loadingIds[item.value] ? 'Loading...' : '');
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

	function getTypeLabel(type: string): string {
		const map: Record<string, string> = {
			string: i18n.t('types.string'),
			number: i18n.t('types.number'),
			boolean: i18n.t('types.boolean'),
			array: i18n.t('types.array'),
			record: i18n.t('types.record'),
			date: i18n.t('types.date'),
			empty: i18n.t('types.empty')
		};
		return map[type] || type;
	}

	function handleSelect(item: BindingItem) {
		if (item.disabled) return;
		value = item.id;
		onselect?.(item.id);
	}
</script>

<div class="binding-selector-root">
	<!-- Search bar -->
	<div class="search-box">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="search-icon"
		>
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.3-4.3" />
		</svg>
		<input
			type="text"
			class="search-input"
			placeholder={i18n.t('bindingSelector.searchPlaceholder')}
			bind:value={searchQuery}
		/>
		{#if searchQuery}
			<button
				type="button"
				class="clear-btn"
				onclick={() => (searchQuery = '')}
				title={i18n.t('bindingSelector.clearSearch')}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="13"
					height="13"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
			</button>
		{/if}
	</div>

	<!-- 2-column Grid of Binding Cards -->
	<div class="grid-container">
		{#if filteredItems.length === 0}
			<div class="empty-state">
				{#if searchQuery}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="empty-icon"
					>
						<circle cx="11" cy="11" r="8" />
						<path d="m21 21-4.3-4.3" />
						<path d="m13.5 8.5-5 5" />
					</svg>
					<p class="empty-title">{i18n.t('bindingSelector.noMatchTitle')}</p>
					<p class="empty-subtitle">{i18n.t('bindingSelector.noMatchSubtitle')}</p>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="empty-icon"
					>
						<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
						<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
					</svg>
					<p class="empty-title">{i18n.t('bindingSelector.emptyTitle')}</p>
					<p class="empty-subtitle">
						{componentType
							? i18n.t('bindingSelector.emptySubtitleComponent')
							: i18n.t('bindingSelector.emptySubtitleDocument')}
					</p>
				{/if}
			</div>
		{:else}
			<div class="items-grid">
				{#each filteredItems as item (item.id)}
					{@const isSelected = value === item.id}
					<button
						type="button"
						class="binding-card"
						class:selected={isSelected}
						class:disabled={item.disabled}
						disabled={item.disabled}
						onclick={() => handleSelect(item)}
						title={item.disabled ? i18n.t('bindingSelector.incompatibleTooltip') : item.title}
					>
						<!-- Top row: Title and Type badge -->
						<div class="card-top-row">
							<span class="card-title" title={item.title}>{item.title}</span>
							{#if item.type}
								<span class="type-pill pill-{item.type}">{getTypeLabel(item.type)}</span>
							{/if}
						</div>

						<!-- Value preview -->
						<div class="card-value-preview">
							{#if item.isLoading}
								<span class="preview-loading">{i18n.t('common.loading')}</span>
							{:else if item.valuePreview !== ''}
								<span class="preview-text" title={item.valuePreview}>
									{truncateString(item.valuePreview, 40)}
								</span>
							{:else}
								<span class="preview-empty">{i18n.t('common.empty')}</span>
							{/if}
						</div>

						<!-- Selection Checkmark Badge -->
						{#if isSelected}
							<div class="selection-indicator">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="11"
									height="11"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
							</div>
						{/if}

						{#if item.disabled}
							<span class="incompatible-badge">{i18n.t('common.incompatible')}</span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.binding-selector-root {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		width: 100%;
	}

	.search-box {
		position: sticky;
		top: 0;
		z-index: 5;
		background-color: var(--scribe-popover);
		padding-bottom: 0.25rem;
		display: flex;
		align-items: center;
		width: 100%;
		padding-right: 0.25rem;
	}

	.search-icon {
		position: absolute;
		left: 0.75rem;
		color: var(--scribe-muted-foreground);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 0.45rem 2rem 0.45rem 2.25rem;
		font-family: var(--scribe-font-sans, system-ui, sans-serif);
		font-size: var(--scribe-font-size-xs, 0.8125rem);
		color: var(--scribe-doc-foreground);
		background-color: var(--scribe-popover);
		border: 1px solid var(--scribe-border-color);
		border-radius: var(--scribe-radius-md);
		outline: none;
		transition: all 0.15s ease;
		box-sizing: border-box;
	}

	.search-input:focus {
		border-color: var(--scribe-accent, var(--scribe-primary));
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--scribe-accent) 20%, transparent);
	}

	.clear-btn {
		position: absolute;
		right: 0.625rem;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.2rem;
		background: transparent;
		border: none;
		color: var(--scribe-muted-foreground);
		cursor: pointer;
		border-radius: var(--scribe-radius-sm);
	}

	.clear-btn:hover {
		color: var(--scribe-doc-foreground);
	}

	.grid-container {
		padding: 0.125rem 0.25rem 0.25rem 0.125rem;
	}

	.items-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
	}

	@media (max-width: 480px) {
		.items-grid {
			grid-template-columns: 1fr;
		}
	}

	.binding-card {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.4rem;
		padding: 0.625rem 0.75rem;
		background-color: var(--scribe-popover);
		border: 1.5px solid color-mix(in srgb, var(--scribe-border-color) 70%, transparent);
		border-radius: var(--scribe-radius-md);
		cursor: pointer;
		text-align: left;
		transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
		box-sizing: border-box;
		min-height: 62px;
	}

	.binding-card:hover:not(.disabled) {
		background-color: var(--scribe-muted);
		border-color: color-mix(in srgb, var(--scribe-border-color) 30%, var(--scribe-primary));
		transform: translateY(-1px);
		box-shadow: var(--scribe-shadow-sm);
	}

	.binding-card.selected {
		border-color: var(--scribe-accent, var(--scribe-primary));
		background-color: color-mix(in srgb, var(--scribe-accent) 8%, var(--scribe-popover));
		box-shadow: 0 0 0 1px var(--scribe-accent, var(--scribe-primary));
	}

	.binding-card.disabled {
		opacity: 0.45;
		cursor: not-allowed;
		background-color: color-mix(in srgb, var(--scribe-muted) 50%, transparent);
		border-style: dashed;
	}

	.card-top-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.35rem;
		width: 100%;
	}

	.card-title {
		font-family: var(--scribe-font-sans, system-ui, sans-serif);
		font-size: var(--scribe-font-size-xs, 0.8125rem);
		font-weight: var(--scribe-font-weight-semibold, 600);
		color: var(--scribe-doc-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1;
	}

	.card-value-preview {
		display: flex;
		align-items: center;
		width: 100%;
	}

	.preview-text {
		font-family: var(--scribe-font-mono, monospace);
		font-size: 0.715rem;
		color: var(--scribe-muted-foreground);
		background-color: color-mix(in srgb, var(--scribe-muted) 70%, transparent);
		padding: 0.125rem 0.35rem;
		border-radius: var(--scribe-radius-sm);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	.preview-empty,
	.preview-loading {
		font-size: 0.715rem;
		font-style: italic;
		color: var(--scribe-muted-foreground);
	}

	.selection-indicator {
		position: absolute;
		top: -0.35rem;
		right: -0.35rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.125rem;
		height: 1.125rem;
		border-radius: 9999px;
		background-color: var(--scribe-accent, var(--scribe-primary));
		color: var(--scribe-primary-foreground, #ffffff);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}

	.incompatible-badge {
		font-size: 0.625rem;
		font-weight: 500;
		color: var(--scribe-muted-foreground);
		background-color: color-mix(in srgb, var(--scribe-muted) 80%, transparent);
		padding: 0.1rem 0.3rem;
		border-radius: var(--scribe-radius-sm);
		align-self: flex-start;
	}

	/* Type Pills */
	.type-pill {
		font-size: 0.625rem;
		font-weight: var(--scribe-font-weight-medium, 500);
		padding: 0.08rem 0.4rem;
		border-radius: 9999px;
		letter-spacing: 0.02em;
		flex-shrink: 0;
		line-height: 1.3;
		user-select: none;
	}

	.pill-string {
		background-color: oklch(0.94 0.04 235);
		color: oklch(0.35 0.1 235);
	}
	.pill-number {
		background-color: oklch(0.94 0.05 155);
		color: oklch(0.35 0.1 155);
	}
	.pill-boolean {
		background-color: oklch(0.94 0.05 65);
		color: oklch(0.4 0.12 65);
	}
	.pill-date {
		background-color: oklch(0.94 0.04 195);
		color: oklch(0.35 0.1 195);
	}
	.pill-array {
		background-color: oklch(0.94 0.05 285);
		color: oklch(0.35 0.12 285);
	}
	.pill-record {
		background-color: oklch(0.94 0.05 315);
		color: oklch(0.35 0.12 315);
	}

	:global(.dark) .pill-string {
		background-color: oklch(0.24 0.05 235);
		color: oklch(0.85 0.08 235);
	}
	:global(.dark) .pill-number {
		background-color: oklch(0.24 0.05 155);
		color: oklch(0.85 0.08 155);
	}
	:global(.dark) .pill-boolean {
		background-color: oklch(0.24 0.05 65);
		color: oklch(0.85 0.08 65);
	}
	:global(.dark) .pill-date {
		background-color: oklch(0.24 0.05 195);
		color: oklch(0.85 0.08 195);
	}
	:global(.dark) .pill-array {
		background-color: oklch(0.24 0.05 285);
		color: oklch(0.85 0.08 285);
	}
	:global(.dark) .pill-record {
		background-color: oklch(0.24 0.05 315);
		color: oklch(0.85 0.08 315);
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
		background-color: color-mix(in srgb, var(--scribe-muted) 35%, transparent);
		border: 1px dashed var(--scribe-border-color);
		border-radius: var(--scribe-radius-md);
	}

	.empty-icon {
		margin-bottom: 0.5rem;
		opacity: 0.6;
	}

	.empty-title {
		font-size: var(--scribe-font-size-sm, 0.875rem);
		font-weight: var(--scribe-font-weight-semibold, 600);
		color: var(--scribe-doc-foreground);
		margin: 0 0 0.25rem 0;
	}

	.empty-subtitle {
		font-size: var(--scribe-font-size-xs, 0.75rem);
		color: var(--scribe-muted-foreground);
		margin: 0;
		max-width: 240px;
	}
</style>
