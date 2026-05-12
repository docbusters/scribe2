<script lang="ts" generics="C extends BaseComponent<string, DataValue> = never">
    import type { BaseComponent } from '../../domain/components/Component.ts';
    import type { DataValue } from '../../domain/data/DataValue.ts';
    import { type DefaultComponents } from '../../registry/defaultRegistry.ts';
	import type { Section } from '$lib/domain/Section.js';
	import ParagraphSection from './ParagraphSection.svelte';
	import BlockSection from './BlockSection.svelte';
	import GridSection from './GridSection.svelte';
	
    interface SectionProps {
        data: Section<DefaultComponents | C>;
    }

    let { data }: SectionProps = $props();

</script>

<section>
    <h2>{data.title}</h2>
    {#if data.type === 'paragraph-section'}
        <ParagraphSection {data} />
    {:else if data.type === 'block-section'}
        <BlockSection {data} />
    {:else if data.type === 'grid-section'}
        <GridSection {data} />
    {/if}
</section>

<style>
    section {
        flex: 1;
        gap: var(--scribe-section-heading-gap);
        display: flex;
        flex-direction: column;
        background-color: var(--scribe-section-background);
        color: var(--scribe-section-foreground);
        border-radius: var(--scribe-section-radius);
        padding: 0.75rem 1.25rem;
    }
</style>

