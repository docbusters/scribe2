<script lang="ts">
	import { editStore } from "../../stores/edit-store.svelte.js";
    import { handleArrowNavigation, setupFocusListeners } from '../../utils/focusNavigation.ts';

    interface SectionTitleProps {
        isEditMode: boolean;
        sectionId: string;
        text: string[];
    }

    let { isEditMode, text, sectionId}: SectionTitleProps = $props();

    let titleElement: HTMLHeadingElement | null = $state(null);

    function handleTitleChange(event: Event & { currentTarget: EventTarget & HTMLHeadingElement; }) {
        const target = event.target as HTMLHeadingElement;
        editStore.editSectionTitle(sectionId, target.innerText);
    }

    function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLHeadingElement; }) {
        handleArrowNavigation(event, event.currentTarget);
    }

    $effect(() => {
        if (!titleElement) return;
        return setupFocusListeners(titleElement);
    });
</script>

{#key text}
    <h2 
        bind:this={titleElement}
        data-scribe-focusable="true"
        contenteditable={isEditMode} 
        onblur={handleTitleChange} 
        onkeydown={handleKeyDown}
        class="section-title"
    >
        {#each text as line, index (index)}
            {#if line === ''}
                <br>
            {:else}
                {line}
            {/if}
        {/each}
    </h2>
{/key}


<style>
    .section-title {
        outline: none;
        display: inline;
    }
   
</style>
