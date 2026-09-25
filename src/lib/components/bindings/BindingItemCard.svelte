<script lang="ts">
	import type { UpdateType } from '$lib/types/ScribeProps.js';
	import type { CollectionValue, PrimitiveValue } from '$lib/domain/data/DataValue.js';
	import { bindingStore } from '$lib/stores/binding-store.svelte.js';
	import BindingSimpleInput from './BindingSimpleInput.svelte';
	import BindingComplexPreview from './BindingComplexPreview.svelte';
	import BindingComplexEditorDialog from './BindingComplexEditorDialog.svelte';

	interface Props {
		id: string;
		type: string;
		value: unknown;
		ondelete: (id: string) => void;
	}

	let { id, type, value, ondelete }: Props = $props();

	let isComplexModalOpen = $state(false);
	let isConfirmingDelete = $state(false);

	const isSimpleType = $derived(
		type === 'string' || type === 'number' || type === 'boolean' || type === 'date'
	);

	function handleSimpleUpdate(newVal: unknown, updateType: UpdateType) {
		const formattedValue = {
			type,
			value: newVal
		} as PrimitiveValue;
		bindingStore.updateBindingValue('edit', id, 'default', updateType, formattedValue);
	}

	function handleComplexSave(updatedVal: unknown) {
		const formattedValue = {
			type,
			value: updatedVal
		} as CollectionValue | PrimitiveValue;
		bindingStore.updateBindingValue('edit', id, 'default', 'onblur', formattedValue);
	}

	function handleDeleteClick() {
		isConfirmingDelete = true;
	}

	function confirmDelete() {
		isConfirmingDelete = false;
		ondelete(id);
	}

	function cancelDelete() {
		isConfirmingDelete = false;
	}
</script>

<div class="binding-item-card">
	<div class="row-header">
		<div class="meta-left">
			<span class="binding-name" title={id}>{id}</span>
			<span class="type-pill pill-{type}">{type}</span>
		</div>
		<button
			type="button"
			class="delete-btn"
			title="Delete binding"
			onclick={handleDeleteClick}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="13"
				height="13"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M3 6h18" />
				<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
				<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
			</svg>
		</button>
	</div>

	{#if isConfirmingDelete}
		<div class="delete-warning-box">
			<span class="warning-text">Delete binding?</span>
			<div class="warning-actions">
				<button
					type="button"
					class="btn-confirm"
					title="Confirm delete"
					onclick={confirmDelete}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<polyline points="20 6 9 17 4 12" />
					</svg>
				</button>
				<button
					type="button"
					class="btn-cancel"
					title="Cancel"
					onclick={cancelDelete}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			</div>
		</div>
	{/if}

	<div class="row-control">
		{#if isSimpleType}
			<BindingSimpleInput
				type={type as 'string' | 'number' | 'boolean' | 'date'}
				{value}
				onupdate={handleSimpleUpdate}
			/>
		{:else}
			<BindingComplexPreview
				{type}
				{value}
				onedit={() => (isComplexModalOpen = true)}
			/>
			<BindingComplexEditorDialog
				bind:open={isComplexModalOpen}
				bindingId={id}
				bindingType={type}
				initialValue={value}
				onsave={handleComplexSave}
			/>
		{/if}
	</div>
</div>

<style>
	.binding-item-card {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		padding: 0.5625rem 0.6875rem;
		background-color: var(--scribe-popover);
		border-radius: var(--scribe-radius-lg);
		transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
		box-sizing: border-box;
	}

	.binding-item-card:hover,
	.binding-item-card:focus-within {
		background-color: var(--scribe-muted);
	}

	.row-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.meta-left {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		min-width: 0;
		flex: 1;
	}

	.binding-name {
		font-size: var(--scribe-font-size-xs, 0.8125rem);
		font-weight: var(--scribe-font-weight-semibold, 600);
		color: var(--scribe-doc-foreground);
		letter-spacing: -0.01em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.type-pill {
		font-size: 0.65rem;
		font-weight: var(--scribe-font-weight-medium, 500);
		padding: 0.1rem 0.45rem;
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

	.delete-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.375rem;
		height: 1.375rem;
		border-radius: var(--scribe-radius-sm);
		border: none;
		background: transparent;
		color: var(--scribe-muted-foreground);
		cursor: pointer;
		opacity: 0.5;
		transition: all 0.15s ease;
		flex-shrink: 0;
	}

	.binding-item-card:hover .delete-btn {
		opacity: 0.85;
	}

	.delete-btn:hover {
		opacity: 1 !important;
		color: var(--scribe-error);
		background-color: color-mix(in srgb, var(--scribe-error) 12%, transparent);
	}

	.delete-warning-box {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.25rem 0.45rem;
		background-color: color-mix(in srgb, var(--scribe-error) 8%, var(--scribe-popover));
		border: 1px solid color-mix(in srgb, var(--scribe-error) 22%, transparent);
		border-radius: var(--scribe-radius-sm);
	}

	.warning-text {
		font-family: var(--scribe-font-sans, system-ui, -apple-system, sans-serif);
		font-size: 0.6875rem;
		color: var(--scribe-error);
		font-weight: var(--scribe-font-weight-medium, 500);
	}

	.warning-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.btn-confirm,
	.btn-cancel {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		border-radius: var(--scribe-radius-sm);
		cursor: pointer;
		transition: all 0.15s ease;
		flex-shrink: 0;
	}

	.btn-confirm {
		border: none;
		background: var(--scribe-error);
		color: #ffffff;
	}

	.btn-confirm:hover {
		filter: brightness(1.1);
	}

	.btn-cancel {
		border: 1px solid var(--scribe-border-color);
		background: var(--scribe-popover);
		color: var(--scribe-muted-foreground);
	}

	.btn-cancel:hover {
		color: var(--scribe-doc-foreground);
		background: var(--scribe-muted);
	}

	.row-control {
		width: 100%;
	}
</style>
