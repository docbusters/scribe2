<script lang="ts">
	import type { BaseComponent, ComponentConfig } from "$lib/domain/components/Component.js";
	import type { DataValue } from "$lib/domain/data/DataValue.js";
	import type { ScribeComponentProps } from "$lib/registry/ComponentRegistry.js";
	import { globalRegistry } from "$lib/stores/global-registry.svelte.js";

    let { mode, componentData, sectionId }: ScribeComponentProps<BaseComponent<string, DataValue, ComponentConfig | undefined>> = $props();

</script>

{#if componentData}
    {@const Component = globalRegistry.getComponent(componentData.type)}
    <Component {componentData} {sectionId} {mode} />
{/if}

<style>
</style>
