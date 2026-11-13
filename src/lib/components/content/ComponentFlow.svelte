<script lang="ts">
    import type { BaseComponent, ComponentConfig, GhostComponentMeta, SlotRef } from '../../domain/components/Component.ts';
    import type { DataValue } from '../../domain/data/DataValue.ts';
    import type { ScribeMode } from '../../types/ScribeProps.js';
    import ComponentRenderer from '../component/ComponentRenderer.svelte';
    import { setCaretFromPoint, setCaretPosition } from '../../utils/focusNavigation.ts';
    import { untrack } from 'svelte';

    /**
     * The flow of components of a section or of a slot: the components one after another, with the ghost texts that
     * give a place to write between them in edit mode. A section and every slot (see ComponentSlot) render their content with it
     */
    interface ComponentFlowProps {
        /** The components in order */
        components: BaseComponent<string, DataValue, ComponentConfig | undefined>[];
        sectionId: string;
        mode: ScribeMode;
        isDarkMode: boolean;
        /** The slot the components belong to, or null when they are the content of the section */
        slot: SlotRef | null;
        /** The element of the flow, so the owner can find the texts in it */
        container?: HTMLElement | null;
    }

    let { components, sectionId, mode, isDarkMode, slot, container = $bindable(null) }: ComponentFlowProps = $props();

    let wrapperElement: HTMLElement | null = $state(null);

    type FlowItem = BaseComponent<string, DataValue, ComponentConfig | undefined> & Partial<GhostComponentMeta>;

    function createGhostComponent(id: string, options?: GhostComponentMeta): FlowItem {
        return {
            id,
            type: 'text',
            mode: 'inline',
            value: { type: 'string', value: '' },
            insertAfterId: options?.insertAfterId ?? null,
            insertBeforeId: options?.insertBeforeId ?? null,
            isBetweenBlocks: options?.isBetweenBlocks ?? false,
            slot
        };
    }

    let items = $derived.by(() => {
        if (mode !== 'edit') {
            return components as FlowItem[];
        }

        // If the flow is completely empty, show a single ghost to write in. It is alone in its flow, so the text draws it as a full
        // width line (see is-alone) that is shaped like a line of text, and typing in it does not move the text
        if (components.length === 0) {
            return [createGhostComponent(slot ? `__ghost_slot_${slot.parentId}_${slot.slotKey}` : '__ghost_empty', {
                insertAfterId: null
            })];
        }

        const result: FlowItem[] = [];

        // Walk every gap of the flow: before the first component, between each pair and after the last one.
        // A gap needs a ghost text only when neither neighbour is a text, as a text neighbour is already
        // a place to write (at its start or at its end).
        for (let i = 0; i <= components.length; i++) {
            const prev: FlowItem | undefined = components[i - 1];
            const next: FlowItem | undefined = components[i];

            if (prev?.type !== 'text' && next?.type !== 'text') {
                // Ghost ids are derived from a neighbour so they stay stable when the flow is recomputed
                const isBetweenBlocks = (!prev || prev.mode === 'block') && (!next || next.mode === 'block');
                result.push(next
                    ? createGhostComponent(`__ghost_before_${next.id}`, { insertBeforeId: next.id, isBetweenBlocks })
                    : createGhostComponent(`__ghost_end_${prev!.id}`, { insertAfterId: prev!.id, isBetweenBlocks })
                );
            }

            if (next) {
                result.push(next);
            }
        }

        return result;
    });

    /* * OWNERSHIP * */
    // A slot is a flow inside the component of another flow, so every lookup in the DOM must ignore what belongs to
    // the flows nested in this one. Without it a click inside a table cell would be handled as a click in the section

    const FLOW_SELECTOR = '.component-flow';

    /** Whether the element is in this flow and not in one nested in it */
    function isOwned(element: Element): boolean {
        return element.closest(FLOW_SELECTOR) === container;
    }

    /** The closest ancestor of the element (itself included) matching the selector that is in this flow */
    function closestOwned(from: Element, selector: string): HTMLElement | null {
        for (let found = from.closest<HTMLElement>(selector); found; found = found.parentElement?.closest<HTMLElement>(selector) ?? null) {
            if (isOwned(found)) return found;
        }
        return null;
    }

    /** The elements matching the selector that are in this flow */
    function queryOwned(selector: string): HTMLElement[] {
        if (!container) return [];
        return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(isOwned);
    }

    /**
     * Moves the caret to the editable text closest to the pointer position.
     * Returns true when the focus was moved (the native pointer behaviour should then be prevented).
     */
    function focusClosestText(event: MouseEvent): boolean {
        if (mode !== 'edit' || !container) return false;

        const target = event.target as HTMLElement | null;
        if (!target) return false;

        // Ignore clicks directly on interactive components or their inner controls
        if (target.closest('input, textarea, button, [contenteditable="true"], .scribe-dropdown-content')) {
            return false;
        }

        // Ignore clicks inside block components unless clicking on the container gap
        const blockContainer = closestOwned(target, '.block-component-container');
        if (blockContainer && blockContainer.contains(target) && target !== blockContainer) {
            return false;
        }

        // If clicked on an inline container that has an editable text, directly focus that text
        const inlineContainer = closestOwned(target, '.inline-component-container');
        if (inlineContainer) {
            const editInside = inlineContainer.querySelector<HTMLElement>('.edit-text[data-scribe-focusable="true"]');
            if (editInside) {
                editInside.focus();
                setCaretPosition(editInside, { direction: 'right' });
                return true;
            }
        }

        const clickX = event.clientX;
        const clickY = event.clientY;

        const focusables = queryOwned('.edit-text[data-scribe-focusable="true"]');
        if (focusables.length === 0) return false;

        // 1. Check if the click falls on the visual line of focusable elements, finding the closest horizontally
        let candidateOnLine: HTMLElement | null = null;
        let minDx = Infinity;

        for (const el of focusables) {
            const rects = Array.from(el.getClientRects());
            for (const r of rects) {
                if (clickY >= r.top - 8 && clickY <= r.bottom + 8) {
                    let dx = 0;
                    if (clickX < r.left) {
                        dx = r.left - clickX;
                    } else if (clickX > r.right) {
                        dx = clickX - r.right;
                    }
                    if (dx < minDx) {
                        minDx = dx;
                        candidateOnLine = el;
                    }
                }
            }
        }

        if (candidateOnLine) {
            candidateOnLine.focus();
            if (candidateOnLine.classList.contains('is-ghost') || candidateOnLine.classList.contains('is-empty')) {
                setCaretPosition(candidateOnLine, { direction: 'right' });
            } else {
                setCaretFromPoint(candidateOnLine, clickX, clickY);
            }
            return true;
        }

        // 2. If click is between blocks or in a vertical void, find the closest focusable vertically
        let bestCandidate: HTMLElement | null = null;
        let minDy = Infinity;

        for (const el of focusables) {
            const rect = el.getBoundingClientRect();
            const candidateCenter = (rect.top + rect.bottom) / 2;
            const dy = Math.abs(clickY - candidateCenter);
            if (dy < minDy) {
                minDy = dy;
                bestCandidate = el;
            }
        }

        const targetEl = bestCandidate || focusables[focusables.length - 1];
        targetEl.focus();
        if (targetEl.classList.contains('is-ghost') || targetEl.classList.contains('is-empty')) {
            setCaretPosition(targetEl, { direction: 'right' });
        } else {
            setCaretFromPoint(targetEl, clickX, clickY);
        }
        return true;
    }

    /* * HOVER HIGHLIGHT * */

    /** A rectangle relative to the flow */
    interface RowExtension {
        left: number;
        top: number;
        width: number;
        height: number;
    }

    let hoverExtensions = $state<RowExtension[]>([]);
    let isHoverVisible = $state(false);
    let hoveredTextEl: HTMLElement | null = null;

    /**
     * Returns the blank space at the right of every row of a text that continues on the next row, up to the
     * right edge of the flow. Without it that space is not highlighted, as the row only holds a line break.
     */
    function getRowExtensions(textEl: HTMLElement): RowExtension[] {
        if (!container || !wrapperElement) return [];

        // Coordinates are relative to the wrapper, which has the same box as the flow
        const containerRect = wrapperElement.getBoundingClientRect();
        const paddingRight = parseFloat(window.getComputedStyle(container).paddingRight) || 0;
        const rightEdge = containerRect.right - paddingRight;

        const rects = Array.from(textEl.getClientRects());
        const extensions: RowExtension[] = [];

        // The last rect is where the text ends, so only the previous rows are extended
        for (let i = 0; i < rects.length - 1; i++) {
            const rect = rects[i];
            const width = rightEdge - rect.right;
            if (width <= 1) continue;
            extensions.push({
                left: rect.right - containerRect.left,
                top: rect.top - containerRect.top,
                width,
                height: rect.height
            });
        }
        return extensions;
    }

    /** Where the hover class goes: the wrapper of the text, or the editable itself for a ghost, which has no wrapper until it is saved */
    function getHoverTarget(textEl: HTMLElement): HTMLElement {
        return textEl.closest<HTMLElement>('.component-edit-contents') ?? textEl;
    }

    function setHoveredText(textEl: HTMLElement | null) {
        if (hoveredTextEl !== textEl) {
            if (hoveredTextEl) getHoverTarget(hoveredTextEl).classList.remove('is-line-hovered');
            if (textEl) getHoverTarget(textEl).classList.add('is-line-hovered');
            hoveredTextEl = textEl;
        }

        isHoverVisible = !!textEl;

        // When the hover ends the last extensions are kept, so the layer can fade out where it was
        if (!textEl) return;

        // The rows depend on the layout, so they are measured again every time instead of being cached
        const next = getRowExtensions(textEl);
        const current = untrack(() => hoverExtensions);

        // Skip the assignment when nothing changed, so a pointer moving inside a text does not re-render
        const isSame = next.length === current.length && next.every((ext, i) =>
            ext.left === current[i].left && ext.top === current[i].top
            && ext.width === current[i].width && ext.height === current[i].height
        );
        if (!isSame) {
            hoverExtensions = next;
        }
    }

    /** Finds the text the pointer is over, either directly or through the blank space of one of its rows */
    function resolveHoveredText(event: PointerEvent): HTMLElement | null {
        const target = event.target as HTMLElement | null;
        if (!target || !container || !wrapperElement) return null;

        const inlineContainer = closestOwned(target, '.inline-component-container');
        if (inlineContainer) {
            const id = inlineContainer.dataset.itemId ?? '';
            return inlineContainer.querySelector<HTMLElement>(
                `.edit-text[data-component-id="${CSS.escape(id)}"]:not(.is-empty)`
            );
        }

        if (target !== container) return null;

        const containerRect = wrapperElement.getBoundingClientRect();
        const x = event.clientX - containerRect.left;
        const y = event.clientY - containerRect.top;

        for (const text of queryOwned('.edit-text[data-component-id]:not(.is-empty)')) {
            const isOverExtension = getRowExtensions(text).some(ext =>
                x >= ext.left && x <= ext.left + ext.width && y >= ext.top && y <= ext.top + ext.height
            );
            if (isOverExtension) return text;
        }
        return null;
    }

    function handlePointerMove(event: PointerEvent) {
        setHoveredText(resolveHoveredText(event));
    }

    function handleInput() {
        // Typing can change the rows of the hovered text, so its extensions are measured again once the DOM settles
        if (!hoveredTextEl) return;
        requestAnimationFrame(() => {
            if (hoveredTextEl) setHoveredText(hoveredTextEl);
        });
    }

    function handlePointerDown(event: PointerEvent) {
        // Only prevent the native behaviour (focus, selection) when the caret was actually moved here,
        // so interactive block components such as maps or image resizers keep working
        if (focusClosestText(event)) {
            event.preventDefault();
        }
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="component-flow-wrapper" bind:this={wrapperElement}>
    <!-- The hover layer is a sibling of the flow, so it never takes part in its line layout -->
    {#if mode === 'edit'}
        <div class="line-hover-layer" class:is-visible={isHoverVisible} aria-hidden="true">
            {#each hoverExtensions as extension, index (index)}
                <div
                    class="line-hover-extension"
                    style="left: {extension.left}px; top: {extension.top}px; width: {extension.width}px; height: {extension.height}px;"
                ></div>
            {/each}
        </div>
    {/if}
    <div
        class="component-flow"
        data-section-id={sectionId}
        bind:this={container}
        onpointerdown={handlePointerDown}
        onpointermove={mode === 'edit' ? handlePointerMove : undefined}
        onpointerleave={mode === 'edit' ? () => setHoveredText(null) : undefined}
        oninput={mode === 'edit' ? handleInput : undefined}
    >
        {#each items as component (component.id)}
            {#if component.mode === 'block'}
                <div class="block-component-container" data-item-id={component.id}>
                    <ComponentRenderer componentData={component} {sectionId} {mode} {isDarkMode} />
                </div>
            {:else}
                <div
                    class="inline-component-container"
                    data-item-id={component.id}
                    class:is-between-blocks={component.isBetweenBlocks}
                >
                    <ComponentRenderer componentData={component} {sectionId} {mode} {isDarkMode} />
                </div>
            {/if}
        {/each}
    </div>
</div>

<style>
    /* A percentage height is ignored when the parent has none (a section), so a slot is the only flow that fills its parent */
    .component-flow-wrapper {
        position: relative;
        height: 100%;
    }

    .component-flow {
        height: 100%;
    }

    /* The fade uses the same duration and easing as the background of .component-edit-contents in
       ComponentRenderer.svelte, so the text and the blank space of its rows appear and fade together */
    .line-hover-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .line-hover-layer.is-visible {
        opacity: 1;
    }

    /* Highlights the blank space of a row that only holds a line break, like the hover of the text itself */
    .line-hover-extension {
        position: absolute;
        background-color: var(--scribe-selection-color);
        border-top-right-radius: var(--scribe-radius-sm);
        border-bottom-right-radius: var(--scribe-radius-sm);
    }

    .block-component-container {
        display: flex;
        width: 100%;
        margin: 1rem 0;
        position: relative;
    }

    .inline-component-container {
        display: inline;
        line-height: 1.5rem;
        position: relative;
    }

    .inline-component-container.is-between-blocks {
        display: flex;
        align-items: center;
        width: 100%;
        min-height: 1.75rem;
        margin: 0.25rem 0;
        position: relative;
        cursor: text;
    }
</style>
