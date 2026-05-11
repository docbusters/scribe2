<script lang="ts" generics="C extends BaseComponent<string, DataValue> = never">
    import type { BaseComponent } from '../../domain/components/Component.ts';
    import type { DataValue } from '../../domain/data/DataValue.ts';
    import { type DefaultComponents } from '../../registry/defaultRegistry.ts';
	import type { GridSection } from '$lib/domain/Section.js';
	import Section from './Section.svelte';
	
    interface GridSectionProps {
        data: GridSection<DefaultComponents | C>;
    }

    let { data }: GridSectionProps = $props();

    const items = $derived(data.content);
    const gridStyle = $derived(`grid-template-columns: repeat(${data.columns}, 1fr); grid-template-rows: repeat(${data.rows}, 1fr); grid-column-gap: ${data.gapX}px; grid-row-gap: ${data.gapY}px;`);

    const getItemStyle = (item: typeof items[number]) => {
        const rowStart = item.row;
        const rowEnd = item.row + (item.rowspan || 1);
        const columnStart = item.column;
        const columnEnd = item.column + (item.colspan || 1);

        return `grid-area: ${rowStart} / ${columnStart} / ${rowEnd} / ${columnEnd};`;
    };
</script>

<div class="grid-section" style={gridStyle}>
    {#each items as item, index (`${item.section.type}-${index}`)}
        <div style={getItemStyle(item)}>
            <Section data={item.section} />
        </div>
    {/each}
</div>

<style>
    .grid-section {
        display: grid;
        background-color: crimson;
    }
</style>
