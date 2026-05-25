<script lang="ts">
	import { type ComponentEditProps } from "$lib/registry/ComponentEditOptions.js";
	import { globalRegistry } from "$lib/stores/global-registry.svelte.js";
	import ComponentEditorButton from "./ComponentEditorButton.svelte";

    let props: ComponentEditProps = $props();

    let supportedValues = $derived(globalRegistry.getComponentValueTypes(props.componentId));
</script>


<ComponentEditorButton {...props} >
</ComponentEditorButton>

