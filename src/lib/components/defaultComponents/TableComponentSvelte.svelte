<script lang="ts">
    /* eslint-disable @typescript-eslint/no-unused-vars */
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { TableCellIndex, TableComponent } from '../../domain/components/DefaultComponents.js';
	import EmptyContent from '../utilComponents/EmptyContent.svelte';
	import ComponentRenderer from '../utilComponents/ComponentRenderer.svelte';

    let { componentData, mode, sectionId }: ScribeComponentProps<TableComponent> = $props();

    const recordValue = $derived(componentData.value);
    const config = $derived(componentData.config);

    const getCellValue = (cell: TableCellIndex) => {
        if (!recordValue) return null;
        const cellValue = recordValue.value[cell];
        if (!cellValue) return null;

        if (cellValue.type !== 'component') {
            throw new Error(`Table cell ${cell} must be a component value!`);
        }

        const componentValue = cellValue.value;

        return componentValue;
    };
</script>

{#if config}
    <table>
        <tbody>
            {#each Array.from({ length: config.rows }) as _, rowIndex (`row-${rowIndex}`)}
                <tr>
                    {#each Array.from({ length: config.cols }) as _, colIndex (`col-${colIndex}`)}
                        {@const componentData = getCellValue(`${rowIndex}:${colIndex}`)}
                        <td>
                            {#if componentData}
                                <ComponentRenderer componentData={componentData} {sectionId} {mode} />
                            {/if}
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
{:else}
    <EmptyContent
        message="Table component is missing configuration"
        icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;24&quot; height=&quot;24&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-table2-icon lucide-table-2&quot;><path d=&quot;M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18&quot;/></svg>"
        isError
    />
{/if}

<style>
    table {
        border-collapse: collapse;
        flex: 1;
        table-layout: fixed;
        width: 100%;
    }
    td {
        border: 1px solid var(--scribe-border-color);
        padding: 0.5rem;
    }
</style>
