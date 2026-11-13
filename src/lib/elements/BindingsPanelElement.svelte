<!-- The custom element of <scribe-bindings-panel>: a wrapper, so the plain component has no import effect. The tag is defined in `scribe.ts`. See ScribeElement.svelte -->
<svelte:options
	customElement={{
		shadow: 'none',
		props: {
			class: { type: 'String' },
			style: { type: 'String' },
			floating: { type: 'Boolean' },
			isExpanded: { type: 'Boolean' },
			collapsible: { type: 'Boolean' },
			lang: { type: 'String' }
		}
	}}
/>

<script lang="ts">
	import BindingsFloatingPanel from '../components/bindings/BindingsFloatingPanel.svelte';
	import type { BindingsPanelProps } from '../types/BindingsPanelProps.js';

	// The panel folds and unfolds itself, so `isExpanded` is bound to keep the property of the element in step with it. It needs the default of the panel (true): Svelte throws when a binding is undefined and the child has a default
	let { class: className, style, floating, isExpanded = $bindable(true), collapsible, lang }: BindingsPanelProps = $props();
</script>

<BindingsFloatingPanel class={className} {style} {floating} bind:isExpanded {collapsible} {lang} />
