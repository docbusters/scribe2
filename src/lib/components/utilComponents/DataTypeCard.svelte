<script lang="ts">
	interface DataTypeCardProps {
		type: string;
		bindingType?: string;
		category?: 'binding' | 'static';
		label: string;
		description?: string;
		selected?: boolean;
		onclick?: () => void;
	}

	let {
		type,
		bindingType = 'default',
		category = 'static',
		label,
		description,
		selected = false,
		onclick
	}: DataTypeCardProps = $props();
</script>

<button
	type="button"
	class="source-card"
	class:selected
	title={description ? `${label} - ${description}` : label}
	{onclick}
>
	<div class="source-card-icon-wrap" class:is-binding={category === 'binding'}>
		{#if type === 'binding'}
			{#if bindingType === 'default'}
				<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
			{/if}
		{:else if type === 'string'}
			<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>
		{:else if type === 'number'}
			<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
		{:else if type === 'boolean'}
			<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></svg>
		{:else if type === 'array'}
			<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
		{:else if type === 'record'}
			<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
		{:else if type === 'date'}
			<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
		{/if}
	</div>

	<div class="source-card-text">
		<span class="source-card-label" title={label}>{label}</span>
		{#if description}
			<span class="source-card-desc" title={description}>{description}</span>
		{/if}
	</div>

	{#if selected}
		<div class="source-selected-badge">
			<svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
		</div>
	{/if}
</button>

<style>
	.source-card {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.65rem;
		background-color: var(--scribe-popover);
		border: 1.5px solid color-mix(in srgb, var(--scribe-border-color) 70%, transparent);
		border-radius: var(--scribe-radius-md);
		cursor: pointer;
		text-align: left;
		transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
		box-sizing: border-box;
		width: 100%;
	}

	.source-card:hover {
		background-color: var(--scribe-muted);
		border-color: color-mix(in srgb, var(--scribe-border-color) 30%, var(--scribe-primary));
		transform: translateY(-1px);
		box-shadow: var(--scribe-shadow-sm);
	}

	.source-card.selected {
		border-color: var(--scribe-accent, var(--scribe-primary));
		background-color: color-mix(in srgb, var(--scribe-accent) 8%, var(--scribe-popover));
		box-shadow: 0 0 0 1px var(--scribe-accent, var(--scribe-primary));
	}

	.source-card-icon-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: var(--scribe-radius-sm);
		background-color: color-mix(in srgb, var(--scribe-muted) 80%, transparent);
		color: var(--scribe-doc-foreground);
		flex-shrink: 0;
		transition: all 0.18s ease;
	}

	.source-card-icon-wrap.is-binding {
		background-color: color-mix(in srgb, var(--scribe-accent, #3b82f6) 14%, transparent);
		color: var(--scribe-accent, #3b82f6);
	}

	.source-card.selected .source-card-icon-wrap {
		background-color: var(--scribe-accent, var(--scribe-primary));
		color: var(--scribe-primary-foreground, #ffffff);
	}

	.source-card-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
	}

	.source-card-label {
		font-family: var(--scribe-font-sans, system-ui, sans-serif);
		font-size: var(--scribe-font-size-xs, 0.8125rem);
		font-weight: var(--scribe-font-weight-semibold, 600);
		color: var(--scribe-doc-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.source-card-desc {
		font-size: 0.65rem;
		color: var(--scribe-muted-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.source-selected-badge {
		position: absolute;
		top: -0.3rem;
		right: -0.3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		border-radius: 9999px;
		background-color: var(--scribe-accent, var(--scribe-primary));
		color: var(--scribe-primary-foreground, #ffffff);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}
</style>
