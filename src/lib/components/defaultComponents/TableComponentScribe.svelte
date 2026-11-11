<script lang="ts">
    /* eslint-disable @typescript-eslint/no-unused-vars */
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { TableComponent } from '../../domain/components/DefaultComponents.ts';
	import EmptyContent from '../utilComponents/EmptyContent.svelte';
	import ComponentSlot from '../content/ComponentSlot.svelte';
	import { getI18n } from '$lib/i18n/i18n.svelte.js';

    let { componentData, mode, sectionId, isDarkMode }: ScribeComponentProps<TableComponent> = $props();
    const i18n = getI18n();

    const config = $derived(componentData.config);
</script>

{#if config}
    <table>
        <tbody>
            {#each Array.from({ length: config.rows }) as _, rowIndex (`row-${rowIndex}`)}
                <tr>
                    {#each Array.from({ length: config.cols }) as _, colIndex (`col-${colIndex}`)}
                        <td>
                            <!-- Every cell is a slot: it holds components like a section does -->
                            <ComponentSlot {componentData} slotKey={`${rowIndex}:${colIndex}`} {sectionId} {mode} {isDarkMode} />
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
{:else}
    <EmptyContent
        message={i18n.t('errors.tableConfigMissing')}
        icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;24&quot; height=&quot;24&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-table2-icon lucide-table-2&quot;><path d=&quot;M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18&quot;/></svg>"
        isError
    />
{/if}

<style>
    table {
        border-collapse: separate;
        border-spacing: 0;
        flex: 1;
        table-layout: fixed;
        width: 100%;
        border: 1px solid var(--scribe-border-color);
        border-radius: var(--scribe-radius-lg);
        overflow: hidden;
    }
    td {
        border-right: 1px solid var(--scribe-border-color);
        border-bottom: 1px solid var(--scribe-border-color);
        padding: 0.5rem;
        position: relative;
        /* Cells hold a flow of components, and the one that is shorter than its neighbour must start at the same line */
        vertical-align: top;
        overflow-wrap: anywhere;
        /* A height lets the slot of the cell fill it with a percentage height. A row is never shorter than its content */
        height: 1px;
    }
    td:last-child {
        border-right: none;
    }
    tr:last-child td {
        border-bottom: none;
    }
</style>
