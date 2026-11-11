<script lang="ts">
	import Dialog from '../utilComponents/Dialog.svelte';
	import Button from '../utilComponents/Button.svelte';
	import ComponentEditorValue from '../component/ComponentEditorValue.svelte';
	import type { DataValue } from '$lib/domain/data/DataValue.js';
	import { getI18n } from '$lib/i18n/i18n.svelte.js';

	interface BindingComplexEditorDialogProps {
		open: boolean;
		bindingId: string;
		bindingType: string;
		initialValue: unknown;
		onsave: (updatedValue: unknown) => void;
	}

	let {
		open = $bindable(false),
		bindingId,
		bindingType,
		initialValue,
		onsave
	}: BindingComplexEditorDialogProps = $props();

	const i18n = getI18n();

	let draftValue = $state<unknown>(null);

	$effect(() => {
		if (open) {
			try {
				draftValue = structuredClone($state.snapshot(initialValue));
			} catch {
				draftValue = JSON.parse(JSON.stringify(initialValue ?? (bindingType === 'array' ? [] : {})));
			}
		}
	});

	const parsedValueType = $derived<{ type: DataValue['type']; bindingType?: string }>({
		type: bindingType as DataValue['type']
	});

	const initialDataValue = $derived.by<DataValue>(() => {
		const val = $state.snapshot(initialValue);
		return {
			type: bindingType as DataValue['type'],
			value: val
		} as DataValue;
	});

	function handleSave() {
		onsave($state.snapshot(draftValue));
		open = false;
	}

	function handleCancel() {
		open = false;
	}
</script>

<Dialog bind:open title={i18n.t('bindingComplex.title', { id: bindingId })}>
	<div class="value-selector-container">
		<div class="config-section">
			<h3 class="section-title">{i18n.t('valueSelector.configTitle')}</h3>
			<p class="section-desc">{i18n.t('bindingComplex.desc', { id: bindingId })}</p>

			<div class="value-input-card">
				{#if draftValue !== null}
					<ComponentEditorValue
						{parsedValueType}
						bind:value={draftValue}
						{initialDataValue}
					/>
				{/if}
			</div>
		</div>
	</div>

	{#snippet footer()}
		<Button variant="ghost" onclick={handleCancel}>{i18n.t('common.cancel')}</Button>
		<Button onclick={handleSave}>{i18n.t('common.apply')}</Button>
	{/snippet}
</Dialog>

<style>
	.value-selector-container {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.config-section {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.section-title {
		margin: 0;
		font-family: var(--scribe-font-heading);
		font-size: var(--scribe-font-size-sm);
		font-weight: var(--scribe-font-weight-semibold);
		color: var(--scribe-doc-foreground);
	}

	.section-desc {
		margin: 0 0 0.625rem;
		font-size: var(--scribe-font-size-sm);
		color: var(--scribe-muted-foreground);
		line-height: 1.4;
	}
</style>
