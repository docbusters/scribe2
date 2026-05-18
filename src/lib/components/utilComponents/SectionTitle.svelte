<script lang="ts">
	import { editStore } from "$lib/stores/edit-store.svelte.js";
    import { navigateToAdjacentComponent } from '$lib/utils/focusNavigation.js';

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
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const target = event.currentTarget;
        const range = selection.getRangeAt(0);

        const preRange = range.cloneRange();
        preRange.selectNodeContents(target);
        preRange.setEnd(range.startContainer, range.startOffset);
        const textBefore = preRange.toString();

        const postRange = range.cloneRange();
        postRange.selectNodeContents(target);
        postRange.setStart(range.endContainer, range.endOffset);
        const textAfter = postRange.toString();

        const isAtStart = textBefore.length === 0;
        const isAtEnd = textAfter.length === 0;

        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowUp': {
                if (isAtStart) {
                    event.preventDefault();
                    navigateToAdjacentComponent(target, 'up');
                }
                break;
            }
            case 'ArrowRight':
            case 'ArrowDown': {
                if (isAtEnd) {
                    event.preventDefault();
                    navigateToAdjacentComponent(target, 'down');
                }
                break;
            }
        }
    }

    function handleFocusStart() {
        if (!titleElement) return;
        titleElement.focus();
        
        // Move cursor to the start
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(titleElement, 0);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    function handleFocusEnd() {
        if (!titleElement) return;
        titleElement.focus();
        
        // Move cursor to the end
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(titleElement);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    $effect(() => {
        if (!titleElement) return;

        const onFocusStart = (e: Event) => {
            e.preventDefault();
            handleFocusStart();
        };

        const onFocusEnd = (e: Event) => {
            e.preventDefault();
            handleFocusEnd();
        };

        titleElement.addEventListener('scribe-focus-start', onFocusStart);
        titleElement.addEventListener('scribe-focus-end', onFocusEnd);

        return () => {
            titleElement?.removeEventListener('scribe-focus-start', onFocusStart);
            titleElement?.removeEventListener('scribe-focus-end', onFocusEnd);
        };
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
