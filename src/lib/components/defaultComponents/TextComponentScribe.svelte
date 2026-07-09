<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { TextComponent } from '../../domain/components/DefaultComponents.ts';
	import type { StringValue } from '../../domain/data/DataValue.ts';
	import { editStore } from '../../stores/edit-store.svelte.ts';
	import { toolbarStore } from '../../stores/toolbar-store.svelte.ts';
	import { parseStringForContentEditable } from '../../utils/parseStringForContentEditable.ts';
    import { navigateToAdjacentComponent } from '../../utils/focusNavigation.ts';
	import { textFormatToolbarStore } from '../../stores/text-format-toolbar-store.svelte.ts';
	import { BOLD_CHAR, ITALIC_CHAR, STRIKETHROUGH_CHAR, UNDERLINE_CHAR } from '../../constants/DocumentConstants.ts';
	import { getSelection } from '../../utils/selection.ts';


    let { componentData, sectionId, mode }: ScribeComponentProps<TextComponent> = $props();

    let value = $derived(parseStringForContentEditable(componentData.value.value));
    let isEmpty = $derived(componentData.value.value === '');

    function parseTokens(text: string) {
        const tokens = [];
        let currentText = '';
        let bold = false;
        let italic = false;
        let strikethrough = false;
        let underline = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            // If we find a backslash, we add the next character as a normal character to escape formatting
            if (char === '\\') {
                if (i + 1 < text.length) {
                    currentText += text[i + 1];
                    i++;
                } else {
                    currentText += char;
                }
                continue;
            }

            // Toggle formatting states when we encounter formatting characters
            if (char === BOLD_CHAR) {
                if (currentText) tokens.push({ text: currentText, bold, italic, strikethrough, underline });
                currentText = '';
                bold = !bold;
            } else if (char === ITALIC_CHAR) {
                if (currentText) tokens.push({ text: currentText, bold, italic, strikethrough, underline });
                currentText = '';
                italic = !italic;
            } else if (char === STRIKETHROUGH_CHAR) {
                if (currentText) tokens.push({ text: currentText, bold, italic, strikethrough, underline });
                currentText = '';
                strikethrough = !strikethrough;
            } else if (char === UNDERLINE_CHAR) {
                if (currentText) tokens.push({ text: currentText, bold, italic, strikethrough, underline });
                currentText = '';
                underline = !underline;
            } else {
                currentText += char;
            }
        }
        if (currentText || tokens.length === 0) {
            tokens.push({ text: currentText, bold, italic, strikethrough, underline });
        }

        return tokens;
    }

    function parseDOM(node: Node): string {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.textContent || '';
            // Scape special characters to prevent them from being interpreted as formatting when we parse the string again
            text = text.replace(/([\\*_~+])/g, '\\$1');
            return text;
        } else if (node.nodeName === 'BR') {
            return '\n';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            let childText = '';
            for (const child of Array.from(el.childNodes)) {
                childText += parseDOM(child);
            }
            
            // When we find a span, we check the formatting classes
            if (el.tagName === 'SPAN') {
                const isBold = el.classList.contains('is-bold');
                const isItalic = el.classList.contains('is-italic');
                const isStrikethrough = el.classList.contains('is-strikethrough');
                const isUnderline = el.classList.contains('is-underline');
                
                // If the span has any class we wrap the text with the corresponding characters
                if (isBold || isItalic || isStrikethrough || isUnderline) {
                    let prefix = '';
                    let suffix = '';
                    if (isBold) { prefix += BOLD_CHAR; suffix = BOLD_CHAR + suffix; }
                    if (isItalic) { prefix += ITALIC_CHAR; suffix = ITALIC_CHAR + suffix; }
                    if (isStrikethrough) { prefix += STRIKETHROUGH_CHAR; suffix = STRIKETHROUGH_CHAR + suffix; }
                    if (isUnderline) { prefix += UNDERLINE_CHAR; suffix = UNDERLINE_CHAR + suffix; }
                    return prefix + childText + suffix;
                }
            }
            return childText;
        }
        return '';
    }

    function handleTextChange(event: Event & { currentTarget: EventTarget & HTMLSpanElement; }) {
        if (!isDirty || isEmpty) return;
        const target = event.target as HTMLSpanElement;
        
        if (!target.isConnected) return;
        
        let newContent = '';
        for (const child of Array.from(target.childNodes)) {
            newContent += parseDOM(child);
        }

        isDirty = false;

        if (newContent === componentData.value.value) return;

        const newValue: StringValue = { type: 'string', value: newContent };
        const success = editStore.setComponentValue(sectionId, componentData.id, newValue);
        
        // If the component is not found, we can assume it is a blank space
        if (!success) {
            // We add a new text component with the value and remove the ghost component
            const newId = editStore.addComponent(sectionId, null, 'text', false, newValue);
            if (typeof newId === 'string') {
                // Clear the ghost component UI visually
                target.innerText = '';
                isEmpty = true;
            }
        }
    }

    function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLSpanElement; }) {
        const selection = getSelection(textDiv);
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
                    navigateToAdjacentComponent(target, 'left');
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
                    navigateToAdjacentComponent(target, 'right');
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

                // First blur the contenteditable to trigger to save the current text
                target.blur();

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

    let isDirty = false;

    function handleInput(event: Event) {
        const target = event.target as HTMLSpanElement;
        isEmpty = (target.textContent || '').length === 0;
        isDirty = true;
    }

    function handleSelectionChange(event?: Event) {
        // If the event is triggered by a click inside the toolbar, we ignore it to prevent the toolbar from closing immediately after opening
        if (event && typeof event.composedPath === 'function') {
            const path = event.composedPath();
            const insideToolbar = path.some(el => el instanceof HTMLElement && (el.matches('.text-toolbar-container') || el.closest('.text-toolbar-container')));
            if (insideToolbar) {
                return;
            }
        }

        const selection = getSelection(textDiv);
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            if (textFormatToolbarStore.componentId === componentData.id) {
                textFormatToolbarStore.close();
            }
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
            textFormatToolbarStore.open(rect.x + window.scrollX, rect.top + window.scrollY, sectionId, componentData.id, selectionRange);
        }
    }

    let textDiv: HTMLSpanElement | null = $state(null);

    function handleFocusStart() {
        if (!textDiv) return;
        textDiv.focus();
        
        // Move cursor to the start
        const selection = getSelection(textDiv);
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
        const selection = getSelection(textDiv);
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

    /**
     * Restores the native DOM text selection using absolute string indices, useful when the component is re rendered
     * and the selection is lost
     */
    function restoreSelection(element: HTMLElement, start: number, end: number) {
        let currentPos = 0;
        let startNode: Node | null = null;
        let startOffset = 0;
        let endNode: Node | null = null;
        let endOffset = 0;

        function traverse(node: Node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const length = node.textContent?.length || 0;
                
                // If the target start index falls within this text node, calculate its exact offset
                if (!startNode && start <= currentPos + length) {
                    startNode = node;
                    startOffset = Math.max(0, start - currentPos);
                }
                
                // If the target end index falls within this text node, calculate its exact offset
                if (!endNode && end <= currentPos + length) {
                    endNode = node;
                    endOffset = Math.max(0, end - currentPos);
                }
                currentPos += length;
            } else if (node.nodeName === 'BR') {
                // A <br> visually counts as 1 character (newline)
                const length = 1;
                
                // We cannot select inside a <br>. Instead, we select its parent and use the <br>'s child index as the offset.
                if (!startNode && start <= currentPos + length) {
                    startNode = node.parentNode;
                    const index = Array.from(node.parentNode!.childNodes).indexOf(node as ChildNode);
                    startOffset = start === currentPos ? index : index + 1;
                }
                if (!endNode && end <= currentPos + length) {
                    endNode = node.parentNode;
                    const index = Array.from(node.parentNode!.childNodes).indexOf(node as ChildNode);
                    endOffset = end === currentPos ? index : index + 1;
                }
                currentPos += length;
            } else {
                // For other elements (like spans), recursively traverse their children
                for (const child of Array.from(node.childNodes)) {
                    traverse(child);
                    // Optimization: stop traversing if both start and end nodes have been found
                    if (startNode && endNode) return;
                }
            }
        }

        traverse(element);

        // Apply the calculated nodes and offsets to the native DOM Selection API
        if (startNode && endNode) {
            element.focus();
            const range = document.createRange();
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
            const selection = getSelection(element);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    }

    $effect(() => {
        // When value changes and textDiv is recreated, we restore the selection if the toolbar is still open for this component
        if (textDiv && textFormatToolbarStore.isOpen && textFormatToolbarStore.componentId === componentData.id && textFormatToolbarStore.selectionRange) {
            restoreSelection(textDiv, textFormatToolbarStore.selectionRange.start, textFormatToolbarStore.selectionRange.end);
        }
    });
</script>

<svelte:document
    onpointerup={mode === 'edit' ? handleSelectionChange : undefined}
    onkeyup={mode === 'edit' ? handleSelectionChange : undefined}
/>

{#key value}
    <span 
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
        onkeydown={handleKeyDown}
    >
        {#each value as line, index (`${componentData.id}-${index}`)}
            {#if line === ''}
                <br>
            {:else}
                {#each parseTokens(line) as token, index (index)}
                    <span 
                        class:is-bold={token.bold} 
                        class:is-italic={token.italic} 
                        class:is-underline={token.underline} 
                        class:is-strikethrough={token.strikethrough}
                    >{token.text}</span>
                {/each}
            {/if}
        {/each}
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
