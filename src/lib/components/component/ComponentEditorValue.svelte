<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import Select from '../utilComponents/Select.svelte';
	import TextInput from '../utilComponents/TextInput.svelte';
	import type { BindingValue, DataValue } from '$lib/domain/data/DataValue.js';
	import { bindingStore } from '$lib/stores/binding-store.svelte.js';
	import { customBindingsStore } from '$lib/stores/custom-bindings-store.svelte.js';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import ComponentEditorValue from './ComponentEditorValue.svelte';
	import Button from '../utilComponents/Button.svelte';
	import { capitalizeStrings } from '$lib/utils/capitalizeStrings.js';

	interface ComponentEditorValueProps {
		parsedValueType: { type: DataValue['type']; bindingType?: string };
		value: unknown;
		componentType: string;
		initialDataValue?: DataValue;
		placeholder?: string;
	}

	let { parsedValueType, value = $bindable(), componentType, initialDataValue, placeholder = 'Value' }: ComponentEditorValueProps = $props();

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
							newDataValue = { type: 'binding', bindingType: valType.bindingType, value: initialVal.value as string } as BindingValue;
						} else {
							newDataValue = { type: valType.type as DataValue['type'], value: initialVal.value } as DataValue;
						}
						recordValue[key] = newDataValue;
					}
				}
			}
		} else if (parsedValueType?.type === 'array') {
			if (!Array.isArray(value)) {
				value = [];
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

	function addArrayItem() {
		if (componentInitialValue?.type === 'array' && componentInitialValue.value.length > 0) {
			const template = JSON.parse(JSON.stringify(componentInitialValue.value[0]));
			value = [...(value as unknown[]), template];
		}
	}

	function removeArrayItem(index: number) {
		if (Array.isArray(value)) {
			value = value.filter((_, i) => i !== index);
		}
	}
</script>

{#if parsedValueType?.type === 'string'}
	<TextInput bind:value={value as string} {placeholder} />
{:else if parsedValueType?.type === 'number'}
	<TextInput 
		value={String(value ?? '')} 
		oninput={(e) => value = Number((e.currentTarget as HTMLInputElement).value)} 
		{placeholder}
		type="number" 
	/>
{:else if parsedValueType?.type === 'boolean'}
	<Select
		{placeholder}
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
					<ComponentEditorValue  
						parsedValueType={valType}
						bind:value={(value as Record<string, DataValue>)[key].value}
						componentType={componentType}
						initialDataValue={initialVal}
						placeholder={capitalizeStrings(key)}
					/>
				{/if}
			{/each}
		{/if}
	</div>
{:else if parsedValueType?.type === 'array'}
	<div class="array-container">
		{#if Array.isArray(value)}
			{#each value as _, index (index)}
				<div class="array-container-item">
					<div class="array-item-content">
						{#if componentInitialValue?.type === 'array' && componentInitialValue.value.length > 0}
							{@const initialVal = componentInitialValue.value[0]}
							{@const valType = { type: initialVal.type, bindingType: initialVal.type === 'binding' ? initialVal.bindingType : undefined }}
							<ComponentEditorValue  
								parsedValueType={valType}
								bind:value={(value as DataValue[])[index].value}
								componentType={componentType}
								initialDataValue={initialVal}
							/>
						{/if}
					</div>
					<Button size="icon-sm" variant="ghost-destructive" title="Remove item" onclick={() => removeArrayItem(index)}>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
					</Button>
				</div>
			{/each}
			<div class="array-actions">
				<Button size="sm" variant="outline" class="array-add-btn" onclick={addArrayItem}>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>				Add Item
				</Button>
			</div>
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
		transition: border-left-color 0.5s ease;
	}
	.record-container:hover {
		border-left-color: var(--scribe-primary);
	}
	.array-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}
	.array-container-item {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: center;
	}
	.array-item-content {
		flex: 1;
		min-width: 0;
	}
	.array-actions {
		display: flex;
		justify-content: center;
		margin-top: 0.25rem;
	}
</style>
