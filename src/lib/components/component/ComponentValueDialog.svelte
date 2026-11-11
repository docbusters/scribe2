<script lang="ts">
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import { valueDialogStore } from '$lib/stores/value-dialog-store.svelte.js';
	import Dialog from '../utilComponents/Dialog.svelte';
	import Button from '../utilComponents/Button.svelte';
	import type { BindingValue, DataValue } from '$lib/domain/data/DataValue.js';
	import { editStore } from '$lib/stores/edit-store.svelte.js';
	import { customBindingsStore } from '$lib/stores/custom-bindings-store.svelte.js';
	import ComponentEditorValue from './ComponentEditorValue.svelte';
		import ScrollArea from '../utilComponents/ScrollArea.svelte';
	import DataTypeCard from '../utilComponents/DataTypeCard.svelte';
	import { getI18n } from '$lib/i18n/i18n.svelte.js';
	import { untrack } from 'svelte';

	const i18n = getI18n();

	interface ValueSourceOption {
		value: string;
		type: DataValue['type'];
		bindingType?: string;
		label: string;
		category: 'binding' | 'static';
		description?: string;
	}

	/** The component being edited, or null when the dialog is closed or the component no longer exists */
	const component = $derived.by(() => {
		const target = valueDialogStore.target;
		return target ? editStore.getComponent(target.sectionId, target.componentId) : null;
	});

	const supportedValues = $derived.by<ValueSourceOption[]>(() => {
		if (!component) return [];

		const baseValues = globalRegistry.getComponentValueTypes(component.type);
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
				const supportedBindingTypes = globalRegistry.getComponentSupportedBindingValueTypes(component.type);
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

	// Loads the value of the component every time the dialog is opened for one
	$effect(() => {
		const target = valueDialogStore.target;
		if (!target) return;

		untrack(() => {
			const current = editStore.getComponent(target.sectionId, target.componentId);
			if (!current) {
				valueDialogStore.close();
				return;
			}

			if (current.value.type === 'binding') {
				const bv = current.value as BindingValue;
				valueType = JSON.stringify({ type: 'binding', bindingType: bv.bindingType || 'default' });
				value = bv.value;
			} else {
				valueType = JSON.stringify({ type: current.value.type });
				// We must deep clone the value in order to avoid mofifying the original data while editing
				value = $state.snapshot(current.value.value);
			}
		});
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
		const target = valueDialogStore.target;
		if (!target || !parsedValueType || value === undefined) return;
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

		editStore.setComponentValue(target.sectionId, target.componentId, parsedValue);
		valueDialogStore.close();
	}
</script>

<Dialog bind:open={() => valueDialogStore.isOpen, (isOpen) => { if (!isOpen) valueDialogStore.close(); }} title={i18n.t('valueSelector.typeTitle')}>
	{#if component}
		<div class="value-selector-container">
			<div class="config-section">
				<p class="section-desc">{i18n.t('valueSelector.typeDesc')}</p>

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
				<div class="config-section">
					<div class="section-header">
						<h3 class="section-title">{i18n.t('valueSelector.configTitle')}</h3>
						<p class="section-desc">{i18n.t('valueSelector.configDesc')}</p>
					</div>

					<ScrollArea
						orientation="vertical"
						class="value-config-scrollarea"
						viewportClasses="value-config-viewport"
					>
						<div class="input-wrapper">
							<ComponentEditorValue
								{parsedValueType}
								bind:value={value}
								componentType={component.type}
							/>
						</div>
					</ScrollArea>
				</div>
			{/if}
		</div>
	{/if}

	{#snippet footer()}
		<Button variant="ghost" onclick={() => valueDialogStore.close()}>{i18n.t('common.cancel')}</Button>
		<Button onclick={handleSetValue}>{i18n.t('common.apply')}</Button>
	{/snippet}
</Dialog>

<style>
	.value-selector-container {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.config-section {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.section-header {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.section-title {
		margin: 0;
		font-family: var(--scribe-font-heading);
		font-size: var(--scribe-font-size-sm);
		font-weight: var(--scribe-font-weight-semibold);
		color: var(--scribe-doc-foreground);
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

	:global(.value-config-scrollarea) {
		max-height: min(340px, 45vh);
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
