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
	import { globalRegistry } from "$lib/stores/global-registry.svelte.js";
	import type { ComponentRendererProps } from "$lib/types/CustomRendererProps.js";
	import type { UpdateType } from "$lib/types/ScribeProps.js";
	import type { Action } from 'svelte/action';
	import type { ScribeComponentProps } from "$lib/registry/ComponentRegistry.js";
	import type { BaseComponent, ComponentConfig } from "$lib/domain/components/Component.js";
	import ComponentEditor from "./ComponentEditor.svelte";
	import Skeleton from "../utilComponents/Skeleton.svelte";
	import EmptyContent from "../utilComponents/EmptyContent.svelte";

    let { mode, componentData, sectionId, disabledOptions = [], isDarkMode }: ComponentRendererProps = $props();

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
			{@const options = globalRegistry.getComponentOptions(componentData.type)}
			<div class="component-edit-contents" class:is-inline={componentData.mode === 'inline' && componentData.type === 'text'} class:is-inline-block={componentData.mode === 'inline' && componentData.type !== 'text'} class:is-block={componentData.mode === 'block'}>
				<div class="component-editor" contenteditable="false">
					<ComponentEditor isBinding={resolvedValuePromise.isBinding} componentType={componentData.type} componentValue={componentData.value} componentConfig={componentData.config} {sectionId} componentId={componentData.id} {options} {disabledOptions} />
				</div>
				<div style="display: contents;" use:mountComponent={{ componentData,  sectionId, mode, resolvedValue: resolvedValuePromise.value, isBinding: resolvedValuePromise.isBinding, updateComponentValue, updateComponentConfig, isDarkMode }}></div>
			</div>
		{:else}
			<div style="display: contents;" use:mountComponent={{ componentData, sectionId, mode, resolvedValue: resolvedValuePromise.value, isBinding: resolvedValuePromise.isBinding, updateComponentValue, updateComponentConfig, isDarkMode }}></div>
		{/if}
	{:catch error}
		{@const options = globalRegistry.getComponentOptions(componentData.type)}
			<div class="component-edit-contents" class:is-inline={componentData.mode === 'inline' && componentData.type === 'text'} class:is-inline-block={componentData.mode === 'inline' && componentData.type !== 'text'} class:is-block={componentData.mode === 'block'}>
				{#if mode === 'edit' && !(componentData.type === 'text' && !componentData.value.value)}
					<div class="component-editor" contenteditable="false">
						<ComponentEditor isBinding={false} componentType={componentData.type} componentValue={componentData.value} componentConfig={componentData.config} {sectionId} componentId={componentData.id} {options} {disabledOptions} />
					</div>
				{/if}
				<EmptyContent 
					message="Component Error" 
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
