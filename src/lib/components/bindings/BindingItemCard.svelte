<script lang="ts">
	import type { UpdateType } from '$lib/types/ScribeProps.js';
	import type { CollectionValue, PrimitiveValue } from '$lib/domain/data/DataValue.js';
	import { bindingStore } from '$lib/stores/binding-store.svelte.js';
	import { editStore } from '$lib/stores/edit-store.svelte.js';
	import Button from '../utilComponents/Button.svelte';
	import BindingSimpleInput from './BindingSimpleInput.svelte';
	import BindingComplexPreview from './BindingComplexPreview.svelte';
	import BindingComplexEditorDialog from './BindingComplexEditorDialog.svelte';
	import { getI18n } from '$lib/i18n/i18n.svelte.js';

	interface Props {
		id: string;
		type: string;
		value: unknown;
		ondelete: (id: string) => void;
	}

	let { id, type, value, ondelete }: Props = $props();

	const i18n = getI18n();

	let isComplexModalOpen = $state(false);
	let isConfirmingDelete = $state(false);
	// How many components use this binding, read when the deletion is asked for, as deleting it breaks them
	let usageCount = $state(0);

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
		usageCount = editStore.getBindingUsages(id).length;
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
		<span class="binding-name" title={id}>{id}</span>
		<span class="delete-slot">
			<Button
				size="icon-sm"
				variant="ghost-destructive"
				title={i18n.t('bindingsPanel.deleteTooltip')}
				aria-label={i18n.t('bindingsPanel.deleteTooltip')}
				onclick={handleDeleteClick}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
			</Button>
		</span>
	</div>

	{#if isConfirmingDelete}
		<div class="delete-warning-box" role="alert">
			<span class="warning-text">{usageCount > 0 ? i18n.t('bindingsPanel.deleteInUse', { count: usageCount }) : i18n.t('bindingsPanel.deleteConfirm')}</span>
			<div class="warning-actions">
				<Button size="icon-sm" variant="destructive" title={i18n.t('bindingsPanel.confirm')} aria-label={i18n.t('bindingsPanel.confirm')} onclick={confirmDelete}>
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
				</Button>
				<Button size="icon-sm" variant="outline" title={i18n.t('common.cancel')} aria-label={i18n.t('common.cancel')} onclick={cancelDelete}>
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
				</Button>
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
	/* A flat row of the group: a hairline separates it from the next one, and the field is the only bordered part */
	.binding-item-card {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding: 0.5rem 0.5rem 0.625rem 0.75rem;
		border-bottom: 1px solid var(--scribe-border-color);
		transition: background-color 150ms ease-out;
		box-sizing: border-box;
	}

	.binding-item-card:last-child {
		border-bottom: none;
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
		min-height: 1.75rem;
	}

	.binding-name {
		min-width: 0;
		font-size: var(--scribe-font-size-sm);
		font-weight: var(--scribe-font-weight-semibold);
		color: var(--scribe-doc-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.delete-slot {
		display: flex;
		flex-shrink: 0;
	}

	/* Delete shows on hover or keyboard focus. Touch screens have no hover, so it stays visible there. */
	@media (hover: hover) {
		.delete-slot {
			opacity: 0;
			transition: opacity 150ms ease-out;
		}

		.binding-item-card:hover .delete-slot,
		.binding-item-card:focus-within .delete-slot {
			opacity: 1;
		}
	}

	.delete-warning-box {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.375rem 0.375rem 0.375rem 0.625rem;
		background-color: var(--scribe-error-wash);
		border: 1px solid var(--scribe-error-soft);
		border-radius: var(--scribe-radius-md);
	}

	.warning-text {
		font-size: var(--scribe-font-size-xs);
		line-height: 1.35;
		color: var(--scribe-error-foreground);
		font-weight: var(--scribe-font-weight-medium);
	}

	.warning-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	.row-control {
		width: 100%;
	}
</style>
