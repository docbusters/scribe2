<script lang="ts" generics="C extends BaseComponent<string, DataValue> = never">
    import type { BaseComponent, GhostComponentMeta } from '../../domain/components/Component.ts';
    import type { DataValue, StringValue } from '../../domain/data/DataValue.ts';
    import { type DefaultComponents } from '../../registry/defaultRegistry.ts';
	import type { ParagraphSection } from '../../domain/Section.js';
	import type { ScribeMode } from '../../types/ScribeProps.js';
	import ComponentRenderer from '../component/ComponentRenderer.svelte';
	import { setCaretPosition } from '../../utils/focusNavigation.ts';
	
    interface ParagraphSectionProps {
        data: ParagraphSection<DefaultComponents | C>;
        mode: ScribeMode;
        isDarkMode: boolean;
    }

    let { data, mode, isDarkMode }: ParagraphSectionProps = $props();

    let sectionContainer: HTMLElement | null = $state(null);

    type ParagraphSectionItem = (DefaultComponents | C) & Partial<GhostComponentMeta>;

    function createGhostComponent(
        id: string,
        options?: GhostComponentMeta
    ): ParagraphSectionItem {
        return {
            id,
            type: 'text',
            mode: 'inline',
            value: { type: 'string', value: '' } as StringValue,
            insertAfterId: options?.insertAfterId ?? null,
            insertBeforeId: options?.insertBeforeId ?? null,
            isBetweenBlocks: options?.isBetweenBlocks ?? false
        } as unknown as ParagraphSectionItem;
    }

    let components = $derived.by(() => {
        const comps = Object.values(data.content) as ParagraphSectionItem[];
        if (mode !== 'edit') {
            return comps;
        }

        // If the section is completely empty, show a single ghost to write in
        if (comps.length === 0) {
            return [createGhostComponent('__ghost_empty', {
                insertAfterId: null,
                isBetweenBlocks: false
            })];
        }

        const result: ParagraphSectionItem[] = [];

        // Walk every gap of the section: before the first component, between each pair and after the last one.
        // A gap needs a ghost text only when neither neighbour is a text, as a text neighbour is already
        // a place to write (at its start or at its end).
        for (let i = 0; i <= comps.length; i++) {
            const prev: ParagraphSectionItem | undefined = comps[i - 1];
            const next: ParagraphSectionItem | undefined = comps[i];

            if (prev?.type !== 'text' && next?.type !== 'text') {
                // Ghost ids are derived from a neighbour so they stay stable when the section is recomputed
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

    /**
     * Moves the caret to the editable text closest to the pointer position.
     * Returns true when the focus was moved (the native pointer behaviour should then be prevented).
     */
    function focusClosestText(event: MouseEvent): boolean {
        if (mode !== 'edit' || !sectionContainer) return false;

        const target = event.target as HTMLElement | null;
        if (!target) return false;

        // Ignore clicks directly on interactive components or their inner controls
        if (target.closest('input, textarea, button, [contenteditable="true"], .component-editor, .scribe-dropdown-content')) {
            return false;
        }

        // Ignore clicks inside block components unless clicking on the container gap
        const blockContainer = target.closest('.block-component-container');
        if (blockContainer && blockContainer.contains(target) && target !== blockContainer) {
            return false;
        }

        // If clicked on an inline container that has an editable text, directly focus that text
        const inlineContainer = target.closest('.inline-component-container');
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

        const focusables = Array.from(
            sectionContainer.querySelectorAll<HTMLElement>('.edit-text[data-scribe-focusable="true"]')
        );
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
                setCaretPosition(candidateOnLine, { direction: 'left', x: clickX });
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
            setCaretPosition(targetEl, { direction: 'left', x: clickX });
        }
        return true;
    }

    function handleParagraphPointerDown(event: PointerEvent) {
        // Only prevent the native behaviour (focus, selection) when the caret was actually moved here,
        // so interactive block components such as maps or image resizers keep working
        if (focusClosestText(event)) {
            event.preventDefault();
        }
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="paragraph-section"
    data-section-id={data.id}
    bind:this={sectionContainer}
    onpointerdown={handleParagraphPointerDown}
>
    {#each components as component (component.id)}
        {#if component.mode === 'block'}
            <div class="block-component-container" data-item-id={component.id}>
                <ComponentRenderer componentData={component} sectionId={data.id} {mode} {isDarkMode} />
            </div>
        {:else}
            <div 
                class="inline-component-container"
                data-item-id={component.id}
                class:is-between-blocks={component.isBetweenBlocks}
            >
                <ComponentRenderer componentData={component} sectionId={data.id} {mode} {isDarkMode} />
            </div>
        {/if}
    {/each}
</div>

<style>
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
