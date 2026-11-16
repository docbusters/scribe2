<!-- The custom element of <scribe-empty-content>: a wrapper, so the plain component has no import effect. The tag is defined in `scribe.ts`. See ScribeElement.svelte -->
<svelte:options
	customElement={{
		shadow: 'none',
		props: {
			message: { type: 'String' },
			description: { type: 'String' },
			icon: { type: 'String' },
			isError: { type: 'Boolean' },
			valueStyle: { type: 'String' },
			style: { type: 'String' },
			action: { type: 'Object' }
		}
	}}
/>

<script lang="ts">
	import EmptyContent from '../components/utilComponents/EmptyContent.svelte';
	import type { EmptyContentProps } from '../types/EmptyContentProps.js';

	// `children` is for Svelte use only, so it is not a prop of the element
	let { message, description, icon, isError, valueStyle, style, action }: EmptyContentProps = $props();
</script>

<EmptyContent {message} {description} {icon} {isError} {valueStyle} {style} {action} />

<style>
    /* The element has no shadow root, so it needs its own display to fill a block (a flex item) like the empty states of Scribe */
    :global(scribe-empty-content) {
        display: flex;
        flex: 1;
        min-width: 0;
    }
</style>
