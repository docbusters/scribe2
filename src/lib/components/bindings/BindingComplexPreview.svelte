<script lang="ts">
	interface BindingComplexPreviewProps {
		type: string;
		value: unknown;
		onedit: () => void;
	}

	let { type, value, onedit }: BindingComplexPreviewProps = $props();

	let previewSummary = $derived.by(() => {
		if (type === 'array') {
			if (Array.isArray(value)) {
				return `${value.length} ${value.length === 1 ? 'item' : 'items'}`;
			}
			return '0 items';
		}
		if (type === 'record') {
			if (value && typeof value === 'object') {
				const count = Object.keys(value).length;
				return `${count} ${count === 1 ? 'field' : 'fields'}`;
			}
			return '0 fields';
		}
		if (type === 'component') {
			const compType = (value as { type?: string })?.type;
			return compType || 'Component';
		}
		return 'Complex data';
	});
</script>

<button type="button" class="complex-trigger" onclick={onedit} title="Click to edit complex value">
	<span class="trigger-summary">
		<span class="trigger-dot"></span>
		<span class="summary-text">{previewSummary}</span>
	</span>
	<span class="trigger-action">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="10"
			height="10"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="action-arrow"
		>
			<path d="m9 18 6-6-6-6" />
		</svg>
	</span>
</button>

<style>
	.complex-trigger {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.35rem 0.625rem;
		background-color: var(--scribe-muted);
		border: 1px solid color-mix(in srgb, var(--scribe-border-color) 50%, transparent);
		border-radius: var(--scribe-radius-md);
		cursor: pointer;
		outline: none;
		transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
		box-sizing: border-box;
		text-align: left;
		font-family: var(--scribe-font-sans, system-ui, -apple-system, sans-serif);
	}

	.complex-trigger:hover {
		background-color: color-mix(in srgb, var(--scribe-muted) 60%, var(--scribe-primary) 6%);
		border-color: color-mix(in srgb, var(--scribe-border-color) 40%, var(--scribe-primary));
	}

	.complex-trigger:focus-visible {
		border-color: var(--scribe-primary);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--scribe-primary) 15%, transparent);
	}

	.trigger-summary {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		min-width: 0;
	}

	.trigger-dot {
		width: 6px;
		height: 6px;
		border-radius: 9999px;
		background-color: var(--scribe-primary);
		flex-shrink: 0;
		opacity: 0.75;
	}

	.summary-text {
		font-family: var(--scribe-font-sans, system-ui, -apple-system, sans-serif);
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--scribe-doc-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.2;
	}

	.trigger-action {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		color: var(--scribe-muted-foreground);
		flex-shrink: 0;
		transition: color 0.15s ease;
		line-height: 1;
	}

	.complex-trigger:hover .trigger-action {
		color: var(--scribe-primary);
	}

	.action-arrow {
		transition: transform 0.15s ease;
		color: inherit;
	}

	.complex-trigger:hover .action-arrow {
		transform: translateX(2px);
	}
</style>
