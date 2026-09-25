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

	interface AddBindingDialogProps {
		open: boolean;
	}

	let { open = $bindable(false) }: AddBindingDialogProps = $props();

	let bindingId = $state('');
	let bindingType = $state<string>('string');
	let error = $state<string | null>(null);

	const typeItems = [
		{ value: 'string', label: 'String' },
		{ value: 'number', label: 'Number' },
		{ value: 'boolean', label: 'Boolean' },
		{ value: 'date', label: 'Date' },
		{ value: 'array', label: 'Array' },
		{ value: 'record', label: 'Record' }
	];

	function handleCreate() {
		const trimmed = bindingId.trim();
		if (!trimmed) {
			error = 'Binding ID is required';
			return;
		}

		if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
			error = 'ID can only contain letters, numbers, hyphens, and underscores';
			return;
		}

		if (trimmed in bindingStore.data || (editStore.bindings && trimmed in editStore.bindings)) {
			error = `Binding "${trimmed}" already exists`;
			return;
		}

		const defaultVal = generateDefaultDataValue(bindingType as DataValue['type']);
		const definition: BindingsDefinition = {
			type: bindingType as any,
			initialValue: (defaultVal as any).value
		} as BindingsDefinition;

		const success = editStore.createBinding(trimmed, definition);
		if (success) {
			bindingId = '';
			bindingType = 'string';
			error = null;
			open = false;
		} else {
			error = 'Failed to create binding';
		}
	}

	function handleCancel() {
		error = null;
		bindingId = '';
		open = false;
	}
</script>

<Dialog bind:open title="Add New Binding">
	<div class="add-binding-container">
		<TextInput
			id="binding-id-input"
			type="text"
			{error}
			placeholder="Binding name"
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
			placeholder="Data Type"
			type="single"
			bind:value={bindingType}
			items={typeItems}
		/>
	</div>

	{#snippet footer()}
		<Button variant="ghost" onclick={handleCancel}>Cancel</Button>
		<Button onclick={handleCreate}>Create Binding</Button>
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
