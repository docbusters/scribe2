<script lang="ts">
    /* eslint-disable @typescript-eslint/no-unused-vars */
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { TableComponent } from '../../domain/components/DefaultComponents.ts';
	import EmptyContent from '../utilComponents/EmptyContent.svelte';
	import ComponentSlot from '../content/ComponentSlot.svelte';
	import Button from '../utilComponents/Button.svelte';
	import { getI18n } from '$lib/i18n/i18n.svelte.js';
	import { removeTableLine, type TableAxis } from '$lib/utils/tableCells.js';

    let { componentData, mode, sectionId, isDarkMode, updateComponentValue, updateComponentConfig }: ScribeComponentProps<TableComponent> = $props();
    const i18n = getI18n();

    const config = $derived(componentData.config);

    let wrapElement: HTMLDivElement | undefined = $state();
    /** The cell under the pointer or the focus, and where it is inside the wrapper, so the delete handles can be placed on its row and column */
    let hover = $state<{ row: number; col: number; top: number; left: number; width: number; height: number } | null>(null);

    /** Finds the cell of this table that holds the target. A table nested in a cell also bubbles its events up to this one */
    function findCell(target: EventTarget | null): HTMLTableCellElement | null {
        let cell = (target as Element | null)?.closest('td') ?? null;
        while (cell && cell.closest('.table-wrap') !== wrapElement) {
            cell = cell.parentElement?.closest('td') ?? null;
        }
        return cell;
    }

    function trackCell(event: Event) {
        if (mode !== 'edit' || !wrapElement) return;
        const cell = findCell(event.target);
        if (!cell) return;

        const box = cell.getBoundingClientRect();
        const wrap = wrapElement.getBoundingClientRect();
        const next = { row: Number(cell.dataset.row), col: Number(cell.dataset.col), top: box.top - wrap.top, left: box.left - wrap.left, width: box.width, height: box.height };
        // Moving the pointer inside a cell must not draw again
        if (!hover || (Object.keys(next) as (keyof typeof next)[]).some(key => hover![key] !== next[key])) hover = next;
    }

    function untrackOnFocusOut(event: FocusEvent) {
        if (!wrapElement?.contains(event.relatedTarget as Node | null)) hover = null;
    }

    /** Removes a row or a column with the components in its cells, and moves the following ones back */
    function deleteLine(axis: TableAxis, index: number) {
        if (!config) return;
        updateComponentValue(removeTableLine(componentData.value, axis, index), 'onchange');
        updateComponentConfig(axis === 'row' ? { ...config, rows: config.rows - 1 } : { ...config, cols: config.cols - 1 });
        hover = null;
    }
</script>

{#if config}
    <!-- The wrapper holds the delete handles, as the table clips whatever sticks out of it. It listens to the cells through event delegation -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="table-wrap"
        bind:this={wrapElement}
        onpointermove={trackCell}
        onfocusin={trackCell}
        onfocusout={untrackOnFocusOut}
        onpointerleave={() => (hover = null)}
    >
    <table class:no-borders={config.showBorders === false}>
        <tbody>
            {#each Array.from({ length: config.rows }) as _, rowIndex (`row-${rowIndex}`)}
                <tr>
                    {#each Array.from({ length: config.cols }) as _, colIndex (`col-${colIndex}`)}
                        <td data-row={rowIndex} data-col={colIndex}>
                            <!-- Every cell is a slot: it holds components like a section does -->
                            <ComponentSlot {componentData} slotKey={`${rowIndex}:${colIndex}`} {sectionId} {mode} {isDarkMode} />
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
    {#if mode === 'edit' && hover}
        {@const cell = hover}
        <!-- A table always keeps one row and one column: to remove it all, delete the table -->
        {#if config.rows > 1}
            <Button
                class="table-handle"
                variant="outline"
                size="icon-sm"
                style="top: {cell.top + cell.height / 2}px; left: 0;"
                aria-label={i18n.t('components.table.deleteRow')}
                title={i18n.t('components.table.deleteRow')}
                onclick={() => deleteLine('row', cell.row)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </Button>
        {/if}
        {#if config.cols > 1}
            <Button
                class="table-handle"
                variant="outline"
                size="icon-sm"
                style="top: 0; left: {cell.left + cell.width / 2}px;"
                aria-label={i18n.t('components.table.deleteColumn')}
                title={i18n.t('components.table.deleteColumn')}
                onclick={() => deleteLine('col', cell.col)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </Button>
        {/if}
    {/if}
    </div>
{:else}
    <EmptyContent
        message={i18n.t('errors.tableConfigMissing')}
        icon="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;24&quot; height=&quot;24&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-table2-icon lucide-table-2&quot;><path d=&quot;M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18&quot;/></svg>"
        isError
    />
{/if}

<style>
    .table-wrap {
        position: relative;
        flex: 1;
        min-width: 0;
    }

    /* Round buttons centred on the outer border of the table: the row one on the left edge, the column one on the top edge.
       The size has three classes so it wins over the size of the button, which has two */
    :global(.table-handle.scribe-btn.scribe-btn-size-icon-sm) {
        position: absolute;
        z-index: 2;
        width: 1.25rem;
        height: 1.25rem;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        color: var(--scribe-muted-foreground);
    }
    :global(.table-handle.scribe-btn.scribe-btn-size-icon-sm:hover:not(:disabled)) {
        color: var(--scribe-error-foreground);
        background-color: var(--scribe-error-wash);
        border-color: var(--scribe-error-soft);
    }

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
    /* The borders keep their width, so toggling them never moves the content */
    table.no-borders,
    .no-borders td {
        border-color: transparent;
    }
</style>
