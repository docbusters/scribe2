<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { TextComponent } from '$lib/domain/components/DefaultComponents.js';
	import type { StringValue } from '$lib/domain/data/DataValue.js';
	import { editStore } from '$lib/stores/edit-store.svelte.js';
	import { toolbarStore } from '$lib/stores/toolbar-store.svelte.js';
	import { parseStringForContentEditable } from '$lib/utils/parseStringForContentEditable.js';
    import { navigateToAdjacentComponent } from '$lib/utils/focusNavigation.js';
	import { textFormatToolbarStore } from '$lib/stores/text-format-toolbar-store.svelte.js';

    let { componentData, sectionId, mode }: ScribeComponentProps<TextComponent> = $props();

    let value = $derived(parseStringForContentEditable(componentData.value.value));
    let isEmpty = $derived(componentData.value.value === '');
    let config = $derived(componentData.config || {});

    function handleTextChange(event: Event & { currentTarget: EventTarget & HTMLSpanElement; }) {
        if (isEmpty) return;
        const target = event.target as HTMLSpanElement;
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

    function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLSpanElement; }) {
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
            case 'ArrowLeft': {
                if (isAtStart) {
                    event.preventDefault();
                    navigateToAdjacentComponent(target, 'up');
                }
                break;
            }
            case 'ArrowUp': {
                const caretRect = range.getBoundingClientRect();
                const targetRect = target.getBoundingClientRect();
                
                // If the distance from the top edge is less than the height of the cursor we are on the first line
                if (isAtStart || (caretRect.top >= 0 && (caretRect.top - targetRect.top) <= caretRect.height)) {
                    event.preventDefault();
                    navigateToAdjacentComponent(target, 'up');
                }
                break;
            }
            case 'ArrowRight': {
                if (isAtEnd) {
                    event.preventDefault();
                    navigateToAdjacentComponent(target, 'down');
                }
                break;
            }
            case 'ArrowDown': {
                const caretRect = range.getBoundingClientRect();
                const targetRect = target.getBoundingClientRect();
                
                // If the distance from the bottom edge is less than the height of the cursor we are on the last line
                if (isAtEnd || (caretRect.bottom > 0 && (targetRect.bottom - caretRect.bottom) <= caretRect.height)) {
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

    function handleInput(event: Event) {
        const target = event.target as HTMLSpanElement;
        isEmpty = (target.textContent || '').length === 0;
    }

    function handleSelectionChange() {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            textFormatToolbarStore.close();
            return;
        }

        // Check if the selection is within our text div
        if (textDiv && textDiv.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);
            
            // Calculate the selected text indexes
            const preRange = range.cloneRange();
            preRange.selectNodeContents(textDiv);
            preRange.setEnd(range.startContainer, range.startOffset);
            
            const startIndex = preRange.toString().length;
            const selectedText = range.toString();
            const endIndex = startIndex + selectedText.length;
            
            // Get the position of the start of the selection to position the toolbar
            const startRange = range.cloneRange();
            startRange.collapse(true);
            const rect = startRange.getBoundingClientRect();

            console.log('Selection changed:', { startIndex, endIndex, selectedText });
            
            // Obtain the position to display the toolbar
            const selectionRange = {
                start: startIndex,
                end: endIndex,
                text: selectedText
            }
            textFormatToolbarStore.open(rect.x, rect.top, sectionId, componentData.id, selectionRange, componentData.config || null);
        }
    }

    let textDiv: HTMLSpanElement | null = $state(null);

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
    <span 
        bind:this={textDiv}
        data-scribe-focusable="true"
        role="textbox" 
        tabindex="0" 
        class="edit-text" 
        class:scribe-animation-pulse={isEmpty && mode === 'edit'}
        class:is-empty={isEmpty && mode === 'edit'}
        class:is-bold={config.bold}
        class:is-italic={config.italic}
        class:is-underline={config.underline}
        class:is-strikethrough={config.strikethrough}
        data-placeholder="Press Ctrl + Space to add a component..."
        contenteditable={mode === 'edit'} 
        onblur={handleTextChange} 
        oninput={handleInput}
        onkeydown={handleKeyDown}
        onkeyup={handleSelectionChange}
        onpointerup={handleSelectionChange}
    >
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
    </span>
{/key}

<style>
    .edit-text {
        outline: none;
        display: inline;
        position: relative;
    }

    .edit-text.is-empty {
        display: inline-block;
        min-width: 1ch;
        min-height: 1em;
    }

    .edit-text.is-empty:focus::before {
        content: attr(data-placeholder);
        color: var(--scribe-muted-foreground);
        pointer-events: none;
        user-select: none;
        cursor: text;
    }

    .is-bold {
        font-weight: var(--scribe-font-weight-bold);
    }

    .is-italic {
        font-style: italic;
    }

    .is-underline {
        text-decoration: underline;
    }

    .is-strikethrough {
        text-decoration: line-through;
    }
</style>
