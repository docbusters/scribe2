<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { untrack } from 'svelte';
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
		isStrict?: boolean;
	}

	let { parsedValueType, value = $bindable(), componentType, initialDataValue, placeholder = 'Value', isStrict = true }: ComponentEditorValueProps = $props();

	const componentInitialValue = $derived(initialDataValue ?? globalRegistry.getInitialComponentValue(componentType));

	let lastInitializedValue = $state<unknown>();

	$effect(() => {
		const currentValue = value;
		const pType = parsedValueType?.type;
		const initVal = componentInitialValue;

		untrack(() => {
			if (currentValue === lastInitializedValue) return;

			let newValue = currentValue;
			let changed = false;

			if (pType === 'record') {
				if (!newValue || typeof newValue !== 'object') {
					newValue = {};
					changed = true;
				}
				const recordValue = newValue as Record<string, DataValue>;
				if (initVal?.type === 'record' && isStrict) {
					for (const [key, initialVal] of Object.entries(initVal.value)) {
						if (recordValue[key] === undefined) {
							const valType = { type: initialVal.type, bindingType: initialVal.type === 'binding' ? (initialVal as BindingValue).bindingType : undefined };
							let newDataValue: DataValue;
							if (valType.type === 'binding') {
								newDataValue = { type: 'binding', bindingType: valType.bindingType, value: initialVal.value as string } as BindingValue;
							} else {
								newDataValue = { type: valType.type as DataValue['type'], value: initialVal.value } as DataValue;
							}
							recordValue[key] = newDataValue;
							changed = true;
						}
					}
				}
			} else if (pType === 'array') {
				if (!Array.isArray(newValue)) {
					newValue = [];
					changed = true;
				}
			}

			if (changed && newValue !== value) {
				value = newValue;
			}
			lastInitializedValue = newValue;
		});
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
		if (Array.isArray(value) && value.length > 0) {
			const template = JSON.parse(JSON.stringify(value[value.length - 1]));
			value = [...(value as unknown[]), template];
		} else if (componentInitialValue?.type === 'array' && componentInitialValue.value.length > 0) {
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
		{#if value && typeof value === 'object'}
			{#each Object.keys(value as Record<string, DataValue>) as key, index (index)}
				{@const currentVal = (value as Record<string, DataValue>)[key]}
				{@const isBinding = currentVal.type === 'binding'}
				{@const valType = { type: currentVal.type, bindingType: isBinding ? (currentVal as BindingValue).bindingType : undefined }}
				{@const initialVal = componentInitialValue?.type === 'record' ? componentInitialValue.value[key] : undefined}
				<ComponentEditorValue  
					parsedValueType={valType}
					bind:value={(value as Record<string, DataValue>)[key].value}
					componentType={componentType}
					initialDataValue={initialVal ?? currentVal}
					placeholder={capitalizeStrings(key)}
				/>
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
								isStrict={false}
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
