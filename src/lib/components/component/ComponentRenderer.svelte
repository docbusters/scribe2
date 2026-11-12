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
	import { valueDialogStore } from "$lib/stores/value-dialog-store.svelte.js";
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

	// Undefined when the page does not register this type. The registry getters throw for it, so every render path checks it first
	let componentDef = $derived(globalRegistry.components[componentData.type]);
	let componentSupportedTypes = $derived({ types: componentDef?.valueTypes ?? [], bindingTypes: componentDef?.supportedBindingValueTypes ?? [] });
	let resolvedValue = $derived.by(() => {
		const { types, bindingTypes } = componentSupportedTypes;

		try {
			if (!componentDef) {
				throw new Error(i18n.t('errors.unknownComponent', { type: componentData.type }));
			}

			if (!types.includes(componentData.value.type)) {
				throw new Error(i18n.t('errors.unsupportedValueType', { type: componentData.value.type }));
			}

			if (componentData.value.type === 'binding') {
				const bindingResult = bindingStore.getBindingValue(componentData.value.value, componentData.value.bindingType);

				if (bindingResult instanceof Promise) {
					return bindingResult.then(bindingValue => {
						if (!bindingTypes.includes(bindingValue.type)) {
							console.error(`Component ${componentData.type} does not support binding value type ${bindingValue.type}`, { componentData, bindingValue });
							throw new Error(i18n.t('errors.unsupportedBindingType', { type: bindingValue.type }));
						}
						return { value: bindingValue, isBinding: true };
					});
				} else {
					if (!bindingTypes.includes(bindingResult.type)) {
						console.error(`Component ${componentData.type} does not support binding value type ${bindingResult.type}`, { componentData, result: bindingResult });
						throw new Error(i18n.t('errors.unsupportedBindingType', { type: bindingResult.type }));
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

		// A slot of this component is a place to write, like a section. What is in it that has no wrapper of its own (an empty text,
		// the blank space) must not select the component that holds the slot, as it would replace the insertion point the caret is in
		const slotElement = target?.closest('.scribe-component-slot');
		if (slotElement && (event.currentTarget as Element).contains(slotElement)) return;

		selectionStore.select(sectionId, componentData.id, componentDef ? $state.snapshot(disabledOptions) : [...$state.snapshot(disabledOptions), 'setValue']); // An unknown type has no value types, so there is nothing to set
	}

	// Text components are selected too, but they show no indicator as their caret already marks them
	let isSelected = $derived(mode === 'edit' && componentData.type !== 'text' && selectionStore.isSelected(sectionId, componentData.id));

	// The registry names are already localized, as the registry is built with the i18n instance
	let componentName = $derived(componentDef?.name ?? componentData.type);

	type AgnosticActionProps = ScribeComponentProps<BaseComponent<string, DataValue, ComponentConfig | undefined>>;

	/* * BLOCK HEIGHT * */

	const KEY_STEP = 10;
	const KEY_STEP_LARGE = 50;

	// A block whose registry entry defines a height is a box of that height, and its component fills it
	let heightDefinition = $derived(componentData.mode === 'block' && componentDef ? globalRegistry.getComponentHeight(componentData.type) : null);

	// The height while the handle is being dragged, saved when it is released
	let previewHeight = $state<number | null>(null);
	let resizeStart: { y: number; height: number } | null = null;

	function clampHeight(height: number) {
		if (!heightDefinition) return height;
		return Math.min(heightDefinition.max, Math.max(heightDefinition.min, Math.round(height)));
	}

	let blockHeight = $derived.by(() => {
		if (!heightDefinition) return null;
		const chosen = (componentData as { height?: number }).height;
		return clampHeight(previewHeight ?? chosen ?? heightDefinition.default);
	});

	let canResize = $derived(mode === 'edit' && isSelected && !!heightDefinition?.isResizeable);

	function startResize(event: PointerEvent) {
		if (blockHeight === null) return;
		// The handle is not part of the text or of the block: it must not move the caret or start a selection
		event.preventDefault();
		event.stopPropagation();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		resizeStart = { y: event.clientY, height: blockHeight };
		previewHeight = blockHeight;
	}

	function moveResize(event: PointerEvent) {
		if (!resizeStart) return;
		previewHeight = clampHeight(resizeStart.height + event.clientY - resizeStart.y);
	}

	function endResize(event: PointerEvent) {
		if (!resizeStart) return;
		(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);

		const height = previewHeight;
		resizeStart = null;
		previewHeight = null;
		if (height !== null) {
			editStore.setComponentHeight(sectionId, componentData.id, height);
		}
	}

	function handleResizeKeydown(event: KeyboardEvent) {
		if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
		event.preventDefault();
		event.stopPropagation();
		if (blockHeight === null) return;

		const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
		editStore.setComponentHeight(sectionId, componentData.id, clampHeight(blockHeight + (event.key === 'ArrowDown' ? step : -step)));
	}

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

{#snippet mounted(resolved: { value: AgnosticActionProps['resolvedValue']; isBinding: boolean })}
	<div
		class="component-mount"
		class:is-sized={blockHeight !== null}
		style:height={blockHeight !== null ? `${blockHeight}px` : undefined}
		use:mountComponent={{ componentData, sectionId, mode, resolvedValue: resolved.value, isBinding: resolved.isBinding, updateComponentValue, updateComponentConfig, isDarkMode }}
	></div>
{/snippet}

{#if componentData}
	{#await resolvedValue}
		<Skeleton style="flex: 1; width: 100%; height: {blockHeight !== null ? `${blockHeight}px` : '100%'}; min-height: 133px; border-radius: var(--scribe-radius-xl);" />
	{:then resolvedValuePromise} 
		{#if mode === 'edit' && !(componentData.type === 'text' && !componentData.value.value)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="component-edit-contents" class:is-inline={componentData.mode === 'inline' && componentData.type === 'text'} class:is-inline-block={componentData.mode === 'inline' && componentData.type !== 'text'} class:is-block={componentData.mode === 'block'} class:is-selected={isSelected} class:is-resizing={previewHeight !== null} data-section-id={sectionId} data-component-id={componentData.id} onpointerdown={handleSelect} onfocusin={handleSelect}>
				{#if isSelected}
					<span class="component-selection-label" contenteditable="false" aria-hidden="true">{componentName}</span>
				{/if}
				{@render mounted(resolvedValuePromise)}
				{#if canResize && heightDefinition}
					<!-- A focusable separator is a widget (the splitter pattern), so the tabindex is valid -->
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<div
						role="separator"
						aria-orientation="horizontal"
						aria-label={i18n.t('editor.resizeHeight')}
						aria-valuemin={heightDefinition.min}
						aria-valuemax={heightDefinition.max}
						aria-valuenow={blockHeight}
						tabindex="0"
						contenteditable="false"
						class="component-resize-handle"
						class:is-dragging={previewHeight !== null}
						onpointerdown={startResize}
						onpointermove={moveResize}
						onpointerup={endResize}
						onpointercancel={endResize}
						onkeydown={handleResizeKeydown}
					></div>
				{/if}
			</div>
		{:else}
			{@render mounted(resolvedValuePromise)}
		{/if}
	{:catch error}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="component-edit-contents" class:is-inline={componentData.mode === 'inline' && componentData.type === 'text'} class:is-inline-block={componentData.mode === 'inline' && componentData.type !== 'text'} class:is-block={componentData.mode === 'block'} class:is-selected={isSelected} class:is-resizing={previewHeight !== null} data-section-id={sectionId} data-component-id={componentData.id} onpointerdown={handleSelect} onfocusin={handleSelect}>
				{#if isSelected}
					<span class="component-selection-label" contenteditable="false" aria-hidden="true">{componentName}</span>
				{/if}
				<EmptyContent
					action={componentDef ? valueDialogStore.getAction(mode, sectionId, componentData.id, i18n.t('emptyContent.changeValue')) : undefined}
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

	.component-mount {
		display: contents;
	}

	/* A block with a height is a box of that height. Its component fills it and whatever does not fit is cut off,
	   so no content ever sticks out of the block */
	.component-mount.is-sized {
		display: flex;
		width: 100%;
		min-width: 0;
		overflow: hidden;
	}

	/* Pill on the bottom edge of the selection ring, dragged to change the height of the block */
	.component-resize-handle {
		position: absolute;
		left: 50%;
		bottom: -8px;
		z-index: 2;
		width: 3rem;
		height: 0.5rem;
		transform: translateX(-50%);
		border-radius: 999px;
		background-color: var(--scribe-accent);
		border: 1px solid var(--scribe-section-background);
		box-shadow: var(--scribe-shadow-sm);
		cursor: ns-resize;
		touch-action: none;
		outline: none;
		transition: transform 0.1s, box-shadow 0.2s;
	}

	.component-resize-handle:hover,
	.component-resize-handle:focus-visible,
	.component-resize-handle.is-dragging {
		transform: translateX(-50%) scale(1.15);
		box-shadow: var(--scribe-shadow-md);
	}

	/* An iframe (the video) takes the pointer events of the drag when the handle moves over it, even with the pointer captured,
	   and the height stops following the pointer. While the height is dragged it lets them through */
	.component-edit-contents.is-resizing :global(iframe) {
		pointer-events: none;
	}

	.component-edit-contents.is-inline {
		display: inline;
	}
	
	/* The horizontal margin matches the reach of the selection ring, so it never covers the adjacent
	   text and selecting a component does not reflow the line */
	.component-edit-contents.is-inline-block {
		display: inline-block;
		margin-inline: 6px;
		/* Never wider than its container (a table cell): 12px is the two margins. Without it the wrapper is as wide as its content */
		max-width: calc(100% - 12px);
	}

	/* min-width: 0 lets a block shrink below its content, so in a narrow slot (a table cell) it does not stick out */
	.component-edit-contents.is-block {
		display: flex;
		width: 100%;
		min-width: 0;
	}

	/* Selection: a tinted background, an accent ring and a name label. None of it affects the
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
		color: var(--scribe-accent-foreground);
		font-size: var(--scribe-font-size-xs);
		font-weight: var(--scribe-font-weight-semibold);
		line-height: 1.25;
		white-space: nowrap;
		border-radius: var(--scribe-radius-sm) var(--scribe-radius-sm) 0 var(--scribe-radius-sm);
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
	.component-edit-contents:hover:has(:global(.component-edit-contents):hover),
	.component-edit-contents:hover:has(:global(.scribe-component-slot):hover) {
		background-color: transparent !important;
	}
</style>
