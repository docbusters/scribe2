<script lang="ts" generics="C extends BaseComponent<string, DataValue> = never">
    import type { BaseComponent } from '../../domain/components/Component.ts';
    import type { DataValue } from '../../domain/data/DataValue.ts';
    import { type DefaultComponents } from '../../registry/defaultRegistry.ts';
	import type { ParagraphSection } from '$lib/domain/Section.js';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import type { ScribeMode } from '$lib/types/ScribeProps.js';
	
    interface ParagraphSectionProps {
        data: ParagraphSection<DefaultComponents | C>;
        mode: ScribeMode;
    }

    let { data, mode }: ParagraphSectionProps = $props();

    let components = $derived(Object.values(data.content));
</script>

<div class="paragraph-section">
    {#each components as component, index (`${component.type}-${index}`)}
    {@const Component = globalRegistry.getComponent(component.type)}
        {#if component.mode === 'block'}
            <div class="block-component-container">
                <Component componentData={component} sectionId={data.id} {mode} />
            </div>
        {:else}
            <div class="inline-component-container">
                <Component componentData={component} sectionId={data.id} {mode} />
            </div>
        {/if}
    {/each}
</div>

<style>
    .block-component-container {
        display: flex;
        width: 100%;
        margin: 1rem 0;
    }

    .inline-component-container {
        display: inline;
        margin-right: 0.5rem;
        line-height: 1.5rem;
    }
</style>
