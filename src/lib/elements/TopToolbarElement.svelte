<!-- The custom element of <scribe-top-toolbar>: a wrapper, so the plain component has no import effect. The tag is defined in `scribe.ts`. See ScribeElement.svelte -->
<svelte:options
	customElement={{
		shadow: 'none',
		props: {
			class: { type: 'String' },
			style: { type: 'String' }
		}
	}}
/>

<script lang="ts">
	import TopToolbar from '../components/toolbar/TopToolbar.svelte';
	import type { TopToolbarProps } from '../types/TopToolbarProps.js';

	let { class: className, style }: TopToolbarProps = $props();
</script>

<TopToolbar class={className} {style} />
