<script lang="ts">
	import { type ComponentEditProps } from '$lib/registry/ComponentEditOptions.js';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import ComponentEditorButton from './ComponentEditorButton.svelte';
	import Dialog from '../utilComponents/Dialog.svelte';
	import Button from '../utilComponents/Button.svelte';
	import type { BindingValue, DataValue } from '$lib/domain/data/DataValue.js';
	import { editStore } from '$lib/stores/edit-store.svelte.js';
	import { customBindingsStore } from '$lib/stores/custom-bindings-store.svelte.js';
	import ComponentEditorValue from './ComponentEditorValue.svelte';
	import Divider from '../utilComponents/Divider.svelte';
	import ScrollArea from '../utilComponents/ScrollArea.svelte';
	import DataTypeCard from '../utilComponents/DataTypeCard.svelte';
	import { getI18n } from '$lib/i18n/i18n.svelte.js';

	let props: ComponentEditProps = $props();
	const i18n = getI18n();

	interface ValueSourceOption {
		value: string;
		type: DataValue['type'];
		bindingType?: string;
		label: string;
		category: 'binding' | 'static';
		description?: string;
	}

	const supportedValues = $derived.by<ValueSourceOption[]>(() => {
		const baseValues = globalRegistry.getComponentValueTypes(props.componentType);
		const options: ValueSourceOption[] = [];
		for (const type of baseValues) {
			// NOTE: We use stringified values in order to know the binding type
			if (type === 'binding') {
				options.push({
					value: JSON.stringify({ type: 'binding', bindingType: 'default' }),
					type: 'binding',
					bindingType: 'default',
					label: i18n.t('types.bindingDefault'),
					category: 'binding',
					description: i18n.t('types.bindingDefaultDesc')
				});
				const customBindings = customBindingsStore.getBindingsList();
				const supportedBindingTypes = globalRegistry.getComponentSupportedBindingValueTypes(props.componentType);
				for (const cb of customBindings) {
					const availableIds = customBindingsStore.getAvailableIds(cb.type, supportedBindingTypes);
					const hasSupportedValues = availableIds.length === 0 || availableIds.some(item => !item.disabled);
					// We only add to the list binding types that contain supported values
					if (hasSupportedValues) {
						options.push({
							value: JSON.stringify({ type: 'binding', bindingType: cb.type }),
							type: 'binding',
							bindingType: cb.type,
							label: cb.name,
							category: 'binding',
							description: cb.description || i18n.t('types.bindingCustomDesc')
						});
					}
				}
			} else {
				const labelMap: Record<string, string> = {
					string: i18n.t('types.string'),
					number: i18n.t('types.number'),
					boolean: i18n.t('types.boolean'),
					record: i18n.t('types.record'),
					array: i18n.t('types.array'),
					date: i18n.t('types.date'),
					empty: i18n.t('types.empty')
				};
				const descMap: Record<string, string> = {
					string: i18n.t('types.stringDesc'),
					number: i18n.t('types.numberDesc'),
					boolean: i18n.t('types.booleanDesc'),
					record: i18n.t('types.recordDesc'),
					array: i18n.t('types.arrayDesc'),
					date: i18n.t('types.dateDesc'),
					empty: i18n.t('types.emptyDesc')
				};
				options.push({
					value: JSON.stringify({ type }),
					type,
					label: labelMap[type] || type,
					category: 'static',
					description: descMap[type] || ''
				});
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

	function handleSelectValueType(newValType: string) {
		if (valueType === newValType) return;
		valueType = newValType;

		// Initialize default value when switching source type if type is incompatible
		try {
			const parsed = JSON.parse(newValType) as { type: DataValue['type']; bindingType?: string };
			if (parsed.type === 'binding') {
				if (typeof value !== 'string') {
					value = '';
				}
			} else if (parsed.type === 'string' && typeof value !== 'string') {
				value = '';
			} else if (parsed.type === 'number' && typeof value !== 'number') {
				value = 0;
			} else if (parsed.type === 'boolean' && typeof value !== 'boolean') {
				value = false;
			}
		} catch {
			// Ignore parse error
		}
	}

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

<Dialog bind:open title={i18n.t('valueSelector.typeTitle')}>
	<div class="value-selector-container">
		<div class="config-section">
			<div class="section-header">
				<div class="title-with-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
					<h5>{i18n.t('valueSelector.typeTitle')}</h5>
				</div>
				<p class="section-desc">{i18n.t('valueSelector.typeDesc')}</p>
			</div>
			
			<div class="sources-grid">
				{#each supportedValues as option (option.value)}
					<DataTypeCard
						type={option.type}
						bindingType={option.bindingType}
						category={option.category}
						label={option.label}
						description={option.description}
						selected={valueType === option.value}
						onclick={() => handleSelectValueType(option.value)}
					/>
				{/each}
			</div>
		</div>

		{#if parsedValueType}
			<Divider />
			
			<div class="config-section">
				<div class="section-header">
					<div class="title-with-icon">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-icon"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
						<h5>{i18n.t('valueSelector.configTitle')}</h5>
					</div>
					<p class="section-desc">{i18n.t('valueSelector.configDesc')}</p>
				</div>
				
				<ScrollArea
					orientation="vertical"
					class="value-config-scrollarea"
					viewportClasses="value-config-viewport"
				>
					<div class={parsedValueType.type === 'record' || parsedValueType.type === 'array' ? 'value-input-card' : 'input-wrapper'}>
						<ComponentEditorValue
							{parsedValueType}
							bind:value={value}
							componentType={props.componentType}
						/>
					</div>
				</ScrollArea>
			</div>
		{/if}
	</div>

	{#snippet footer()}
		<Button variant="ghost" onclick={() => (open = false)}>{i18n.t('common.cancel')}</Button>
		<Button onclick={handleSetValue}>{i18n.t('common.apply')}</Button>
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

	:global(.value-config-scrollarea) {
		max-height: 280px;
		width: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	:global(.value-config-viewport) {
		width: 100%;
		height: 100%;
		min-height: 0;
		padding-right: 0.5rem;
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
