<script lang="ts">
    import { editStore } from '../../stores/edit-store.svelte.js';
    import { handleArrowNavigation, setupFocusListeners } from '../../utils/focusNavigation.ts';

    interface DocumentTitleProps {
        isEditMode: boolean;
        text: string[];
    }

    let { isEditMode, text }: DocumentTitleProps = $props();

    let titleElement: HTMLHeadingElement | null = $state(null);

    function handleTitleChange(event: Event & { currentTarget: EventTarget & HTMLHeadingElement }) {
        const target = event.target as HTMLHeadingElement;
        console.log('New doc title value:', target.innerText);
        editStore.setDocumentTitle(target.innerText);
    }

    function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLHeadingElement }) {
        handleArrowNavigation(event, event.currentTarget);
    }

    $effect(() => {
        if (!titleElement) return;
        return setupFocusListeners(titleElement);
    });
</script>

<div class="title-container">
    {#key text}
        <h1 
            bind:this={titleElement}
            data-scribe-focusable="true"
            contenteditable={isEditMode} 
            onblur={handleTitleChange} 
            onkeydown={handleKeyDown}
            class="document-title"
        >
            {#each text as line, index (index)}
                {#if line === ''}
                    <br>
                {:else}
                    {line}
                {/if}
            {/each}
        </h1>
    {/key}
</div>

<style>
    .title-container {
        display: inline;
    }

    .document-title {
        outline: none;
        display: inline;
    }
</style>
