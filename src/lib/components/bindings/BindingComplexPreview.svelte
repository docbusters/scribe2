<script lang="ts">
	import { getI18n } from '$lib/i18n/i18n.svelte.js';

	interface BindingComplexPreviewProps {
		type: string;
		value: unknown;
		onedit: () => void;
	}

	let { type, value, onedit }: BindingComplexPreviewProps = $props();

	const i18n = getI18n();

	let previewSummary = $derived.by(() => {
		if (type === 'array') {
			if (Array.isArray(value)) {
				const count = value.length;
				return count === 1
					? i18n.t('bindingComplex.itemCountOne', { count })
					: i18n.t('bindingComplex.itemCountMany', { count });
			}
			return i18n.t('bindingComplex.emptyList');
		}
		if (type === 'record') {
			if (value && typeof value === 'object') {
				const count = Object.keys(value).length;
				return count === 1
					? i18n.t('bindingComplex.fieldCountOne', { count })
					: i18n.t('bindingComplex.fieldCountMany', { count });
			}
			return i18n.t('bindingComplex.emptyGroup');
		}
		if (type === 'component') {
			const compType = (value as { type?: string })?.type;
			return compType || i18n.t('bindingComplex.componentDefault');
		}
		return i18n.t('bindingComplex.editElements');
	});
</script>

<button type="button" class="complex-trigger" onclick={onedit} title={i18n.t('bindingComplex.editElements')}>
	<span class="trigger-summary">
		<span class="summary-text">{previewSummary}</span>
	</span>
	<span class="trigger-action">
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
			class="action-arrow"
		>
			<path d="m9 18 6-6-6-6" />
		</svg>
	</span>
</button>

<style>
	.complex-trigger {
		width: 100%;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0 0.5rem 0 0.625rem;
		background-color: var(--scribe-section-background);
		border: 1px solid var(--scribe-border-strong);
		border-radius: var(--scribe-radius-md);
		cursor: pointer;
		transition: background-color 150ms ease-out, border-color 150ms ease-out;
		box-sizing: border-box;
		text-align: left;
		font-family: var(--scribe-font-sans);
	}

	.complex-trigger:hover {
		background-color: var(--scribe-muted);
	}

	.trigger-summary {
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.summary-text {
		font-size: var(--scribe-font-size-sm);
		color: var(--scribe-doc-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.2;
	}

	.trigger-action {
		display: flex;
		align-items: center;
		color: var(--scribe-muted-foreground);
		flex-shrink: 0;
		line-height: 1;
	}

	.action-arrow {
		transition: transform 150ms ease-out;
		color: inherit;
	}

	.complex-trigger:hover .action-arrow {
		transform: translateX(2px);
	}
</style>
