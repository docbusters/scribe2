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
							description: i18n.t('types.bindingCustomDesc')
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
					{@const isSelected = valueType === option.value}
					<button
						type="button"
						class="source-card"
						class:selected={isSelected}
						onclick={() => handleSelectValueType(option.value)}
					>
						<div class="source-card-icon-wrap" class:is-binding={option.category === 'binding'}>
							{#if option.type === 'binding'}
								{#if option.bindingType === 'default'}
									<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
								{/if}
							{:else if option.type === 'string'}
								<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>
							{:else if option.type === 'number'}
								<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
							{:else if option.type === 'boolean'}
								<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></svg>
							{:else if option.type === 'array'}
								<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
							{:else if option.type === 'record'}
								<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
							{:else if option.type === 'date'}
								<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
							{/if}
						</div>

						<div class="source-card-text">
							<span class="source-card-label">{option.label}</span>
							{#if option.description}
								<span class="source-card-desc">{option.description}</span>
							{/if}
						</div>

						{#if isSelected}
							<div class="source-selected-badge">
								<svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
							</div>
						{/if}
					</button>
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
		padding-right: 0.25rem;
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

	.source-card {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.65rem;
		background-color: var(--scribe-popover);
		border: 1.5px solid color-mix(in srgb, var(--scribe-border-color) 70%, transparent);
		border-radius: var(--scribe-radius-md);
		cursor: pointer;
		text-align: left;
		transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
		box-sizing: border-box;
	}

	.source-card:hover {
		background-color: var(--scribe-muted);
		border-color: color-mix(in srgb, var(--scribe-border-color) 30%, var(--scribe-primary));
		transform: translateY(-1px);
		box-shadow: var(--scribe-shadow-sm);
	}

	.source-card.selected {
		border-color: var(--scribe-accent, var(--scribe-primary));
		background-color: color-mix(in srgb, var(--scribe-accent) 8%, var(--scribe-popover));
		box-shadow: 0 0 0 1px var(--scribe-accent, var(--scribe-primary));
	}

	.source-card-icon-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: var(--scribe-radius-sm);
		background-color: color-mix(in srgb, var(--scribe-muted) 80%, transparent);
		color: var(--scribe-doc-foreground);
		flex-shrink: 0;
		transition: all 0.18s ease;
	}

	.source-card-icon-wrap.is-binding {
		background-color: color-mix(in srgb, var(--scribe-accent, #3b82f6) 14%, transparent);
		color: var(--scribe-accent, #3b82f6);
	}

	.source-card.selected .source-card-icon-wrap {
		background-color: var(--scribe-accent, var(--scribe-primary));
		color: var(--scribe-primary-foreground, #ffffff);
	}

	.source-card-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
	}

	.source-card-label {
		font-family: var(--scribe-font-sans, system-ui, sans-serif);
		font-size: var(--scribe-font-size-xs, 0.8125rem);
		font-weight: var(--scribe-font-weight-semibold, 600);
		color: var(--scribe-doc-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.source-card-desc {
		font-size: 0.65rem;
		color: var(--scribe-muted-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.source-selected-badge {
		position: absolute;
		top: -0.3rem;
		right: -0.3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		border-radius: 9999px;
		background-color: var(--scribe-accent, var(--scribe-primary));
		color: var(--scribe-primary-foreground, #ffffff);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}
</style>
