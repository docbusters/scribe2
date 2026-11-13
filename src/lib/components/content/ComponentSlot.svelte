<script lang="ts">
	import type { ComponentSlotProps } from '$lib/types/ComponentSlotProps.js';
	import { readSlotEntries } from '$lib/utils/componentSlots.js';
	import { getI18n } from '$lib/i18n/i18n.svelte.js';
	import EmptyContent from '../utilComponents/EmptyContent.svelte';
	import ComponentFlow from './ComponentFlow.svelte';

	/**
	 * An area inside a component where the user writes and inserts components, as in a section: text, any registered
	 * component, and the arrow keys moving through all of it. The components are stored in the value of the component that
	 * holds the slot, so its value must be a record, and every slot is one of its entries (see SlotRef)
	 */
	let { componentData, slotKey, sectionId, mode, isDarkMode }: ComponentSlotProps = $props();
	const i18n = getI18n();

	// Null when the entry of the slot is not a record of components
	let entries = $derived(readSlotEntries(componentData.value, slotKey));
	let components = $derived(entries?.map(([, component]) => component) ?? []);
	let slot = $derived({ parentId: componentData.id, slotKey });
</script>

<div class="scribe-component-slot" data-slot-key={slotKey}>
	{#if entries}
		<ComponentFlow {components} {sectionId} {mode} {isDarkMode} {slot} />
	{:else}
		<EmptyContent
			message={i18n.t('errors.invalidSlotContent', { slot: slotKey })}
			icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;24&quot; height=&quot;24&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-triangle-alert&quot;><path d=&quot;m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3&quot;/><path d=&quot;M12 9v4&quot;/><path d=&quot;M12 17h.01&quot;/></svg>"
			isError
		/>
	{/if}
</div>

<style>
	:global(scribe-component-slot) {
		display: contents;
	}

	/* The slot fills what its parent gives it (a table cell taller than its content), so a click anywhere in it puts the caret in it */
	.scribe-component-slot {
		min-width: 0;
		height: 100%;
	}
</style>
