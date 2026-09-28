<script lang="ts">
	import Dialog from '../utilComponents/Dialog.svelte';
	import Button from '../utilComponents/Button.svelte';
	import { editStore } from '$lib/stores/edit-store.svelte.js';
	import { bindingStore } from '$lib/stores/binding-store.svelte.js';
	import type { DataValue } from '$lib/domain/data/DataValue.js';
	import { generateDefaultDataValue } from '$lib/utils/generateDefaultDataValue.js';
	import type { BindingsDefinition } from '$lib/domain/Document.js';
	import TextInput from '../utilComponents/TextInput.svelte';
	import DataTypeCard from '../utilComponents/DataTypeCard.svelte';
	import { getI18n } from '$lib/i18n/i18n.svelte.js';

	interface AddBindingDialogProps {
		open: boolean;
	}

	let { open = $bindable(false) }: AddBindingDialogProps = $props();

	const i18n = getI18n();

	let bindingId = $state('');
	let bindingType = $state<string>('string');
	let error = $state<string | null>(null);

	const typeOptions = $derived([
		{ type: 'string', label: i18n.t('types.string'), description: i18n.t('types.stringDesc') },
		{ type: 'number', label: i18n.t('types.number'), description: i18n.t('types.numberDesc') },
		{ type: 'boolean', label: i18n.t('types.boolean'), description: i18n.t('types.booleanDesc') },
		{ type: 'date', label: i18n.t('types.date'), description: i18n.t('types.dateDesc') },
		{ type: 'array', label: i18n.t('types.array'), description: i18n.t('types.arrayDesc') },
		{ type: 'record', label: i18n.t('types.record'), description: i18n.t('types.recordDesc') }
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

		<div class="type-section">
			<span class="type-section-label">{i18n.t('addBinding.typeLabel')}</span>
			<div class="sources-grid">
				{#each typeOptions as option (option.type)}
					<DataTypeCard
						type={option.type}
						label={option.label}
						description={option.description}
						selected={bindingType === option.type}
						onclick={() => (bindingType = option.type)}
					/>
				{/each}
			</div>
		</div>
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
		padding: 0.5rem 0 0.5rem 0;
	}

	.type-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.type-section-label {
		font-family: var(--scribe-font-sans, system-ui, sans-serif);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--scribe-muted-foreground);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.sources-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
		width: 100%;
	}

	@media (max-width: 480px) {
		.sources-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
