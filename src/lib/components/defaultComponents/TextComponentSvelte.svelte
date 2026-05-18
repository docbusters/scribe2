<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { TextComponent } from '$lib/domain/components/DefaultComponents.js';
	import type { StringValue } from '$lib/domain/data/DataValue.js';
	import { editStore } from '$lib/stores/edit-store.svelte.js';
	import { toolbarStore } from '$lib/stores/toolbar-store.svelte.js';
	import { parseStringForContentEditable } from '$lib/utils/parseStringForContentEditable.js';
    import { navigateToAdjacentComponent } from '$lib/utils/focusNavigation.js';

    let { componentData, sectionId, mode }: ScribeComponentProps<TextComponent> = $props();

    function handleTextChange(event: Event & { currentTarget: EventTarget & HTMLDivElement; }) {
        if (isEmpty) return;
        const target = event.target as HTMLDivElement;
        const newValue: StringValue = { type: 'string', value: target.innerText };
        console.log('New value:', newValue);
        const success = editStore.setComponentValue(sectionId, componentData.id, newValue);
        
        // If the component is not found, we can assume it is a blank space
        if (!success) {
            // We add a new text component with the value and remove the ghost component
            const newId = editStore.addComponent(sectionId, null, 'text');
            if (typeof newId === 'string') {
                editStore.setComponentValue(sectionId, newId, newValue);
                
                // Clear the ghost component UI visually
                target.innerText = '';
                isEmpty = true;
            }
        }
    }

    function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement; }) {
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
            case 'Delete': {
                if (isAtEnd) {
                    // Try to delete br at the end of the contenteditable, as contenteditable adds an extra <br>
                    if (target.lastElementChild?.tagName === 'BR') {
                        target.lastElementChild.remove();
                        event.preventDefault();
                    }
                }
                break;
            }
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
            case ' ': {
                if (!event.ctrlKey) return;

                const isSpaceBefore = isAtStart || /\s$/.test(textBefore);
                const isSpaceAfter = isAtEnd || /^\s/.test(textAfter);

                // If the space is part of a word, do nothing special
                if (!isSpaceBefore && !isSpaceAfter) {
                    return;
                }

                // Show the add component dropdown
                let rect = range.getBoundingClientRect();

                // If the div is empty we center the dropdown based on the div's bounding rect
                if (rect.x === 0 && rect.y === 0) {
                    rect = target.getBoundingClientRect();
                }
                toolbarStore.open(rect.x, rect.bottom, sectionId, componentData.id, isEmpty);

                event.preventDefault(); // Prevent adding an actual space character
                break;
            }
        }
    }

    let value = $derived(parseStringForContentEditable(componentData.value.value));
    let isEmpty = $derived(componentData.value.value === '');

    function handleInput(event: Event) {
        const target = event.target as HTMLDivElement;
        isEmpty = (target.textContent || '').length === 0;
    }

    let textDiv: HTMLDivElement | null = $state(null);

    function handleFocusStart() {
        if (!textDiv) return;
        textDiv.focus();
        
        // Move cursor to the start
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(textDiv, 0);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    function handleFocusEnd() {
        if (!textDiv) return;
        textDiv.focus();
        
        // Move cursor to the end
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(textDiv);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    $effect(() => {
        if (!textDiv) return;

        const onFocusStart = (e: Event) => {
            e.preventDefault();
            handleFocusStart();
        };

        const onFocusEnd = (e: Event) => {
            e.preventDefault();
            handleFocusEnd();
        };

        textDiv.addEventListener('scribe-focus-start', onFocusStart);
        textDiv.addEventListener('scribe-focus-end', onFocusEnd);

        return () => {
            textDiv?.removeEventListener('scribe-focus-start', onFocusStart);
            textDiv?.removeEventListener('scribe-focus-end', onFocusEnd);
        };
    });
</script>

{#key value}
    <div 
        bind:this={textDiv}
        data-scribe-focusable="true"
        role="textbox" 
        tabindex="0" 
        class="edit-text" 
        class:scribe-animation-pulse={isEmpty && mode === 'edit'}
        class:is-empty={isEmpty && mode === 'edit'}
        data-placeholder="Press Ctrl + Space to add a component..."
        contenteditable={mode === 'edit'} 
        onblur={handleTextChange} 
        oninput={handleInput}
        onkeydown={handleKeyDown}>
        {#if mode === 'view'}
            {componentData.value.value}
        {:else if mode === 'edit'}
            {#each value as line, index (index)}
                {#if line === ''}
                    <br>
                {:else}
                    {line}
                {/if}
            {/each}
        {/if}
    </div>
{/key}

<style>
    .edit-text {
        outline: none;
        display: inline-block;
        min-height: 1em;
        position: relative;
    }

    .edit-text.is-empty:focus::before {
        content: attr(data-placeholder);
        color: var(--scribe-muted-foreground);
        pointer-events: none;
        user-select: none;
        cursor: text;
    }
</style>
