<!-- The custom element of <scribe-component-renderer>: a wrapper, so the plain component has no import effect. The tag is defined in `scribe.ts`. See ScribeElement.svelte -->
<svelte:options
	customElement={{
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
	import ComponentRenderer from '../components/component/ComponentRenderer.svelte';
	import type { ComponentRendererProps } from '../types/CustomRendererProps.js';

	let { mode, isDarkMode, componentData, sectionId, disabledOptions }: ComponentRendererProps = $props();
</script>

<ComponentRenderer {mode} {isDarkMode} {componentData} {sectionId} {disabledOptions} />
