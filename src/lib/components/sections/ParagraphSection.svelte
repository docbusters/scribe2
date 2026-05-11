<script lang="ts" generics="C extends BaseComponent<string, DataValue> = never">
    import type { BaseComponent } from '../../domain/components/Component.ts';
    import type { DataValue } from '../../domain/data/DataValue.ts';
    import { type DefaultComponents } from '../../registry/defaultRegistry.ts';
	import type { ParagraphSection } from '$lib/domain/Section.js';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	
    interface ParagraphSectionProps {
        data: ParagraphSection<DefaultComponents | C>;
    }

    let { data }: ParagraphSectionProps = $props();

    let components = $derived(data.content);
</script>

<div id="paragraph-section">
    {#each components as component, index (`${component.type}-${index}`)}
        {@const Component = globalRegistry.getComponent(component.type)}
        <Component componentData={component} />
    {/each}
</div>

<style>
    #paragraph-section {
        background-color: orange;
    }
</style>
