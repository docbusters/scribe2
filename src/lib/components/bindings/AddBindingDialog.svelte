<script lang="ts">
	import Dialog from '../utilComponents/Dialog.svelte';
	import Button from '../utilComponents/Button.svelte';
	import Select from '../utilComponents/Select.svelte';
	import { editStore } from '$lib/stores/edit-store.svelte.js';
	import { bindingStore } from '$lib/stores/binding-store.svelte.js';
	import type { DataValue } from '$lib/domain/data/DataValue.js';
	import { generateDefaultDataValue } from '$lib/utils/generateDefaultDataValue.js';
	import type { BindingsDefinition } from '$lib/domain/Document.js';
	import TextInput from '../utilComponents/TextInput.svelte';
	import { getI18n } from '$lib/i18n/i18n.svelte.js';

	interface AddBindingDialogProps {
		open: boolean;
	}

	let { open = $bindable(false) }: AddBindingDialogProps = $props();

	const i18n = getI18n();

	let bindingId = $state('');
	let bindingType = $state<string>('string');
	let error = $state<string | null>(null);

	const typeItems = $derived([
		{ value: 'string', label: i18n.t('types.string') },
		{ value: 'number', label: i18n.t('types.number') },
		{ value: 'boolean', label: i18n.t('types.boolean') },
		{ value: 'date', label: i18n.t('types.date') },
		{ value: 'array', label: i18n.t('types.array') },
		{ value: 'record', label: i18n.t('types.record') }
	]);

	function handleCreate() {
		const trimmed = bindingId.trim();
		if (!trimmed) {
			error = i18n.t('addBinding.errorRequired');
			return;
		}

		if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
			error = i18n.t('addBinding.errorFormat');
			return;
		}

		if (trimmed in bindingStore.data || (editStore.bindings && trimmed in editStore.bindings)) {
			error = i18n.t('addBinding.errorExists', { name: trimmed });
			return;
		}

		const defaultVal = generateDefaultDataValue(bindingType as DataValue['type']);
		const definition: BindingsDefinition = {
			type: bindingType,
			initialValue: 'value' in defaultVal ? defaultVal.value : undefined
		} as unknown as BindingsDefinition;

		const success = editStore.createBinding(trimmed, definition);
		if (success) {
			bindingId = '';
			bindingType = 'string';
			error = null;
			open = false;
		} else {
			error = i18n.t('addBinding.errorRequired');
		}
	}

	function handleCancel() {
		error = null;
		bindingId = '';
		open = false;
	}
</script>

<Dialog bind:open title={i18n.t('addBinding.title')}>
	<div class="add-binding-container">
		<TextInput
			id="binding-id-input"
			type="text"
			{error}
			placeholder={i18n.t('addBinding.namePlaceholder')}
			bind:value={bindingId}
			oninput={() => (error = null)}
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					handleCreate();
				}
			}}
		/>

		<Select
			id="binding-type-select"
			placeholder={i18n.t('addBinding.typeLabel')}
			type="single"
			bind:value={bindingType}
			items={typeItems}
		/>
	</div>

	{#snippet footer()}
		<Button variant="ghost" onclick={handleCancel}>{i18n.t('common.cancel')}</Button>
		<Button onclick={handleCreate}>{i18n.t('addBinding.create')}</Button>
	{/snippet}
</Dialog>

<style>
	.add-binding-container {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: 0.5rem 0 1rem 0;
	}
</style>
