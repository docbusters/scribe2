<script lang="ts">
	import { editStore } from '../../stores/edit-store.svelte.js';
    /* eslint-disable svelte/no-at-html-tags */
	import { globalRegistry } from '../../stores/global-registry.svelte.js';
	import { toolbarStore } from '../../stores/toolbar-store.svelte.js';
	import { DropdownMenu } from 'bits-ui';
	import ScrollArea from '../utilComponents/ScrollArea.svelte';
	import { setCaretPosition } from '../../utils/focusNavigation.js';

    // We dont want to insert text components as they can be added by simply writing
    let components = $derived(Object.entries(globalRegistry.components || {}).filter(([key]) => key !== 'text'));

    let wasEscapePressed = $state(false);

    $effect(() => {
        if (toolbarStore.isOpen) {
            wasEscapePressed = false;
        }
    });

    function handleEscapeKeydown() {
        wasEscapePressed = true;
    }

    function handleCloseAutoFocus(event: Event) {
        if (wasEscapePressed && toolbarStore.restoreFocus) {
            event.preventDefault();
            const restore = toolbarStore.restoreFocus;
            toolbarStore.restoreFocus = null;
            wasEscapePressed = false;
            requestAnimationFrame(() => {
                restore();
            });
        }
    }

    function insertChildComponent(componentType: string) {
        if (!toolbarStore.sectionId) return;

        const sectionId = toolbarStore.sectionId;
        const componentId = toolbarStore.componentId;
        const mode = toolbarStore.insertionMode;
        const splitData = toolbarStore.splitData || undefined;

        // Clear restoreFocus so we don't refocus the previous text component on close
        toolbarStore.restoreFocus = null;
        wasEscapePressed = false;

        const result = editStore.insertComponent(
            sectionId, 
            componentId, 
            componentType, 
            {
                mode,
                splitData,
            }
        );
        toolbarStore.close();

        if (result && result.rightTextId !== undefined) {
            // Allow Svelte to render and reconcile DOM changes before placing focus
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const sectionEl = document.querySelector(`[data-section-id="${sectionId}"]`)
                        || document.querySelector('.paragraph-section');

                    let targetEl: HTMLElement | null = null;
                    if (result.rightTextId) {
                        targetEl = document.querySelector(`[data-component-id="${result.rightTextId}"]`);
                    }
                    if (!targetEl && sectionEl) {
                        targetEl = sectionEl.querySelector('.edit-text.is-empty') 
                            || sectionEl.querySelector('.edit-text:last-of-type');
                    }

                    if (targetEl) {
                        setCaretPosition(targetEl, { direction: 'right' });
                    }
                });
            });
        }
    }
</script>

<DropdownMenu.Root bind:open={toolbarStore.isOpen}>
	<div style="position: fixed; top: {toolbarStore.position.y}px; left: {toolbarStore.position.x}px; width: 0; height: 0; pointer-events: none;">
        <DropdownMenu.Trigger tabindex={-1}>
            {#snippet child({props})}
                <div class="dropdown-trigger" {...props}></div>
            {/snippet}
        </DropdownMenu.Trigger>
    </div>

	<DropdownMenu.Content 
        class="scribe-dropdown-content" 
        side="bottom" 
        align="start" 
        collisionPadding={8}
        onEscapeKeydown={handleEscapeKeydown}
        onCloseAutoFocus={handleCloseAutoFocus}
    >
        <ScrollArea orientation="vertical" class="scribe-dropdown-scrollarea" viewportClasses="scribe-dropdown-viewport">
            <div class="dropdown-items-list">
                {#each components as [componentType, component] (component.name)}
                    <DropdownMenu.Item class="scribe-dropdown-item" onfocus={(e) => {
                        e.currentTarget?.scrollIntoView({ block: 'nearest' });
                    }} onclick={() => {
                        insertChildComponent(componentType);
                        toolbarStore.close();
                    }}>
                        <div class="dropdown-item-icon">
                            {@html component.icon}
                        </div>
                        <div class="dropdown-item-content">
                            {component.name}
                            <span>{component.description}</span>
                        </div>
                    </DropdownMenu.Item>
                {/each}
            </div>
        </ScrollArea>
        <div class="help-container">Press ENTER to add a component</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<style>
    .dropdown-trigger {
        -webkit-user-select: none;
        user-select: none;
    }

    :global(.scribe-dropdown-scrollarea) {
        flex: 1 1 auto;
        min-height: 0;
        width: 100%;
        overflow: hidden;
        padding-right: 0.25rem;
        display: flex;
        flex-direction: column;
    }

    :global(.scribe-dropdown-viewport) {
        width: 100%;
        height: 100%;
        min-height: 0;
    }

    .dropdown-items-list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding-right: 0.5rem;
    }

    .dropdown-item-content {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .dropdown-item-icon {
        min-height: 2rem;
        min-width: 2rem;
        max-width: 2rem;
        max-height: 2rem;
        margin-right: 1rem;
        border: 1px solid var(--scribe-border-color);
        border-radius: var(--scribe-radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .dropdown-item-content span {
        font-size: var(--scribe-font-size-xs);
        color: var(--scribe-muted-foreground);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .help-container {
        flex-shrink: 0;
        margin: 0.5rem 0.25rem 0.25rem 0.5rem;
        font-size: var(--scribe-font-size-xs);
        color: var(--scribe-muted-foreground);
        user-select: none;
    }
</style>
