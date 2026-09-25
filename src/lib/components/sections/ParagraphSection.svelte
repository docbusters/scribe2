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

        const result: ParagraphSectionItem[] = [];

        for (let i = 0; i < comps.length; i++) {
            const current = comps[i];

            // If the section starts with a block component, insert a ghost before it
            if (i === 0 && current.mode === 'block') {
                result.push(createGhostComponent(`__ghost_start_${current.id}`, {
                    insertBeforeId: current.id,
                    isBetweenBlocks: true
                }));
            }

            result.push(current);

            const next = comps[i + 1];

            if (next) {
                const isInlineNonTextToBlock = current.mode === 'inline' && current.type !== 'text' && next.mode === 'block';
                const isBlockToBlock = current.mode === 'block' && next.mode === 'block';
                const isBlockToInlineNonText = current.mode === 'block' && next.mode === 'inline' && next.type !== 'text';

                if (isInlineNonTextToBlock) {
                    result.push(createGhostComponent(`__ghost_after_${current.id}`, {
                        insertAfterId: current.id,
                        isBetweenBlocks: false
                    }));
                } else if (isBlockToBlock) {
                    result.push(createGhostComponent(`__ghost_after_${current.id}`, {
                        insertAfterId: current.id,
                        isBetweenBlocks: true
                    }));
                } else if (isBlockToInlineNonText) {
                    result.push(createGhostComponent(`__ghost_before_${next.id}`, {
                        insertBeforeId: next.id,
                        isBetweenBlocks: false
                    }));
                }
            } else {
                // End of section: if last component is a block or an inline non-text component
                if (current.mode === 'block') {
                    result.push(createGhostComponent(`__ghost_after_${current.id}`, {
                        insertAfterId: current.id,
                        isBetweenBlocks: true
                    }));
                } else if (current.mode === 'inline' && current.type !== 'text') {
                    result.push(createGhostComponent(`__ghost_after_${current.id}`, {
                        insertAfterId: current.id,
                        isBetweenBlocks: false
                    }));
                }
            }
        }

        // If the section is completely empty, insert a starting ghost
        if (comps.length === 0) {
            result.push(createGhostComponent('__ghost_empty', {
                insertAfterId: null,
                isBetweenBlocks: false
            }));
        }

        return result;
    });

    function handleParagraphClick(event: MouseEvent) {
        if (mode !== 'edit' || !sectionContainer) return;

        const target = event.target as HTMLElement | null;
        if (!target) return;

        // Ignore clicks directly on interactive components or their inner controls
        if (target.closest('input, textarea, button, [contenteditable="true"], .component-editor, .scribe-dropdown-content')) {
            return;
        }

        // Ignore clicks inside block components unless clicking on the container gap
        const blockContainer = target.closest('.block-component-container');
        if (blockContainer && blockContainer.contains(target) && target !== blockContainer) {
            return;
        }

        // If clicked on an inline container that has an editable text, directly focus that text
        const inlineContainer = target.closest('.inline-component-container');
        if (inlineContainer) {
            const editInside = inlineContainer.querySelector<HTMLElement>('.edit-text[data-scribe-focusable="true"]');
            if (editInside) {
                editInside.focus();
                setCaretPosition(editInside, { direction: 'right' });
                return;
            }
        }

        const clickX = event.clientX;
        const clickY = event.clientY;

        const focusables = Array.from(
            sectionContainer.querySelectorAll<HTMLElement>('.edit-text[data-scribe-focusable="true"]')
        );
        if (focusables.length === 0) return;

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
            return;
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
        if (targetEl) {
            targetEl.focus();
            if (targetEl.classList.contains('is-ghost') || targetEl.classList.contains('is-empty')) {
                setCaretPosition(targetEl, { direction: 'right' });
            } else {
                setCaretPosition(targetEl, { direction: 'left', x: clickX });
            }
        }
    }

    function handleParagraphPointerDown(event: PointerEvent) {
        if (mode !== 'edit' || !sectionContainer) return;
        const target = event.target as HTMLElement | null;
        if (!target) return;
        if (target.closest('input, textarea, button, [contenteditable="true"], .component-editor, .scribe-dropdown-content')) {
            return;
        }
        event.preventDefault();
        handleParagraphClick(event);
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
    class="paragraph-section" 
    data-section-id={data.id}
    bind:this={sectionContainer}
    onclick={handleParagraphClick}
    onpointerdown={handleParagraphPointerDown}
>
    {#each components as component, index (`${data.id}-${component.id}-${index}`)}
        {#if component.mode === 'block'}
            <div class="block-component-container">
                <ComponentRenderer componentData={component} sectionId={data.id} {mode} {isDarkMode} />
            </div>
        {:else}
            <div 
                class="inline-component-container"
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
