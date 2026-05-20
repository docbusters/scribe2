<script lang="ts" generics="C extends BaseComponent<string, DataValue> = never">
    import type { BaseComponent } from '../../domain/components/Component.ts';
    import type { DataValue, StringValue } from '../../domain/data/DataValue.ts';
    import { type DefaultComponents } from '../../registry/defaultRegistry.ts';
	import type { ParagraphSection } from '$lib/domain/Section.js';
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import type { ScribeMode } from '$lib/types/ScribeProps.js';
	
    interface ParagraphSectionProps {
        data: ParagraphSection<DefaultComponents | C>;
        mode: ScribeMode;
    }

    let { data, mode }: ParagraphSectionProps = $props();

    // We add a ghost component at the end of the section in edit mode to allow adding new components by typing
    let ghostComponent = {
        id: '',
        type: 'text',
        mode: 'inline',
        value: { type: 'string', value: '' } as StringValue
    } as unknown as DefaultComponents;

    let components = $derived.by(() => {
        const comps = Object.values(data.content);
        return mode === 'edit' ? [...comps, ghostComponent] : comps;
    });
</script>

<div class="paragraph-section">
    {#each components as component, index (`${data.id}-${component.id}-${index}`)}
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
        line-height: 1.5rem;
    }
</style>
