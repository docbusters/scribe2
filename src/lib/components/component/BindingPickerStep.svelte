<script lang="ts">
	import { onMount } from 'svelte';
	import type { Action } from 'svelte/action';
	import { customBindingsStore } from '$lib/stores/custom-bindings-store.svelte.js';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import { valueDialogStore, type ValueDialogPicker } from '$lib/stores/value-dialog-store.svelte.js';
	import { createRendererHost } from '$lib/utils/bindingItemRenderer.js';
	import { createPickerSession, isBindingTypeAccepted } from '$lib/utils/bindingPicker.js';
	import type { BindingPickerProps, BindingPickerRenderer } from '$lib/types/ScribeProps.js';
	import { getI18n } from '$lib/i18n/i18n.svelte.js';
	import Button from '../utilComponents/Button.svelte';

	let { picker }: { picker: ValueDialogPicker } = $props();

	const i18n = getI18n();

	let root = $state<HTMLElement>();

	const bindingName = $derived(customBindingsStore.definitions[picker.bindingType]?.name ?? picker.bindingType);
	const renderer = $derived(customBindingsStore.getPickerRenderer(picker.bindingType));

	// What the component being edited accepts, which is what disables the rows of the list
	const supportedTypes = $derived.by(() => {
		try {
			return globalRegistry.getComponentSupportedBindingValueTypes(picker.componentType);
		} catch {
			return undefined;
		}
	});

	// The functions the host gets. They validate the id and do nothing once the step is over, and the choice only becomes pending in the selector
	const session = createPickerSession({
		getAvailable: () => customBindingsStore.getAvailableIds(picker.bindingType, supportedTypes),
		onPick: (id) => picker.onpick(id),
		onClose: () => valueDialogStore.closePicker()
	});

	const pickerProps = $derived<BindingPickerProps>({
		bindingType: picker.bindingType,
		selectedId: picker.selectedId,
		isTypeAccepted: (type) => isBindingTypeAccepted(type, supportedTypes),
		select: session.select,
		cancel: session.cancel,
		lang: i18n.lang
	});

	interface PickerRender {
		renderer: BindingPickerRenderer;
		props: BindingPickerProps;
	}

	// Draws the picker of the host. The language can change while it is open, so it gets the new props in place
	const mountPicker: Action<HTMLElement, PickerRender> = (node, params) => {
		const host = createRendererHost(
			params.renderer,
			node,
			params.props,
			() => {
				// It threw while mounting: the selector shows the list from now on. The step is left after this mount ends, not during it
				customBindingsStore.markPickerFailed(picker.bindingType);
				queueMicrotask(() => valueDialogStore.closePicker());
			},
			'picker'
		);

		return {
			update: (next) => host.update(next.props),
			destroy: () => {
				session.close();
				host.destroy();
			}
		};
	};

	// The keyboard starts on "Back", so Escape and Tab work from the first moment
	onMount(() => root?.querySelector<HTMLElement>('.picker-back')?.focus());
</script>

<div class="picker-step" bind:this={root}>
	<div class="picker-bar">
		<Button class="picker-back" variant="ghost" size="sm" onclick={() => valueDialogStore.closePicker()}>
			<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
			{i18n.t('bindingSelector.back')}
		</Button>
		<span class="picker-title" title={bindingName}>{bindingName}</span>
	</div>

	{#if renderer}
		<!-- The host draws here, in a box with a defined size and its own scroll. It is not inside a button, so it can hold its own -->
		<div class="picker-host" data-scribe-host use:mountPicker={{ renderer, props: pickerProps }}></div>
	{/if}
</div>

<style>
	.picker-step {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		flex: 1;
		min-height: 0;
	}

	.picker-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.picker-title {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-family: var(--scribe-font-heading);
		font-size: var(--scribe-font-size-sm);
		font-weight: var(--scribe-font-weight-semibold);
		color: var(--scribe-doc-foreground);
	}

	.picker-host {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow: auto;
		background-color: var(--scribe-section-background);
		border: 1px solid var(--scribe-border-color);
		border-radius: var(--scribe-radius-lg);
	}
</style>
