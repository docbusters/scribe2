<script lang="ts">
	import Select from '../utilComponents/Select.svelte';
	import TextInput from '../utilComponents/TextInput.svelte';
	import type { BindingValue, DataValue } from '$lib/domain/data/DataValue.js';
	import { bindingStore } from '$lib/stores/binding-store.svelte.js';
	import { customBindingsStore } from '$lib/stores/custom-bindings-store.svelte.js';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import ComponentEditorValue from './ComponentEditorValue.svelte';

	interface ComponentEditorValueProps {
		parsedValueType: { type: DataValue['type']; bindingType?: string };
		value: unknown;
		componentType: string;
		initialDataValue?: DataValue;
	}

	let { parsedValueType, value = $bindable(), componentType, initialDataValue }: ComponentEditorValueProps = $props();

	const componentInitialValue = $derived(initialDataValue ?? globalRegistry.getInitialComponentValue(componentType));

	$effect(() => {
		if (parsedValueType?.type === 'record') {
			if (!value || typeof value !== 'object') {
				value = {};
			}
			const recordValue = value as Record<string, DataValue>;
			if (componentInitialValue?.type === 'record') {
				for (const [key, initialVal] of Object.entries(componentInitialValue.value)) {
					if (recordValue[key] === undefined) {
						const valType = { type: initialVal.type, bindingType: initialVal.type === 'binding' ? initialVal.bindingType : undefined };
						let newDataValue: DataValue;
						if (valType.type === 'binding') {
							newDataValue = { type: 'binding', bindingType: valType.bindingType, value: initialVal.value as string, valueType: initialVal.type } as BindingValue;
						} else {
							newDataValue = { type: valType.type as DataValue['type'], value: initialVal.value } as DataValue;
						}
						recordValue[key] = newDataValue;
					}
				}
			}
		}
	});

	let bindingOptions = $derived.by(() => {
		if (parsedValueType?.type !== 'binding') return [];
		const type = parsedValueType.bindingType;
		const supportedTypes = globalRegistry.getComponentSupportedBindingValueTypes(componentType);
		if (type === 'default' || !type) {
			return bindingStore.getBindingOptions(supportedTypes);
		}
		return customBindingsStore.getAvailableIds(type, supportedTypes);
	});
</script>

{#if parsedValueType?.type === 'string'}
	<TextInput bind:value={value as string} placeholder="Value" />
{:else if parsedValueType?.type === 'number'}
	<TextInput 
		value={String(value ?? '')} 
		oninput={(e) => value = Number((e.currentTarget as HTMLInputElement).value)} 
		placeholder="Value" 
		type="number" 
	/>
{:else if parsedValueType?.type === 'boolean'}
	<Select
		placeholder="Value"
		type="single"
		value={String(value ?? '')}
		onValueChange={(v) => value = (v === 'true')}
		items={[
			{ value: 'true', label: 'True' },
			{ value: 'false', label: 'False' }
		]}
	/>
{:else if parsedValueType?.type === 'record'}
	<div class="record-container">
		{#if componentInitialValue?.type === 'record'}
			{#each Object.entries(componentInitialValue.value) as [key, initialVal], index (index)}
				{@const valType = { type: initialVal.type, bindingType: initialVal.type === 'binding' ? initialVal.bindingType : undefined }}
				{#if value && typeof value === 'object' && (value as Record<string, DataValue>)[key]}
					<div class="record-field">
						<span class="record-label">{key}</span>
						<ComponentEditorValue  
							parsedValueType={valType}
							bind:value={(value as Record<string, DataValue>)[key].value}
							componentType={componentType}
							initialDataValue={initialVal}
						/>
					</div>
				{/if}
			{/each}
		{/if}
	</div>
{:else if parsedValueType?.type === 'binding'}
	<Select
		placeholder="Binding ID"
		type="single"
		bind:value={value as string}
		items={bindingOptions}
	/>
{/if}

<style>
	.record-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding-left: 0.5rem;
		border-left: 2px solid var(--scribe-border-color, #e2e8f0);
		margin-top: 0.5rem;
	}
	.record-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.record-label {
		font-size: 0.75rem;
		color: var(--scribe-muted-foreground);
		text-transform: capitalize;
		font-weight: 500;
	}
</style>
