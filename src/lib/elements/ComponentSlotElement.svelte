<!-- The custom element of <scribe-component-slot>: a wrapper, so the plain component has no import effect. The tag is defined in `scribe.ts`. See ScribeElement.svelte -->
<svelte:options
	customElement={{
		shadow: 'none',
		props: {
			componentData: { type: 'Object' },
			slotKey: { type: 'String' },
			sectionId: { type: 'String' },
			mode: { type: 'String' },
			isDarkMode: { type: 'Boolean' }
		}
	}}
/>

<script lang="ts">
	import ComponentSlot from '../components/content/ComponentSlot.svelte';
	import type { ComponentSlotProps } from '../types/ComponentSlotProps.js';

	let { componentData, slotKey, sectionId, mode, isDarkMode }: ComponentSlotProps = $props();
</script>

<ComponentSlot {componentData} {slotKey} {sectionId} {mode} {isDarkMode} />
