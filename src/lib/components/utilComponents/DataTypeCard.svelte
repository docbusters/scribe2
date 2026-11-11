<script lang="ts">
	import TypeIcon from './TypeIcon.svelte';

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
	aria-pressed={selected}
	title={description ? `${label} - ${description}` : label}
	{onclick}
>
	<div class="scribe-tile" data-type={category === 'binding' ? 'binding' : type}>
		<TypeIcon type={type === 'binding' && bindingType !== 'default' ? 'database' : type} />
	</div>

	<div class="source-card-text">
		<span class="source-card-label" title={label}>{label}</span>
		{#if description}
			<span class="source-card-desc" title={description}>{description}</span>
		{/if}
	</div>

	<span class="scribe-check" class:is-checked={selected} aria-hidden="true">
		{#if selected}
			<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
		{/if}
	</span>
</button>

<style>
	.source-card {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.625rem 0.75rem;
		background-color: var(--scribe-section-background);
		border: 1px solid var(--scribe-border-color);
		border-radius: var(--scribe-radius-lg);
		cursor: pointer;
		text-align: left;
		transition: background-color 150ms ease-out, border-color 150ms ease-out;
		box-sizing: border-box;
		width: 100%;
	}

	.source-card:hover {
		background-color: var(--scribe-muted);
		border-color: var(--scribe-border-strong);
	}

	/* Selected: the primary border, a wash of the accent and a check */
	.source-card.selected {
		border-color: var(--scribe-primary);
		outline: 1px solid var(--scribe-primary);
		background-color: var(--scribe-accent-wash);
	}

	.source-card-text {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
		flex: 1;
	}

	.source-card-label {
		font-family: var(--scribe-font-sans);
		font-size: var(--scribe-font-size-sm);
		font-weight: var(--scribe-font-weight-semibold);
		line-height: 1.2;
		color: var(--scribe-doc-foreground);
		overflow-wrap: anywhere;
	}

	.source-card-desc {
		font-size: var(--scribe-font-size-xs);
		line-height: 1.3;
		color: var(--scribe-muted-foreground);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
