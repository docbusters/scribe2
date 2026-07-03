<script lang="ts">
	import { type ComponentEditProps } from '$lib/registry/ComponentEditOptions.js';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import ComponentEditorButton from './ComponentEditorButton.svelte';
	import Select from '../utilComponents/Select.svelte';
	import Dialog from '../utilComponents/Dialog.svelte';
	import Button from '../utilComponents/Button.svelte';
	import type { BindingValue, DataValue } from '$lib/domain/data/DataValue.js';
	import { editStore } from '$lib/stores/edit-store.svelte.js';
	import { customBindingsStore } from '$lib/stores/custom-bindings-store.svelte.js';
	import ComponentEditorValue from './ComponentEditorValue.svelte';
	import Divider from '../utilComponents/Divider.svelte';

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
			return JSON.parse(valueType) as { type: DataValue['type']; bindingType?: string };
		} catch {
			return null;
		}
	});

	function handleSetValue() {
		if (!parsedValueType || value === undefined) return;
		if (parsedValueType.type === 'empty') {
			value = undefined;
		}

		let parsedValue: DataValue;

		if (parsedValueType.type === 'binding') {

			parsedValue = { 
				type: 'binding', 
				bindingType: parsedValueType.bindingType, 
				value: $state.snapshot(value) as string, 
			} as BindingValue;
		} else {
			
			parsedValue = { type: parsedValueType.type as DataValue['type'], value: $state.snapshot(value) } as DataValue;
			if (parsedValueType.type === 'number') {
				parsedValue.value = Number($state.snapshot(value));
			} 
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
			// We must deep clone the value in order to avoid mofifying the original data while editing
			value = $state.snapshot(props.componentValue.value);
		}
		open = true;
	}}
	isSelected={props.isSelected}
/>

<Dialog bind:open title="Configure Value">
	<div class="value-selector-container">
		<div class="config-section">
			<div class="section-header">
				<div class="title-with-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
					<h5>Value Source</h5>
				</div>
				<p class="section-desc">Select the type of data or binding to use for this property.</p>
			</div>
			
			<div class="input-wrapper">
				<Select
					placeholder="Select value type"
					type="single"
					bind:value={valueType}
					items={supportedValues}
				/>
			</div>
		</div>

		{#if parsedValueType}
			<Divider />
			
			<div class="config-section">
				<div class="section-header">
					<div class="title-with-icon">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-icon"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
						<h5>Value Configuration</h5>
					</div>
					<p class="section-desc">Configure the actual value or binding parameters.</p>
				</div>
				
				<div class={parsedValueType.type === 'record' || parsedValueType.type === 'array' ? 'value-input-card' : 'input-wrapper'}>
					<ComponentEditorValue
						{parsedValueType}
						bind:value={value}
						componentType={props.componentType}
					/>
				</div>
			</div>
		{/if}
	</div>

	{#snippet footer()}
		<Button variant="ghost" onclick={() => (open = false)}>Cancel</Button>
		<Button onclick={handleSetValue}>Apply Changes</Button>
	{/snippet}
</Dialog>

<style>
	.value-selector-container {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 0.5rem 0;
	}

	.config-section {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.section-header {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.title-with-icon {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.section-icon {
		color: var(--scribe-primary, #3b82f6);
	}

	h5 {
		margin: 0;
		font-family: var(--scribe-font-heading);
		font-size: var(--scribe-font-size-md);
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--scribe-text-color);
	}

	.section-desc {
		margin: 0;
		font-size: var(--scribe-font-size-sm);
		color: var(--scribe-muted-foreground);
		line-height: 1.4;
	}

	.input-wrapper {
		display: flex;
		flex-direction: column;
	}

	.value-input-card {
		padding: 1.25rem;
		border: 1px solid var(--scribe-border-color);
		border-radius: var(--scribe-radius-lg);
		background-color: var(--scribe-background);
		box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
	}
</style>
