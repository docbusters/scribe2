<svelte:options
	customElement={{
		tag: 'scribe-component-renderer',
		shadow: 'none',
		props: {
			mode: { type: 'String' },
			isDarkMode: { type: 'Boolean' },
			componentData: { type: 'Object' },
			sectionId: { type: 'String' },
			disabledOptions: { type: 'Array' }
		}
	}}
/>

<script lang="ts">
	import type { CollectionValue, DataValue, PrimitiveValue } from "$lib/domain/data/DataValue.js";
	import { bindingStore } from "$lib/stores/binding-store.svelte.js";
	import { editStore } from "$lib/stores/edit-store.svelte.js";
	import { selectionStore } from "$lib/stores/selection-store.svelte.js";
	import { globalRegistry } from "$lib/stores/global-registry.svelte.js";
	import type { ComponentRendererProps } from "$lib/types/CustomRendererProps.js";
	import type { UpdateType } from "$lib/types/ScribeProps.js";
	import type { Action } from 'svelte/action';
	import type { ScribeComponentProps } from "$lib/registry/ComponentRegistry.js";
	import type { BaseComponent, ComponentConfig } from "$lib/domain/components/Component.js";
	import Skeleton from "../utilComponents/Skeleton.svelte";
	import EmptyContent from "../utilComponents/EmptyContent.svelte";
	import { getI18n } from "$lib/i18n/i18n.svelte.js";

    let { mode, componentData, sectionId, disabledOptions = [], isDarkMode }: ComponentRendererProps = $props();
    const i18n = getI18n();

	let componentSupportedTypes = $derived({ types: globalRegistry.getComponentValueTypes(componentData.type), bindingTypes: globalRegistry.getComponentSupportedBindingValueTypes(componentData.type) });
	let resolvedValue = $derived.by(() => {
		const { types, bindingTypes } = componentSupportedTypes;

		try {
			if (!types.includes(componentData.value.type)) {
				throw new Error(`Unsupported value type: ${componentData.value.type}`);
			}

			if (componentData.value.type === 'binding') {
				const bindingResult = bindingStore.getBindingValue(componentData.value.value, componentData.value.bindingType);

				if (bindingResult instanceof Promise) {
					return bindingResult.then(bindingValue => {
						if (!bindingTypes.includes(bindingValue.type)) {
							console.error(`Component ${componentData.type} does not support binding value type ${bindingValue.type}`, { componentData, bindingValue });
							throw new Error(`Unsupported binding value type: ${bindingValue.type}`);
						}
						return { value: bindingValue, isBinding: true };
					});
				} else {
					if (!bindingTypes.includes(bindingResult.type)) {
						console.error(`Component ${componentData.type} does not support binding value type ${bindingResult.type}`, { componentData, result: bindingResult });
						throw new Error(`Unsupported binding value type: ${bindingResult.type}`);
					}
					return { value: bindingResult, isBinding: true };
				}
			}
			
			return { value: componentData.value, isBinding: false };
		} catch (error) {
			return Promise.reject(error);
		}
	});

	
	function updateComponentValue(newValue: DataValue, updateType: UpdateType) {
		const { types, bindingTypes } = componentSupportedTypes;

		if (componentData.value.type === 'binding') {
			// Bindings can be updated in any mode
			if (!bindingTypes.includes(newValue.type)) {
				throw new Error(`Updated value type ${newValue.type} is not supported by component's binding`);
			}

			bindingStore.updateBindingValue(mode, componentData.value.value, componentData.value.bindingType, updateType, newValue as PrimitiveValue | CollectionValue);
		} else {
			// Other data values can only be updated in edit mode
			if (mode !== 'edit') {
				throw new Error(`Value ${newValue.type} cannot be updated in mode ${mode}`);
			}
			if (!types.includes(newValue.type)) {
				throw new Error(`Updated value type ${newValue.type} is not supported by component`);
			}
			
			editStore.setComponentValue(sectionId, componentData.id, newValue);
		}
	}

	function updateComponentConfig(newConfig: ComponentConfig) {
		editStore.setComponentConfig(sectionId, componentData.id, newConfig);
	}

	/**
	 * Selects this component when the event comes from it. Nested components are handled by their own renderer,
	 * so only the innermost wrapper reacts. The event is never prevented or stopped, so the component keeps
	 * its native behaviour (caret placement, dragging, resizing...).
	 */
	function handleSelect(event: Event) {
		if (mode !== 'edit') return;
		const target = event.target as Element | null;
		if (target?.closest('.component-edit-contents') !== event.currentTarget) return;
		selectionStore.select(sectionId, componentData.id, $state.snapshot(disabledOptions));
	}

	// Text components are selected too, but they show no indicator as their caret already marks them
	let isSelected = $derived(mode === 'edit' && componentData.type !== 'text' && selectionStore.isSelected(sectionId, componentData.id));

	// The registry names are already localized, as the registry is built with the i18n instance
	let componentName = $derived(globalRegistry.components[componentData.type]?.name ?? componentData.type);

	type AgnosticActionProps = ScribeComponentProps<BaseComponent<string, DataValue, ComponentConfig | undefined>>;

	const mountComponent: Action<HTMLElement, AgnosticActionProps> = (node, props) => {
		const componentDef = globalRegistry.getComponent(props.componentData.type);
		const instanceData = componentDef.mount(node, props);

		return {
			update(newProps) {
				if (componentDef.update) {
					componentDef.update(instanceData, newProps);
				}
			},
			destroy() {
				if (componentDef.unmount) {
					componentDef.unmount(instanceData);
				}
			}
		};
	};
</script>

{#if componentData}
	{#await resolvedValue}
		<Skeleton style="flex: 1; width: 100%; height: 100%; min-height: 133px; border-radius: var(--scribe-radius-2xl);" />
	{:then resolvedValuePromise} 
		{#if mode === 'edit' && !(componentData.type === 'text' && !componentData.value.value)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="component-edit-contents" class:is-inline={componentData.mode === 'inline' && componentData.type === 'text'} class:is-inline-block={componentData.mode === 'inline' && componentData.type !== 'text'} class:is-block={componentData.mode === 'block'} class:is-selected={isSelected} data-section-id={sectionId} data-component-id={componentData.id} onpointerdown={handleSelect} onfocusin={handleSelect}>
				{#if isSelected}
					<span class="component-selection-label" contenteditable="false" aria-hidden="true">{componentName}</span>
				{/if}
				<div style="display: contents;" use:mountComponent={{ componentData,  sectionId, mode, resolvedValue: resolvedValuePromise.value, isBinding: resolvedValuePromise.isBinding, updateComponentValue, updateComponentConfig, isDarkMode }}></div>
			</div>
		{:else}
			<div style="display: contents;" use:mountComponent={{ componentData, sectionId, mode, resolvedValue: resolvedValuePromise.value, isBinding: resolvedValuePromise.isBinding, updateComponentValue, updateComponentConfig, isDarkMode }}></div>
		{/if}
	{:catch error}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="component-edit-contents" class:is-inline={componentData.mode === 'inline' && componentData.type === 'text'} class:is-inline-block={componentData.mode === 'inline' && componentData.type !== 'text'} class:is-block={componentData.mode === 'block'} class:is-selected={isSelected} data-section-id={sectionId} data-component-id={componentData.id} onpointerdown={handleSelect} onfocusin={handleSelect}>
				{#if isSelected}
					<span class="component-selection-label" contenteditable="false" aria-hidden="true">{componentName}</span>
				{/if}
				<EmptyContent 
					message={i18n.t('errors.componentError')} 
					description={error.message} 
					icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;24&quot; height=&quot;24&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-triangle-alert&quot;><path d=&quot;m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3&quot;/><path d=&quot;M12 9v4&quot;/><path d=&quot;M12 17h.01&quot;/></svg>" 
					isError={true} 
				/>
			</div>
	{/await}
{/if}

<style>
	:global(scribe-component-renderer) {
		display: contents;
	}
	.component-edit-contents {
		position: relative;
		transition: background-color 0.2s ease;
	}

	.component-edit-contents.is-inline {
		display: inline;
	}
	
	/* The horizontal margin matches the reach of the selection ring and halo, so they never cover the adjacent
	   text and selecting a component does not reflow the line */
	.component-edit-contents.is-inline-block {
		display: inline-block;
		margin-inline: 6px;
	}

	.component-edit-contents.is-block {
		display: flex;
		width: 100%;
	}

	/* Selection: a tinted background, an accent ring with a soft halo and a name label. None of it affects the
	   layout, and it stays visible when the pointer leaves the component */
	.component-edit-contents.is-selected {
		background-color: color-mix(in srgb, var(--scribe-accent) 6%, transparent);
		border-radius: var(--scribe-radius-sm);
	}

	/* The ring is a pseudo-element placed outside the component, so it never touches the component's own border */
	.component-edit-contents.is-selected::after {
		content: '';
		position: absolute;
		inset: -3px;
		border: 2px solid var(--scribe-accent);
		border-radius: calc(var(--scribe-radius-sm) + 3px);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--scribe-accent) 18%, transparent);
		pointer-events: none;
		z-index: 1;
		animation: scribe-selection-in 150ms ease-out;
	}

	/* Tab attached to the top edge of the ring, set back from the rounded corner */
	.component-selection-label {
		position: absolute;
		top: -2px;
		right: calc(var(--scribe-radius-sm) + 0.25rem);
		transform: translateY(-100%);
		z-index: 1;
		padding: 0.125rem 0.5rem;
		background-color: var(--scribe-accent);
		color: white;
		font-size: var(--scribe-font-size-xs);
		font-weight: var(--scribe-font-weight-semibold);
		line-height: 1.25;
		white-space: nowrap;
		border-radius: var(--scribe-radius-sm) var(--scribe-radius-sm) 0 0;
		pointer-events: none;
		user-select: none;
		animation: scribe-selection-in 150ms ease-out;
		transition: opacity 0.2s ease;
	}

	@keyframes scribe-selection-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* The is-line-hovered class is toggled by the paragraph when the pointer is over the blank space of a row */
	.component-edit-contents:hover,
	.component-edit-contents:global(.is-line-hovered) {
		background-color: var(--scribe-selection-color) !important;
		border-radius: var(--scribe-radius-sm);
	}

	/* Nesting prevention: if a nested component is hovered, suppress the parent highlight */
	.component-edit-contents:hover:has(:global(.component-edit-contents):hover) {
		background-color: transparent !important;
	}
</style>
