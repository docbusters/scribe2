<script lang="ts">
	import { bindingStore } from '$lib/stores/binding-store.svelte.js';
	import { editStore } from '$lib/stores/edit-store.svelte.js';
	import ScrollArea from '../utilComponents/ScrollArea.svelte';
	import BindingItemCard from './BindingItemCard.svelte';
	import AddBindingDialog from './AddBindingDialog.svelte';

	let isExpanded = $state(true);
	let searchQuery = $state('');
	let isAddModalOpen = $state(false);

	// Reactive list of default bindings
	const bindingsList = $derived.by(() => {
		return Object.entries(bindingStore.data)
			.filter(([id, val]) => Boolean(id) && id !== 'undefined' && Boolean(val) && Boolean(val.type) && val.type !== 'empty')
			.map(([id, val]) => ({
				id,
				type: val.type,
				value: val.value
			}));
	});

	// Filtered list based on search query
	const filteredBindings = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return bindingsList;
		return bindingsList.filter(
			(b) => b.id.toLowerCase().includes(q) || b.type.toLowerCase().includes(q)
		);
	});

	function handleDeleteBinding(id: string) {
		editStore.deleteBinding(id);
	}
</script>

<div class="scribe-bindings-panel-root">
	{#if !isExpanded}
		<button
			type="button"
			class="scribe-bindings-collapsed-chip"
			onclick={() => (isExpanded = true)}
			title="Expand Bindings Manager"
		>
			<div class="chip-icon-wrapper">
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
					<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
					<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
				</svg>
			</div>
			<span class="chip-label">Bindings</span>
			<span class="chip-badge">{bindingsList.length}</span>
		</button>
	{:else}
		<aside class="scribe-bindings-panel">
			<!-- Header -->
			<header class="panel-header">
				<div class="header-left">
					<div class="header-icon-box">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="15"
							height="15"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.25"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
							<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
						</svg>
					</div>
					<h3 class="panel-title">Bindings</h3>
					<span class="panel-count-badge">{bindingsList.length}</span>
				</div>

				<div class="header-right">
					<button
						type="button"
						class="header-btn"
						title="Add new binding"
						onclick={() => (isAddModalOpen = true)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="15"
							height="15"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.25"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M5 12h14" />
							<path d="M12 5v14" />
						</svg>
					</button>

					<button
						type="button"
						class="header-btn"
						title="Minimize panel"
						onclick={() => (isExpanded = false)}
					>
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
						>
							<path d="m9 18 6-6-6-6" />
						</svg>
					</button>
				</div>
			</header>

			<!-- Search filter -->
			<div class="search-container">
				<div class="search-input-wrapper">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
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
						class="search-field"
						placeholder="Filter bindings..."
						bind:value={searchQuery}
					/>
					{#if searchQuery}
						<button
							type="button"
							class="clear-btn"
							onclick={() => (searchQuery = '')}
							title="Clear search"
						>
							✕
						</button>
					{/if}
				</div>
			</div>

			<!-- Bindings List -->
			<ScrollArea
				orientation="vertical"
				class="bindings-scrollarea"
				viewportClasses="bindings-viewport"
			>
				<div class="cards-list">
					{#if filteredBindings.length === 0}
						<div class="empty-state">
							{#if searchQuery}
								No bindings found for "{searchQuery}"
							{:else}
								No document bindings yet
							{/if}
						</div>
					{:else}
						{#each filteredBindings as b, idx (b.id)}
							<BindingItemCard
								id={b.id}
								type={b.type}
								value={b.value}
								ondelete={handleDeleteBinding}
							/>
							{#if idx < filteredBindings.length - 1}
								<div class="binding-separator"></div>
							{/if}
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
		position: fixed;
		top: 1.25rem;
		right: 1.25rem;
		z-index: 40;
		font-family: var(--scribe-font-sans, system-ui, -apple-system, BlinkMacSystemFont, sans-serif);
		box-sizing: border-box;
	}

	/* Collapsed chip */
	.scribe-bindings-collapsed-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3125rem 0.75rem 0.3125rem 0.3125rem;
		background-color: var(--scribe-popover);
		color: var(--scribe-doc-foreground);
		border-radius: 9999px;
		box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.06);
		cursor: pointer;
		font-family: var(--scribe-font-sans, system-ui, -apple-system, sans-serif);
		font-size: var(--scribe-font-size-xs, 0.8125rem);
		font-weight: var(--scribe-font-weight-semibold, 600);
		backdrop-filter: blur(12px);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		outline: none;
		border: 0;
	}

	.scribe-bindings-collapsed-chip:hover {
		transform: translateY(-2px);
	}

	.chip-icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 9999px;
		background-color: color-mix(in srgb, var(--scribe-primary) 12%, transparent);
		color: var(--scribe-primary);
		flex-shrink: 0;
	}

	.chip-label {
		letter-spacing: -0.01em;
	}

	.chip-badge {
		padding: 0.0625rem 0.4375rem;
		border-radius: 9999px;
		background-color: var(--scribe-muted);
		color: var(--scribe-muted-foreground);
		font-size: 0.6875rem;
		font-weight: var(--scribe-font-weight-semibold, 600);
	}

	/* Expanded Panel */
	.scribe-bindings-panel {
		width: 320px;
		max-height: calc(100vh - 2.5rem);
		display: flex;
		flex-direction: column;
		background-color: var(--scribe-popover);
		color: var(--scribe-doc-foreground);
		border: 1px solid color-mix(in srgb, var(--scribe-border-color) 60%, transparent);
		border-radius: var(--scribe-radius-xl, 1rem);
		box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.14), 0 4px 12px -2px rgba(0, 0, 0, 0.04);
		backdrop-filter: blur(16px);
		overflow: hidden;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Header */
	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 0.875rem;
		border-bottom: 1px solid color-mix(in srgb, var(--scribe-border-color) 70%, transparent);
		background-color: var(--scribe-popover);
		flex-shrink: 0;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.header-icon-box {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.625rem;
		height: 1.625rem;
		border-radius: var(--scribe-radius-md);
		background-color: color-mix(in srgb, var(--scribe-primary) 12%, transparent);
		color: var(--scribe-primary);
	}

	.panel-title {
		font-family: var(--scribe-font-sans, system-ui, -apple-system, sans-serif);
		font-size: var(--scribe-font-size-sm, 0.875rem);
		font-weight: var(--scribe-font-weight-semibold, 600);
		margin: 0;
		color: var(--scribe-doc-foreground);
		letter-spacing: -0.01em;
	}

	.panel-count-badge {
		padding: 0.0625rem 0.4375rem;
		border-radius: 9999px;
		background-color: var(--scribe-muted);
		color: var(--scribe-muted-foreground);
		font-size: 0.6875rem;
		font-weight: var(--scribe-font-weight-semibold, 600);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.header-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border: none;
		background: transparent;
		color: var(--scribe-muted-foreground);
		border-radius: var(--scribe-radius-md);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.header-btn:hover {
		background-color: var(--scribe-muted);
		color: var(--scribe-doc-foreground);
	}

	/* Search */
	.search-container {
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid color-mix(in srgb, var(--scribe-border-color) 60%, transparent);
		flex-shrink: 0;
	}

	.search-input-wrapper {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.3125rem 0.5rem;
		background-color: var(--scribe-muted);
		border-radius: var(--scribe-radius-md);
		border: 1px solid transparent;
		transition: all 0.15s ease;
	}

	.search-input-wrapper:focus-within {
		background-color: var(--scribe-popover);
		border-color: var(--scribe-primary);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--scribe-primary) 12%, transparent);
	}

	.search-icon {
		color: var(--scribe-muted-foreground);
		flex-shrink: 0;
	}

	.search-field {
		flex: 1;
		border: none;
		outline: none;
		background: transparent;
		font-family: var(--scribe-font-sans, system-ui, -apple-system, sans-serif);
		font-size: var(--scribe-font-size-xs, 0.8125rem);
		color: var(--scribe-doc-foreground);
		min-width: 0;
	}

	.clear-btn {
		border: none;
		background: transparent;
		color: var(--scribe-muted-foreground);
		cursor: pointer;
		font-size: 0.6875rem;
		padding: 0 0.125rem;
		border-radius: 9999px;
	}

	.clear-btn:hover {
		color: var(--scribe-doc-foreground);
	}

	/* List & ScrollArea */
	:global(.bindings-scrollarea) {
		flex: 1 1 auto;
		min-height: 0;
		width: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	:global(.bindings-viewport) {
		width: 100%;
		height: 100%;
		min-height: 0;
		flex: 1 1 auto;
	}

	.cards-list {
		padding: 0.5rem 0.625rem;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.binding-separator {
		height: 1px;
		width: 100%;
		background-color: color-mix(in srgb, var(--scribe-border-color) 40%, transparent);
		margin: 0.125rem 0;
		flex-shrink: 0;
	}

	.empty-state {
		text-align: center;
		padding: 2.5rem 1rem;
		color: var(--scribe-muted-foreground);
		font-family: var(--scribe-font-sans, system-ui, -apple-system, sans-serif);
		font-size: var(--scribe-font-size-xs, 0.8125rem);
		line-height: 1.5;
	}
</style>
