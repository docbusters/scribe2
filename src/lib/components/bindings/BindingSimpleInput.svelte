<script lang="ts">
	import type { UpdateType } from '$lib/types/ScribeProps.js';
	import { getI18n } from '$lib/i18n/i18n.svelte.js';

	interface Props {
		type: 'string' | 'number' | 'boolean' | 'date';
		value: unknown;
		onupdate: (newValue: unknown, updateType: UpdateType) => void;
	}

	let { type, value, onupdate }: Props = $props();
	const i18n = getI18n();

	function formatDateForInput(val: unknown): string {
		if (!val) return '';
		if (val instanceof Date && !isNaN(val.getTime())) {
			return val.toISOString().slice(0, 10);
		}
		if (typeof val === 'string') {
			const parsed = new Date(val);
			if (!isNaN(parsed.getTime())) {
				return parsed.toISOString().slice(0, 10);
			}
			return val;
		}
		return '';
	}

	let dateInputValue = $derived(formatDateForInput(value));

	function handleDateChange(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		if (!target.value) return;
		const [year, month, day] = target.value.split('-').map(Number);
		const newDate = new Date(Date.UTC(year, month - 1, day));
		onupdate(newDate, 'onblur');
	}
</script>

<div class="scribe-simple-input-container">
	{#if type === 'string'}
		<input
			type="text"
			class="scribe-binding-input"
			value={(value as string) ?? ''}
			oninput={(e) => onupdate(e.currentTarget.value, 'onchange')}
			onblur={(e) => onupdate(e.currentTarget.value, 'onblur')}
			placeholder={i18n.t('common.textPlaceholder')}
		/>
	{:else if type === 'number'}
		<input
			type="number"
			class="scribe-binding-input"
			value={(value as number) ?? 0}
			oninput={(e) => onupdate(Number(e.currentTarget.value), 'onchange')}
			onblur={(e) => onupdate(Number(e.currentTarget.value), 'onblur')}
			placeholder="0"
		/>
	{:else if type === 'boolean'}
		<div class="scribe-bool-toggle">
			<button
				type="button"
				class="bool-option {value === true ? 'is-selected' : ''}"
				aria-pressed={value === true}
				onclick={() => onupdate(true, 'onblur')}
			>
				{i18n.t('common.true')}
			</button>
			<button
				type="button"
				class="bool-option {value === false ? 'is-selected' : ''}"
				aria-pressed={value === false}
				onclick={() => onupdate(false, 'onblur')}
			>
				{i18n.t('common.false')}
			</button>
		</div>
	{:else if type === 'date'}
		<input
			type="date"
			class="scribe-binding-input scribe-date-input"
			value={dateInputValue}
			onchange={handleDateChange}
		/>
	{/if}
</div>

<style>
	.scribe-simple-input-container {
		width: 100%;
		display: flex;
		align-items: center;
	}

	.scribe-binding-input {
		width: 100%;
		height: 2rem;
		padding: 0 0.625rem;
		font-family: var(--scribe-font-sans);
		font-size: var(--scribe-font-size-sm);
		font-variant-numeric: tabular-nums;
		color: var(--scribe-doc-foreground);
		background-color: var(--scribe-section-background);
		border: 1px solid var(--scribe-border-strong);
		border-radius: var(--scribe-radius-md);
		outline: none;
		transition: border-color 150ms ease-out;
		box-sizing: border-box;
	}

	.scribe-binding-input::placeholder {
		color: var(--scribe-muted-foreground);
	}

	.scribe-binding-input:hover {
		border-color: color-mix(in oklab, var(--scribe-doc-foreground) 38%, var(--scribe-section-background));
	}

	.scribe-binding-input:focus {
		border-color: var(--scribe-accent);
		outline: 1px solid var(--scribe-accent);
	}

	.scribe-binding-input.scribe-binding-input:focus-visible {
		outline: 1px solid var(--scribe-accent);
		outline-offset: 0;
	}

	.scribe-date-input {
		cursor: pointer;
	}

	/* A segmented control: the chosen option is the primary pill */
	.scribe-bool-toggle {
		display: inline-flex;
		align-items: center;
		padding: 2px;
		background-color: var(--scribe-secondary);
		border-radius: var(--scribe-radius-md);
		gap: 2px;
		width: 100%;
		box-sizing: border-box;
	}

	.bool-option {
		flex: 1;
		height: 1.75rem;
		padding: 0 0.5rem;
		font-family: var(--scribe-font-sans);
		font-size: var(--scribe-font-size-xs);
		font-weight: var(--scribe-font-weight-medium);
		border: none;
		background: transparent;
		color: var(--scribe-secondary-foreground);
		border-radius: var(--scribe-radius-sm);
		cursor: pointer;
		transition: background-color 150ms ease-out, color 150ms ease-out;
	}

	.bool-option:hover:not(.is-selected) {
		background-color: color-mix(in oklab, var(--scribe-secondary) 80%, var(--scribe-doc-foreground));
	}

	.bool-option.is-selected {
		background-color: var(--scribe-accent-wash);
		color: var(--scribe-accent-text);
		box-shadow: inset 0 0 0 1px var(--scribe-accent-soft);
		font-weight: var(--scribe-font-weight-semibold);
	}
</style>
