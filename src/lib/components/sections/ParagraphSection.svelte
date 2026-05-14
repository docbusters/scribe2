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

<div class="paragraph-section">
    {#each components as component, index (`${component.type}-${index}`)}
    {@const Component = globalRegistry.getComponent(component.type)}
        {#if component.mode === 'block'}
            <div class="block-component-container">
                <Component componentData={component} />
            </div>
        {:else}
            <Component componentData={component} />
        {/if}
    {/each}
</div>

<style>
    .paragraph-section {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 0.5em;
        align-items: center;
    }

    .block-component-container {
        display: flex;
        width: 100%;
    }
</style>
