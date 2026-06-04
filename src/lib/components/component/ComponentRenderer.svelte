<script lang="ts">
	import type { CollectionValue, DataValue, PrimitiveValue } from "$lib/domain/data/DataValue.js";
	import { bindingStore } from "$lib/stores/binding-store.svelte.js";
	import { editStore } from "$lib/stores/edit-store.svelte.js";
	import { globalRegistry } from "$lib/stores/global-registry.svelte.js";
	import type { ComponentRendererProps } from "$lib/types/CustomRendererProps.js";
	import type { UpdateType } from "$lib/types/ScribeProps.js";
	import ComponentEditor from "./ComponentEditor.svelte";

    let { mode, componentData, sectionId }: ComponentRendererProps = $props();

	let componentSupportedTypes = $derived({ types: globalRegistry.getComponentValueTypes(componentData.type), bindingTypes: globalRegistry.getComponentSupportedBindingValueTypes(componentData.type) });
	let componentValue = $derived(componentData.value);
	const resolvedValue = $derived.by(() => {
		const { types, bindingTypes } = componentSupportedTypes;

		if (!types.includes(componentValue.type)) {
			throw new Error(`Unsupported component value type: ${componentValue.type}`);
		}

		if (componentValue.type === 'binding') {
			const bindingValue = bindingStore.getBindingValue(componentValue.value, componentValue.bindingType);

			if (!bindingTypes.includes(bindingValue.type)) {
				console.error(`Component ${componentData.type} does not support binding value type ${bindingValue.type}`, { componentData, bindingValue });
				throw new Error(`Unsupported binding value type: ${bindingValue.type}`);
			}

			return bindingValue;
		}

		return componentValue;
	})

	function updateComponentValue(newValue: DataValue, updateType: UpdateType) {
		const { types, bindingTypes } = componentSupportedTypes;

		if (componentValue.type === 'binding') {
			// Bindings can be updated in any mode
			if (!bindingTypes.includes(newValue.type)) {
				throw new Error(`Updated value type ${newValue.type} is not supported by component's binding`);
			}

			bindingStore.updateBindingValue(mode, componentValue.value, componentValue.bindingType, updateType, newValue as PrimitiveValue | CollectionValue);
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
</script>

{#if componentData}
    {@const Component = globalRegistry.getComponent(componentData.type)}
	{#if mode === 'edit' && !(componentData.type === 'text' && !componentData.value.value)}
		{@const options = globalRegistry.getComponentOptions(componentData.type)}
		<div class="component-edit-contents" class:is-inline={componentData.mode === 'inline' && componentData.type === 'text'} class:is-inline-block={componentData.mode === 'inline' && componentData.type !== 'text'} class:is-block={componentData.mode === 'block'}>
			<div class="component-editor" contenteditable="false">
				<ComponentEditor componentType={componentData.type} componentValue={componentData.value} componentConfig={componentData.config} sectionId={sectionId} componentId={componentData.id} {options} />
			</div>
			<Component {componentData} {sectionId} {mode} {resolvedValue} {updateComponentValue} />
		</div>
	{:else}
    	<Component {componentData} {sectionId} {mode} {resolvedValue} {updateComponentValue} />
	{/if}
{/if}

<style>
	.component-edit-contents {
		position: relative;
		transition: background-color 0.2s ease;
	}

	.component-edit-contents.is-inline {
		display: inline;
	}
	
	.component-edit-contents.is-inline-block {
		display: inline-block;
	}

	.component-edit-contents.is-block {
		display: flex;
		width: 100%;
	}

	.component-edit-contents:hover {
		background-color: var(--scribe-selection-color) !important;
		border-radius: var(--scribe-radius-sm);
	}

	.component-edit-contents:hover > .component-editor {
		opacity: 1;
		pointer-events: auto;
	}

	.component-editor {
		position: absolute;
		top: -0.5rem;
		left: 0;
		transform: translateY(-100%);
		z-index: 1;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.3s ease;
	}

	/* Invisible bridge to prevent losing hover when moving mouse from component to editor */
	.component-editor::after {
		content: '';
		position: absolute;
		top: -15px;
		bottom: -0.5rem;
		right: -0.75rem;
		left: 0;
		z-index: -1;
	}

	/* Nesting prevention: if a nested component is hovered, suppress the parent highlight and editor */
	.component-edit-contents:hover:has(:global(.component-edit-contents):hover) > .component-editor {
		opacity: 0 !important;
		pointer-events: none !important;
	}

	.component-edit-contents:hover:has(:global(.component-edit-contents):hover) {
		background-color: transparent !important;
	}
</style>
