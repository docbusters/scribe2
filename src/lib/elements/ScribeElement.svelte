<!--
	The custom element of <scribe-interpreter>. It is a wrapper on purpose: `Scribe.svelte` stays a plain component that the effect-free
	`core` entry can import without a DOM. No `tag` is set here: Svelte creates the element class when this module is evaluated and leaves it in
	`ScribeElement.element`, and `scribe.ts` defines the five tags in one place
-->
<svelte:options
	customElement={{
		shadow: 'none',
		props: {
			id: { type: 'String' },
			class: { type: 'String' },
			style: { type: 'String' },
			mode: { type: 'String' },
			registry: { type: 'Object' },
			document: { type: 'Object' },
			bindings: { type: 'Object' },
			ondocumentchange: { type: 'Object' },
			onbindingchange: { type: 'Object' },
			customBindings: { type: 'Object' },
			lang: { type: 'String' },
			showBindingsPanel: { type: 'Boolean' },
			showPrintButton: { type: 'Boolean' }
		}
	}}
/>

<script lang="ts">
	import Scribe from '../components/Scribe.svelte';
	import type { ScribeProps, CustomBinding } from '../types/ScribeProps.js';
	import type { Document, BindingsDefinition } from '../domain/Document.js';
	import type { CustomBindingUsages } from '../utils/bindingUsages.js';

	// Every prop is passed on one by one, and an undefined one makes the component use its own default
	let {
		id,
		class: className,
		style,
		mode,
		registry,
		document,
		bindings,
		ondocumentchange,
		onbindingchange,
		customBindings,
		lang,
		showBindingsPanel,
		showPrintButton
	}: ScribeProps = $props();

	let inner = $state<{
		getCustomBindingUsages(): CustomBindingUsages;
		refreshDocument(newDocument: Document<never>): void;
		refreshBindings(newBindings: Record<string, BindingsDefinition>): void;
		refreshCustomBindings(newCustomBindings: Record<string, CustomBinding>): void;
	}>();

	// The methods of the element are the ones of the component
	export function getCustomBindingUsages() {
		return inner!.getCustomBindingUsages();
	}

	export function refreshDocument(newDocument: Document<never>) {
		inner!.refreshDocument(newDocument);
	}

	export function refreshBindings(newBindings: Record<string, BindingsDefinition>) {
		inner!.refreshBindings(newBindings);
	}

	export function refreshCustomBindings(newCustomBindings: Record<string, CustomBinding>) {
		inner!.refreshCustomBindings(newCustomBindings);
	}
</script>

<Scribe
	bind:this={inner}
	{id}
	class={className}
	{style}
	{mode}
	{registry}
	{document}
	{bindings}
	{ondocumentchange}
	{onbindingchange}
	{customBindings}
	{lang}
	{showBindingsPanel}
	{showPrintButton}
/>
