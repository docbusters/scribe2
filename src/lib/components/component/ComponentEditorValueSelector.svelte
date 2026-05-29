<script lang="ts">
	import { type ComponentEditProps } from '$lib/registry/ComponentEditOptions.js';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import ComponentEditorButton from './ComponentEditorButton.svelte';
	import Select from '../utilComponents/Select.svelte';
	import TextInput from '../utilComponents/TextInput.svelte';
	import Dialog from '../utilComponents/Dialog.svelte';
	import Button from '../utilComponents/Button.svelte';
	import type { BindingValue, DataValue } from '$lib/domain/data/DataValue.js';
	import { dataStore } from '$lib/stores/data-store.svelte.js';
	import { editStore } from '$lib/stores/edit-store.svelte.js';
	import { customBindingsStore } from '$lib/stores/custom-bindings-store.svelte.js';

	let props: ComponentEditProps = $props();

	const supportedValues = $derived.by(() => {
		const baseValues = globalRegistry.getComponentValueTypes(props.componentType);
		const options = [];
		for (const type of baseValues) {
			// NOTE: We use stringified values in order to know the binding type
			if (type === 'binding') {
				options.push({ value: JSON.stringify({ type: 'binding', bindingType: 'default' }), label: 'Default Binding' });
				const customBindings = customBindingsStore.getBindingsList();
				for (const cb of customBindings) {
					options.push({ value: JSON.stringify({ type: 'binding', bindingType: cb.type }), label: cb.name });
				}
			} else {
				options.push({ value: JSON.stringify({ type }), label: type });
			}
		}
		return options;
	});

	let open = $state(false);
	let valueType = $state<string>();
	let value = $state<DataValue['value']>();

	let parsedValueType = $derived.by(() => {
		if (!valueType) return null;
		try {
			return JSON.parse(valueType);
		} catch {
			return null;
		}
	});

	let bindingOptions = $derived.by(() => {
		if (parsedValueType?.type !== 'binding') return [];
		const type = parsedValueType.bindingType;
		if (type === 'default') {
			return dataStore.getBindingOptions();
		}
		return customBindingsStore.getAvailableIds(type);
	});

	function handleSetValue() {
		if (!parsedValueType || value === undefined) return;

		let parsedValue: DataValue;

		if (parsedValueType.type === 'binding') {
			parsedValue = { type: 'binding', bindingType: parsedValueType.bindingType, value: value as string } as BindingValue;
		} else {
			parsedValue = { type: parsedValueType.type as DataValue['type'], value: value } as DataValue;
			if (parsedValueType.type === 'number') parsedValue.value = Number(value);
		}

		editStore.setComponentValue(props.sectionId, props.componentId, parsedValue);
		open = false;
	}
</script>

<ComponentEditorButton
	icon={props.icon}
	name={props.name}
	disabled={props.disabled}
	onclick={() => {
		if (props.componentValue.type === 'binding') {
			const bv = props.componentValue as BindingValue;
			valueType = JSON.stringify({ type: 'binding', bindingType: bv.bindingType || 'default' });
			value = bv.value;
		} else {
			valueType = JSON.stringify({ type: props.componentValue.type });
			value = props.componentValue.value;
		}
		open = true;
	}}
	isSelected={props.isSelected}
/>

<Dialog bind:open title="Set new value">
	<Select
		placeholder="Select value type"
		type="single"
		bind:value={valueType}
		items={supportedValues}
	/>

	{#if parsedValueType?.type === 'string'}
		<TextInput bind:value={value as string} placeholder="Value" />
	{:else if parsedValueType?.type === 'number'}
		<TextInput bind:value={value as string} placeholder="Value" type="number" />
	{:else if parsedValueType?.type === 'boolean'}
		<Select
			placeholder="Value"
			type="single"
			bind:value={value as string}
			items={[
				{ value: 'true', label: 'True' },
				{ value: 'false', label: 'False' }
			]}
		/>
	{:else if parsedValueType?.type === 'binding'}
		<Select
			placeholder="Binding ID"
			type="single"
			bind:value={value as string}
			items={bindingOptions}
		/>
	{/if}

	{#snippet footer()}
		<Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
		<Button onclick={handleSetValue}>Set value</Button>
	{/snippet}
</Dialog>

<style>
</style>
