<script lang="ts">
	import { editStore } from '$lib/stores/edit-store.svelte.js';
    /* eslint-disable svelte/no-at-html-tags */
	import { globalRegistry } from '$lib/stores/global-registry.svelte.js';
	import { toolbarStore } from '$lib/stores/toolbar-store.svelte.js';
	import { DropdownMenu } from 'bits-ui';

    // We dont want to insert text components as they can be added by simply writing
    let components = $derived(Object.entries(globalRegistry.components || {}).filter(([key]) => key !== 'text'));

    function insertChildComponent(componentType: string) {
        if (!toolbarStore.sectionId) return;
        editStore.addComponent(toolbarStore.sectionId, toolbarStore.componentId, componentType, toolbarStore.shouldReplaceComponent);
        toolbarStore.close();
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

	<DropdownMenu.Content class="dropdown-content" side="bottom" align="start">
        {#each components as [componentType, component] (component.name)}
            <DropdownMenu.Item class="dropdown-item" onclick={() => {
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
        <div class="help-container">Press ENTER to add component</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<style>
    .dropdown-trigger {
        -webkit-user-select: none;
        user-select: none;
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
        margin: 0.5rem 0.25rem 0.25rem 0.5rem;
        font-size: var(--scribe-font-size-xs);
        color: var(--scribe-muted-foreground);
        user-select: none;
    }
</style>
