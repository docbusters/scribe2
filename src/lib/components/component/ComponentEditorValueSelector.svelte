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

	let props: ComponentEditProps = $props();

	const supportedValues = $derived(
		globalRegistry.getComponentValueTypes(props.componentType).map((valueType) => ({
			value: valueType,
			label: valueType
		}))
	);

	let open = $state(false);
	let valueType = $state<DataValue['type']>();
	let value = $state<DataValue['value']>();
	let bindingOptions = $derived(dataStore.getBindingOptions());

	function handleSetValue() {
    if (!valueType || value === undefined) return;

    const parsedValue = { type: valueType, value: value } as DataValue;

    switch (valueType) {
      case 'number':
        parsedValue.value = Number(value);
        break;
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
		valueType = props.componentValue.type;
		value = props.componentValue.value;
		open = true;
	}}
/>

<Dialog bind:open title="Set new value">
	<Select
		placeholder="Select value type"
		type="single"
		bind:value={valueType}
		items={supportedValues}
	/>

	{#if valueType === 'string'}
		<TextInput bind:value={value as string} placeholder="Value" />
	{:else if valueType === 'number'}
		<TextInput bind:value={value as string} placeholder="Value" type="number" />
	{:else if valueType === 'boolean'}
		<Select
			placeholder="Value"
			type="single"
			bind:value={valueType}
			items={[
				{ value: 'true', label: 'True' },
				{ value: 'false', label: 'False' }
			]}
		/>
	{:else if valueType === 'binding'}
		<Select
			placeholder="Binding"
			type="single"
			bind:value={value as BindingValue['value']}
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
