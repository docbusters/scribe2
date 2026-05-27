<script lang="ts">
	import type { BaseComponent, ComponentConfig } from "$lib/domain/components/Component.js";
	import type { DataValue } from "$lib/domain/data/DataValue.js";
	import type { ScribeComponentProps } from "$lib/registry/ComponentRegistry.js";
	import { globalRegistry } from "$lib/stores/global-registry.svelte.js";
	import ComponentEditor from "./ComponentEditor.svelte";

    let { mode, componentData, sectionId }: ScribeComponentProps<BaseComponent<string, DataValue, ComponentConfig | undefined>> = $props();
</script>

{#if componentData}
    {@const Component = globalRegistry.getComponent(componentData.type)}
	
	{#if mode === 'edit' && componentData.value.value}
		{@const options = globalRegistry.getComponentOptions(componentData.type)}
		<div class="component-edit-contents">
			<div class="component-editor">
				<ComponentEditor componentType={componentData.type} componentValue={componentData.value} componentConfig={componentData.config} sectionId={sectionId} componentId={componentData.id} {options} />
			</div>
			<Component {componentData} {sectionId} {mode} />
		</div>
	{:else}
    	<Component {componentData} {sectionId} {mode} />
	{/if}
{/if}

<style>
	.component-edit-contents {
		display: contents;
	}

	.component-edit-contents > :global(:not(.component-editor)) {
		transition: background-color 0.2s ease;
	}

	:hover.component-edit-contents > :global(:not(.component-editor)) {
		background-color: var(--scribe-selection-color) !important;
		border-radius: var(--scribe-radius-sm);
	}

	:hover.component-edit-contents > .component-editor {
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
		bottom: -10px;
		right: -0.75rem;
		left: 0;
		z-index: -1;
	}

	/* Nesting prevention: if a nested component is hovered, suppress the parent highlight and editor */
	.component-edit-contents:hover:has(:global(.component-edit-contents):hover) > .component-editor {
		opacity: 0 !important;
		pointer-events: none !important;
	}

	.component-edit-contents:hover:has(:global(.component-edit-contents):hover) > :global(:not(.component-editor)) {
		background-color: transparent !important;
	}
</style>
