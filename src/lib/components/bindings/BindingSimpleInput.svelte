<script lang="ts">
	import type { UpdateType } from '$lib/types/ScribeProps.js';

	interface Props {
		type: 'string' | 'number' | 'boolean' | 'date';
		value: unknown;
		onupdate: (newValue: unknown, updateType: UpdateType) => void;
	}

	let { type, value, onupdate }: Props = $props();

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
			placeholder="Enter text..."
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
				onclick={() => onupdate(true, 'onblur')}
			>
				True
			</button>
			<button
				type="button"
				class="bool-option {value === false ? 'is-selected' : ''}"
				onclick={() => onupdate(false, 'onblur')}
			>
				False
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
		padding: 0.35rem 0.55rem;
		font-family: var(--scribe-font-sans, system-ui, -apple-system, sans-serif);
		font-size: var(--scribe-font-size-xs, 0.8125rem);
		color: var(--scribe-doc-foreground);
		background-color: var(--scribe-muted);
		border: 1px solid color-mix(in srgb, var(--scribe-border-color) 50%, transparent);
		border-radius: var(--scribe-radius-md);
		outline: none;
		transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
		box-sizing: border-box;
	}

	.scribe-binding-input:hover {
		border-color: color-mix(in srgb, var(--scribe-border-color) 40%, var(--scribe-primary));
		background-color: color-mix(in srgb, var(--scribe-muted) 80%, transparent);
	}

	.scribe-binding-input:focus {
		background-color: var(--scribe-popover);
		border-color: var(--scribe-primary);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--scribe-primary) 15%, transparent);
	}

	.scribe-date-input {
		cursor: pointer;
	}

	.scribe-bool-toggle {
		display: inline-flex;
		align-items: center;
		padding: 2px;
		background-color: var(--scribe-muted);
		border-radius: var(--scribe-radius-md);
		border: 1px solid var(--scribe-border-color);
		gap: 2px;
		width: 100%;
		box-sizing: border-box;
	}

	.bool-option {
		flex: 1;
		padding: 0.25rem 0.5rem;
		font-family: var(--scribe-font-sans, system-ui, -apple-system, sans-serif);
		font-size: var(--scribe-font-size-xs, 0.75rem);
		font-weight: var(--scribe-font-weight-medium, 500);
		border: none;
		background: transparent;
		color: var(--scribe-muted-foreground);
		border-radius: var(--scribe-radius-sm);
		cursor: pointer;
		transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.bool-option:hover {
		color: var(--scribe-doc-foreground);
	}

	.bool-option.is-selected {
		background-color: var(--scribe-popover);
		color: var(--scribe-doc-foreground);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		font-weight: var(--scribe-font-weight-semibold, 600);
	}
</style>
