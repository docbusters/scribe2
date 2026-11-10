<script lang="ts">
    import type { ScribeComponentProps } from '../../registry/ComponentRegistry.ts';
	import type { TextComponent } from '../../domain/components/DefaultComponents.ts';
	import type { GhostComponentMeta } from '../../domain/components/Component.ts';
	import type { StringValue } from '../../domain/data/DataValue.ts';
	import { editStore } from '../../stores/edit-store.svelte.ts';
	import { toolbarStore, type ToolbarInsertion, type ToolbarInsertionMode, type ToolbarSplitData } from '../../stores/toolbar-store.svelte.ts';
	import { selectionStore } from '../../stores/selection-store.svelte.ts';
	import { parseStringForContentEditable } from '../../utils/parseStringForContentEditable.ts';
    import { handleArrowNavigation, navigateToAdjacentComponent, setupFocusListeners } from '../../utils/focusNavigation.ts';
	import { textFormatStore } from '../../stores/text-format-store.svelte.ts';
	import { getFormatsInRange, toggleTextFormat, type TextFormatCommand, type TextFormats } from '../../utils/textFormat.ts';
	import { escapeSpecialChars } from '../../utils/textFormatEscape.ts';
	import { BOLD_CHAR, ITALIC_CHAR, STRIKETHROUGH_CHAR, UNDERLINE_CHAR } from '../../constants/DocumentConstants.ts';
	import { getSelection } from '../../utils/selection.ts';
	import { getI18n } from '../../i18n/i18n.svelte.js';

    type GhostTextComponent = TextComponent & Partial<GhostComponentMeta>;

    // The classes that render each format. parseDOM reads them back to save a text
    const FORMAT_CLASSES: Record<TextFormatCommand, string> = {
        bold: 'is-bold',
        italic: 'is-italic',
        underline: 'is-underline',
        strikethrough: 'is-strikethrough'
    };
    const FORMAT_KEYS = Object.keys(FORMAT_CLASSES) as TextFormatCommand[];

    const SHORTCUT_FORMATS: Record<string, TextFormatCommand> = { b: 'bold', i: 'italic', u: 'underline' };

    let { componentData, sectionId, mode }: ScribeComponentProps<GhostTextComponent> = $props();
    const i18n = getI18n();

    let rawValue = $derived(componentData.value.value);
    let value = $derived(parseStringForContentEditable(rawValue));
    let isEmpty = $derived(rawValue === '');

    // A ghost is a placeholder to write in, it is not part of the document until it has content
    let isGhost = $derived(componentData.id.startsWith('__ghost'));

    // The ghost of an empty section has no neighbour, so it is the only place to write and always shows a hint
    let isSectionPlaceholder = $derived(isGhost && !componentData.insertAfterId && !componentData.insertBeforeId);

    /**
     * Where a component is inserted when this text is empty. A ghost is not part of the document, so it inserts relative
     * to its neighbour (null when the section is empty), while an empty persisted text is replaced by the new component
     */
    let emptySlot = $derived.by(() => {
        const insertionMode: ToolbarInsertionMode = isGhost ? (componentData.insertBeforeId ? 'before' : 'after') : 'replace';
        const targetId = isGhost ? (componentData.insertAfterId ?? componentData.insertBeforeId ?? null) : componentData.id;
        return { targetId, insertionMode };
    });

    /** A ghost or an empty text holds no component, so toolbars need to know the caret is in a place where a component can be inserted */
    function selectInsertionPoint() {
        selectionStore.selectInsertionPoint(sectionId, componentData.id);
    }

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
            // Escape special characters to prevent them from being interpreted as formatting when we parse the string again
            return escapeSpecialChars(node.textContent || '');
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

    /**
     * Creates a text component with the value of a ghost, next to the neighbour the ghost is placed by.
     * Returns the id of the new text, or null if it could not be created
     */
    function createTextFromGhost(newValue: StringValue): string | null {
        const insertBeforeId = componentData.insertBeforeId ?? null;
        const insertAfterId = componentData.insertAfterId ?? null;

        if (insertBeforeId) {
            const res = editStore.insertComponent(sectionId, insertBeforeId, 'text', {
                mode: 'before',
                overrideValue: newValue
            });
            return res?.newId ?? null;
        }
        return editStore.addComponent(sectionId, insertAfterId, 'text', false, newValue);
    }

    function handleTextChange(event: Event & { currentTarget: EventTarget & HTMLSpanElement; }) {
        if (!isDirty) return;
        const target = event.target as HTMLSpanElement;

        if (!target.isConnected) return;

        if (isEmpty) {
            isDirty = false;
            // The user cleared the text of a persisted component: remove it, as Backspace on an empty text does.
            // Ghost components (and persisted ones that were already empty) have nothing to delete.
            if (!componentData.id.startsWith('__ghost') && componentData.value.value !== '') {
                editStore.deleteComponent(sectionId, componentData.id);
            }
            return;
        }

        const newContent = readEditableContent(target);

        isDirty = false;

        if (newContent === componentData.value.value) return;

        const newValue: StringValue = { type: 'string', value: newContent };
        const success = editStore.setComponentValue(sectionId, componentData.id, newValue);

        // If the component is not found, we can assume it is a blank space
        if (!success) {
            const newId = createTextFromGhost(newValue);

            if (typeof newId === 'string') {
                // Clear the ghost component UI visually
                target.innerText = '';
                isEmpty = true;
            }
        }
    }

    /** Reads the content of an editable as the markdown string stored in the text component */
    function readEditableContent(element: HTMLElement): string {
        let content = '';
        for (const child of Array.from(element.childNodes)) {
            content += parseDOM(child);
        }
        return content;
    }

    /**
     * Saves what has been typed in a ghost as a text of the document, so it can be split like any other text.
     * Returns the id of the new text, or null if this is not a ghost or the text could not be created
     */
    function saveTypedGhost(): string | null {
        if (!isGhost || !textDiv) return null;

        const newId = createTextFromGhost({ type: 'string', value: readEditableContent(textDiv) });
        if (newId === null) return null;

        // The text is already saved, so it must not be saved again when the element loses the focus
        isDirty = false;
        return newId;
    }

    /**
     * Describes where a component would be inserted at the caret of this text, or null if the caret is not inside it.
     * A ghost with typed content is not part of the document yet, so its text is created here to have a text to split.
     */
    function captureInsertionAtCaret(): { insertion: ToolbarInsertion; caretRect: DOMRect } | null {
        const target = textDiv;
        if (!target?.isConnected) return null;

        const selection = getSelection(target);
        if (!selection || selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0);
        if (!target.contains(range.startContainer)) return null;

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

        // Capture formatted text fragments before and after the caret
        let formattedBefore = '';
        for (const child of Array.from(preRange.cloneContents().childNodes)) {
            formattedBefore += parseDOM(child);
        }

        let formattedAfter = '';
        for (const child of Array.from(postRange.cloneContents().childNodes)) {
            formattedAfter += parseDOM(child);
        }

        const isActuallyEmpty = isEmpty || (isAtStart && isAtEnd);

        // The position of the caret is measured now, as creating the text below replaces the element
        let caretRect = range.getBoundingClientRect();

        // If the element is empty the position is based on the element's bounding rect
        if (caretRect.x === 0 && caretRect.y === 0) {
            caretRect = target.getBoundingClientRect();
        }

        let targetId = emptySlot.targetId;
        // Finds the element that holds the caret again, as it can be replaced when a ghost becomes a text component
        let findCaretElement = (): HTMLElement | null => target;

        if (isGhost && !isActuallyEmpty) {
            const newId = saveTypedGhost();
            if (newId === null) return null;

            targetId = newId;

            const scope: ParentNode = target.closest('.scribe-document') ?? document;
            findCaretElement = () => scope.querySelector<HTMLElement>(`[data-component-id="${CSS.escape(newId)}"]`);
        }

        let insertionMode: ToolbarInsertionMode;
        let splitData: ToolbarSplitData | undefined = undefined;

        if (isActuallyEmpty) {
            insertionMode = emptySlot.insertionMode;
        } else if (isAtStart) {
            insertionMode = 'before';
            splitData = {
                textBefore: '',
                textAfter: formattedAfter
            };
        } else if (isAtEnd) {
            insertionMode = 'after';
            splitData = {
                textBefore: formattedBefore,
                textAfter: ''
            };
        } else {
            insertionMode = 'split';
            splitData = {
                textBefore: formattedBefore,
                textAfter: formattedAfter
            };
        }

        // Record the exact cursor character offset for restoration if the user cancels the insertion
        const caretOffset = textBefore.length;
        const restoreFocus = () => {
            const element = findCaretElement();
            if (element) {
                restoreSelection(element, caretOffset, caretOffset);
            }
        };

        return {
            insertion: { targetId, isEmpty: isActuallyEmpty, insertionMode, splitData, restoreFocus },
            caretRect
        };
    }

    function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLSpanElement; }) {
        const selection = getSelection(textDiv);
        if (!selection || selection.rangeCount === 0) return;

        const target = event.currentTarget;
        const range = selection.getRangeAt(0);

        if (handleArrowNavigation(event, target)) {
            return;
        }

        // Ctrl/Cmd + B, I and U do what the format buttons do. Left to the browser they would insert tags that are not part of the format
        if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey) {
            const command = SHORTCUT_FORMATS[event.key.toLowerCase()];
            if (command) {
                event.preventDefault();
                // The state is read again, as the selection may have changed since the last selectionchange was handled
                syncFormatState();
                textFormatStore.toggle(command);
                return;
            }
        }

        switch (event.key) {
            case 'Backspace': {
                // Line breaks count as content, so Backspace first removes them natively
                if (isEditableEmpty(target)) {
                    event.preventDefault();
                    // Navigate to the previous focusable element
                    navigateToAdjacentComponent(target, 'left');
                    // Delete the component if it was a real persisted component in section.content
                    if (componentData.id && !componentData.id.startsWith('__ghost')) {
                        editStore.deleteComponent(sectionId, componentData.id);
                    }
                }
                break;
            }
            case 'Delete': {
                const postRange = range.cloneRange();
                postRange.selectNodeContents(target);
                postRange.setStart(range.endContainer, range.endOffset);

                if (postRange.toString().length === 0) {
                    // Try to delete br at the end of the contenteditable, as contenteditable adds an extra <br>
                    if (target.lastElementChild?.tagName === 'BR') {
                        target.lastElementChild.remove();
                        event.preventDefault();
                    }
                }
                break;
            }
            case ' ': {
                if (!event.ctrlKey) return;
                event.preventDefault(); // Prevent adding an actual space character

                // Do not blur the target here so that the DOM and selection remain intact if the user cancels with ESC
                const captured = captureInsertionAtCaret();
                if (!captured) return;

                // Show the add component dropdown
                toolbarStore.openForInsertion(captured.caretRect.x, captured.caretRect.bottom, sectionId, captured.insertion);
                break;
            }
        }
    }

    let isDirty = false;

    /**
     * Whether an editable has no content. A single <br> is only the filler that browsers leave in an emptied
     * editable, but two or more mean the user has inserted a line break, which is content even without text.
     */
    function isEditableEmpty(element: HTMLElement): boolean {
        return (element.textContent ?? '').length === 0 && element.querySelectorAll('br').length <= 1;
    }

    function handleInput(event: Event) {
        const target = event.target as HTMLSpanElement;
        isEmpty = isEditableEmpty(target);
        isDirty = true;
    }

    function handleFocus() {
        // Toolbars insert components at the caret of the text that has the focus
        selectionStore.setCaretSource(componentData.id, () => captureInsertionAtCaret()?.insertion ?? null);

        // A ghost has no component to select, even when it already holds typed text that is not saved yet
        if (isGhost || isEmpty) {
            selectInsertionPoint();
        }
    }

    /** The formats a character typed at the given node would inherit, which are the ones of the formatted spans around it */
    function getFormatsAt(node: Node | null): TextFormats {
        const formats: TextFormats = { bold: false, italic: false, underline: false, strikethrough: false };
        for (let current = node; current && current !== textDiv; current = current.parentNode) {
            if (current.nodeType !== Node.ELEMENT_NODE) continue;
            const classList = (current as Element).classList;
            for (const key of FORMAT_KEYS) {
                if (classList.contains(FORMAT_CLASSES[key])) formats[key] = true;
            }
        }
        return formats;
    }

    /**
     * Tells the format store where the caret or the marked fragment is when it is in this text, so the format options
     * act on it and show its formats. Every text component runs this on every change of the selection of the document,
     * so it leaves early unless the selection is in this text or this text owns the format state
     */
    function syncFormatState() {
        if (mode !== 'edit' || !textDiv) return;

        const selection = getSelection(textDiv);
        if (!selection || selection.rangeCount === 0 || !textDiv.contains(selection.anchorNode)) {
            if (textFormatStore.componentId === componentData.id) {
                textFormatStore.clear();
            }
            return;
        }

        const range = selection.getRangeAt(0);

        if (selection.isCollapsed) {
            textFormatStore.setCaret(sectionId, componentData.id, getFormatsAt(range.startContainer), { node: range.startContainer, offset: range.startOffset });
            return;
        }

        // Calculate the selected text indexes
        const preRange = range.cloneRange();
        preRange.selectNodeContents(textDiv);
        preRange.setEnd(range.startContainer, range.startOffset);

        const startIndex = preRange.toString().length;
        const selectedText = range.toString();
        const endIndex = startIndex + selectedText.length;

        textFormatStore.setSelection(
            sectionId,
            componentData.id,
            { start: startIndex, end: endIndex, text: selectedText },
            getFormatsInRange(readEditableContent(textDiv), startIndex, endIndex),
            formatSelection
        );
    }

    /** Replaces the content of the editable with what the template renders for a text, so it can be rewritten without recreating the editable */
    function renderContent(element: HTMLElement, markdown: string) {
        const nodes: Node[] = [];
        for (const line of parseStringForContentEditable(markdown)) {
            if (line === '') {
                nodes.push(document.createElement('br'));
                continue;
            }

            for (const token of parseTokens(line)) {
                const span = document.createElement('span');
                for (const key of FORMAT_KEYS) {
                    if (token[key]) span.classList.add(FORMAT_CLASSES[key]);
                }
                span.textContent = token.text;
                nodes.push(span);
            }
        }
        element.replaceChildren(...nodes);
    }

    /**
     * Toggles a format on the marked fragment. The editable is the working copy until the text loses the focus (as when typing),
     * so the fragment is rewritten there and marked again. The editable keeps the focus, and a text that is not in the document
     * yet needs no special treatment: it is saved on blur like any other change
     */
    function formatSelection(command: TextFormatCommand) {
        const marked = textFormatStore.selectionRange;
        if (!textDiv || !marked) return;

        const content = toggleTextFormat(readEditableContent(textDiv), marked.start, marked.end, command, textFormatStore.activeFormats[command]);
        renderContent(textDiv, content);
        restoreSelection(textDiv, marked.start, marked.end);
        isDirty = true;

        // The formats of the fragment have changed, and the options show them
        syncFormatState();
    }

    /**
     * Types with a pending format: the first character is inserted as a formatted span, split from the text around it,
     * and the caret is left inside it so the rest is typed natively with the same format. The editable is the working copy
     * until the text loses the focus, so nothing else has to change for it to be saved
     */
    function insertFormattedText(element: HTMLElement, selection: Selection, text: string, formats: TextFormats) {
        // An empty editable only holds the filler line break of browsers, which would end up after the typed text
        if (isEditableEmpty(element)) {
            element.querySelectorAll('br').forEach(br => br.remove());
        }

        // Splits everything from the caret on, so the new text can go between both halves. Spans that cross the caret are cloned
        const caret = selection.getRangeAt(0);
        const tail = document.createRange();
        tail.setStart(caret.startContainer, caret.startOffset);
        tail.setEnd(element, element.childNodes.length);
        const tailContent = tail.extractContents();

        const textNode = document.createTextNode(text);
        let inserted: Node = textNode;
        if (FORMAT_KEYS.some(key => formats[key])) {
            const span = document.createElement('span');
            for (const key of FORMAT_KEYS) {
                if (formats[key]) span.classList.add(FORMAT_CLASSES[key]);
            }
            span.append(textNode);
            inserted = span;
        }
        element.append(inserted, tailContent);

        // Splitting at the edge of a span leaves an empty clone of it
        for (const child of Array.from(element.children)) {
            if (child !== inserted && child.tagName === 'SPAN' && child.textContent === '' && !child.querySelector('br')) {
                child.remove();
            }
        }

        if (inserted instanceof HTMLElement) {
            mergeWithSameFormat(inserted);
        }

        selection.collapse(textNode, textNode.length);
        isEmpty = false;
        isDirty = true;
    }

    /** Joins a formatted span with the spans next to it that have exactly its format, so the saved text has no redundant toggles */
    function mergeWithSameFormat(span: HTMLElement) {
        const getFormatKey = (el: Element) => FORMAT_KEYS.filter(key => el.classList.contains(FORMAT_CLASSES[key])).join();
        const isSameFormat = (node: Node | null): node is HTMLElement =>
            node instanceof HTMLElement && node.tagName === 'SPAN' && getFormatKey(node) === getFormatKey(span);

        const next = span.nextSibling;
        if (isSameFormat(next)) {
            span.append(...Array.from(next.childNodes));
            next.remove();
        }

        const previous = span.previousSibling;
        if (isSameFormat(previous)) {
            previous.append(...Array.from(span.childNodes));
            span.remove();
        }
    }

    function handleBeforeInput(event: InputEvent) {
        const pending = textFormatStore.componentId === componentData.id ? textFormatStore.pending : null;
        if (!pending || event.inputType !== 'insertText' || !event.data || !textDiv) return;

        const selection = getSelection(textDiv);
        if (!selection || selection.rangeCount === 0 || !selection.isCollapsed || !textDiv.contains(selection.anchorNode)) return;

        event.preventDefault();
        insertFormattedText(textDiv, selection, event.data, pending);
        textFormatStore.consumePending();
    }

    let textDiv: HTMLSpanElement | null = $state(null);

    $effect(() => {
        if (!textDiv) return;
        return setupFocusListeners(textDiv);
    });

    /**
     * Marks a fragment of the editable again using absolute string indices, useful when its content is rewritten
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

    // A text that is destroyed (for example deleted) must not leave a marked fragment behind
    $effect(() => () => {
        if (textFormatStore.componentId === componentData.id) {
            textFormatStore.clear();
        }
    });
</script>

<svelte:document onselectionchange={mode === 'edit' ? syncFormatState : undefined} />

<!-- Keyed by the raw string, not the parsed array: the parent recreates ghost components on every recompute,
     which would produce a new array each time and destroy the span that has just received focus -->
{#key rawValue}
    <!-- The role and tabindex only exist in edit mode, where the span is an editable textbox -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <span
        bind:this={textDiv}
        data-scribe-focusable={mode === 'edit' ? 'true' : undefined}
        data-component-id={componentData.id}
        role={mode === 'edit' ? 'textbox' : undefined}
        tabindex={mode === 'edit' ? 0 : undefined}
        class="edit-text" 
        class:is-empty={isEmpty && mode === 'edit'}
        class:is-section-placeholder={isSectionPlaceholder && mode === 'edit'}
        class:is-ghost={componentData.id.startsWith('__ghost') && mode === 'edit'}
        class:is-between-blocks={componentData.isBetweenBlocks}
        class:is-inline-slot={!!componentData.insertBeforeId && !componentData.isBetweenBlocks && mode === 'edit'}
        data-placeholder={isSectionPlaceholder ? i18n.t('editor.emptySectionPlaceholder') : undefined}
        contenteditable={mode === 'edit'} 
        onfocus={mode === 'edit' ? handleFocus : undefined}
        onblur={handleTextChange} 
        onbeforeinput={mode === 'edit' ? handleBeforeInput : undefined}
        oninput={handleInput}
        onkeydown={mode === 'edit' ? handleKeyDown : undefined}
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
        cursor: text;
    }

    /* An empty inline-block has no line of its own, so its caret would not line up with the text around it and its height
       would not match a line. A zero-width space (generated, so it is not part of the content) gives it one line, with the
       baseline and height of the surrounding text. The other slots draw their own content or have their own height */
    .edit-text.is-empty:not(.is-between-blocks):not(.is-section-placeholder)::before {
        content: '\200b';
    }

    .edit-text.is-ghost {
        cursor: text;
    }

    /* Unfocused inline ghosts only reserve a sliver of space, so the slots around inline components
       add no visible gap. They keep a non zero width so keyboard navigation can still reach them.
       Slots placed before another component keep that width even when focused, so the caret can
       enter them without shifting the component that follows */
    .edit-text.is-ghost.is-empty:not(:focus):not(.is-between-blocks),
    .edit-text.is-inline-slot.is-empty {
        min-width: 2px;
    }

    /* The only place to write in an empty section: full width, with a hint that is visible even without focus */
    .edit-text.is-section-placeholder.is-empty {
        display: block;
        width: 100%;
        min-height: 1.5rem;
    }

    .edit-text.is-section-placeholder.is-empty::before {
        content: attr(data-placeholder);
        float: left;
        height: 0;
        color: var(--scribe-muted-foreground);
        pointer-events: none;
        user-select: none;
        white-space: nowrap;
    }

    .edit-text.is-between-blocks {
        width: 100%;
        min-height: 1.75rem;
        display: flex;
        align-items: center;
        cursor: text;
    }

    /* Global inside the text, because spans created by hand when typing with a pending format do not carry the class that scopes these styles */
    .edit-text :global(.is-bold) {
        font-weight: var(--scribe-font-weight-bold);
    }

    .edit-text :global(.is-italic) {
        font-style: italic;
    }

    .edit-text :global(.is-underline) {
        text-decoration: underline;
    }

    .edit-text :global(.is-strikethrough) {
        text-decoration: line-through;
    }
</style>
